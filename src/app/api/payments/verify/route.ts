import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmails } from "@/lib/email/send";
import { createCalendarEvent } from "@/lib/calendar/google";
import { format } from "date-fns";

export async function POST(request: Request) {
  const body = await request.json();
  // bookingIds is an array for multi-service bookings; bookingId is the legacy single-booking field
  const { reference, bookingIds, bookingId } = body;

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    );
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 500 }
    );
  }

  // Verify transaction with Paystack
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
  );

  const paystackResponse = await response.json();

  if (!paystackResponse.status || paystackResponse.data.status !== "success") {
    return NextResponse.json(
      { error: "Payment verification failed", details: paystackResponse },
      { status: 400 }
    );
  }

  const paymentData = paystackResponse.data;
  const supabase = await createServiceClient();

  // Resolve IDs — support array (multi-service) and single (legacy/webhook)
  const resolvedIds: string[] = bookingIds?.length
    ? bookingIds
    : bookingId
      ? [bookingId]
      : paymentData.metadata?.booking_id
        ? [paymentData.metadata.booking_id]
        : [];

  if (resolvedIds.length === 0) {
    return NextResponse.json({ success: true, verified: true, amount: paymentData.amount / 100, currency: paymentData.currency });
  }

  // Confirm all bookings
  const { data: updatedBookings, error: bookingError } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      paystack_reference: reference,
      status: "confirmed",
    })
    .in("id", resolvedIds)
    .select(`
      *,
      services:service_id (
        name
      ),
      booking_services (
        services:service_id (
          name,
          duration_minutes
        )
      )
    `);

  if (bookingError) {
    console.error("Error updating bookings:", bookingError);
  }

  if (updatedBookings && updatedBookings.length > 0) {
    const first = updatedBookings[0];
    type BookingService = { services: { name: string; duration_minutes: number } | null };

    // booking_services contains all services for multi-service bookings
    const bookingServiceRows = (first.booking_services as unknown as BookingService[] | null) ?? [];
    const serviceNames = bookingServiceRows.length > 0
      ? bookingServiceRows.map((bs) => bs.services?.name).filter(Boolean).join(", ")
      : ((first.services as { name: string } | null)?.name ?? "Service");

    const totalDurationMinutes = bookingServiceRows.length > 0
      ? bookingServiceRows.reduce((sum, bs) => sum + (bs.services?.duration_minutes ?? 60), 0)
      : 60;

    const formattedDate = format(new Date(first.appointment_date), "EEEE, MMMM d, yyyy");
    const formattedTime = format(new Date(`2000-01-01T${first.appointment_time}`), "h:mm a");
    const bookingReference = first.id.slice(0, 8).toUpperCase();

    const emailResult = await sendBookingConfirmationEmails({
      customerName: first.customer_name,
      customerEmail: first.customer_email,
      customerPhone: first.customer_phone,
      serviceName: serviceNames,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      bookingReference,
    });

    if (emailResult.skipped) {
      console.warn("⚠️  Emails skipped:", emailResult.error);
    } else if (!emailResult.success) {
      console.error("❌ Email sending failed:", emailResult.error);
    } else {
      console.log("✅ Emails sent after payment verification");
    }

    const calendarResult = await createCalendarEvent({
      customerName: first.customer_name,
      customerEmail: first.customer_email,
      customerPhone: first.customer_phone,
      serviceName: serviceNames,
      appointmentDate: first.appointment_date,
      appointmentTime: first.appointment_time,
      bookingReference,
      durationMinutes: totalDurationMinutes,
      notes: first.notes ?? undefined,
    });

    if (!calendarResult.success) {
      console.error("❌ Google Calendar event failed:", calendarResult.error);
    } else {
      console.log("✅ Google Calendar event created:", calendarResult.eventId);
    }
  }

  // Record transaction
  const { data: existingTransaction } = await supabase
    .from("transactions")
    .select("id")
    .eq("paystack_reference", reference)
    .single();

  if (!existingTransaction) {
    await supabase.from("transactions").insert({
      booking_id: resolvedIds[0] || null,
      paystack_reference: reference,
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      status: "success",
      customer_email: paymentData.customer?.email || "unknown",
      service_name: paymentData.metadata?.service_name || "Unknown Service",
      metadata: paymentData,
    });
  }

  return NextResponse.json({
    success: true,
    verified: true,
    amount: paymentData.amount / 100,
    currency: paymentData.currency,
  });
}
