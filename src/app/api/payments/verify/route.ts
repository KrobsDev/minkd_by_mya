import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmails } from "@/lib/email/send";
import { format } from "date-fns";

export async function POST(request: Request) {
  const body = await request.json();
  const { reference, bookingId } = body;

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
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
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

  // Get booking ID from metadata if not provided
  const resolvedBookingId = bookingId || paymentData.metadata?.booking_id;

  if (resolvedBookingId) {
    // Update booking status
    const { data: updatedBooking, error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        paystack_reference: reference,
        status: "confirmed",
      })
      .eq("id", resolvedBookingId)
      .select(`
        *,
        services:service_id (
          name
        )
      `)
      .single();

    if (bookingError) {
      console.error("Error updating booking:", bookingError);
    }

    // Send confirmation emails after payment is verified
    if (updatedBooking && !bookingError) {
      const formattedDate = format(
        new Date(updatedBooking.appointment_date),
        "EEEE, MMMM d, yyyy"
      );
      const formattedTime = format(
        new Date(`2000-01-01T${updatedBooking.appointment_time}`),
        "h:mm a"
      );

      const emailResult = await sendBookingConfirmationEmails({
        customerName: updatedBooking.customer_name,
        customerEmail: updatedBooking.customer_email,
        customerPhone: updatedBooking.customer_phone,
        serviceName: updatedBooking.services?.name || "Service",
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        bookingReference: updatedBooking.id.slice(0, 8).toUpperCase(),
      });

      if (emailResult.skipped) {
        console.warn("⚠️  Emails skipped:", emailResult.error);
      } else if (!emailResult.success) {
        console.error("❌ Email sending failed:", emailResult.error);
      } else {
        console.log("✅ Emails sent after payment verification");
      }
    }
  }

  // Record transaction (if not already recorded by webhook)
  const { data: existingTransaction } = await supabase
    .from("transactions")
    .select("id")
    .eq("paystack_reference", reference)
    .single();

  if (!existingTransaction) {
    await supabase.from("transactions").insert({
      booking_id: resolvedBookingId || null,
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