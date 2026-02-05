import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmails } from "@/lib/email/send";
import { format } from "date-fns";

export async function GET() {
  const supabase = await createServiceClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services:service_id (
        name,
        price,
        duration_minutes
      )
    `,
    )
    .order("appointment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      notes,
    } = body;

    // Validate required fields
    if (
      !serviceId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (serviceError || !service) {
      console.log({ service, serviceError });
      return NextResponse.json(
        { error: "Service not founds" },
        { status: 404 },
      );
    }

    // Check if the time slot is available
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .neq("status", "cancelled")
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 },
      );
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("date", appointmentDate)
      .single();

    if (blockedDate) {
      return NextResponse.json(
        { error: "This date is not available for bookings" },
        { status: 409 },
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        service_id: serviceId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    // Format date and time for emails
    const formattedDate = format(
      new Date(appointmentDate),
      "EEEE, MMMM d, yyyy",
    );
    const formattedTime = format(
      new Date(`2000-01-01T${appointmentTime}`),
      "h:mm a",
    );

    // Send confirmation emails
    const emailResult = await sendBookingConfirmationEmails({
      customerName,
      customerEmail,
      customerPhone,
      serviceName: service.name,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      bookingReference: booking.id.slice(0, 8).toUpperCase(),
    });

    if (emailResult.skipped) {
      console.warn("⚠️  Emails skipped:", emailResult.error);
      console.warn("📧 To enable emails: Set SMTP_USER and SMTP_PASS in .env.local");
    } else if (!emailResult.success) {
      console.error("❌ Email sending failed:", emailResult.error);
    } else {
      console.log("✅ Emails sent successfully:", {
        customer: emailResult.customerEmailId,
        admin: emailResult.adminEmailId,
      });
    }

    return NextResponse.json({
      booking,
      emailSent: emailResult.success,
      paystackLink: service.paystack_link,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
