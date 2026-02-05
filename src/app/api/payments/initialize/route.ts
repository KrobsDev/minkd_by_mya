import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { bookingId } = body;

  if (!bookingId) {
    return NextResponse.json(
      { error: "Booking ID is required" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  // Get booking with service details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (
        id,
        name,
        price
      )
    `
    )
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!booking.services) {
    return NextResponse.json(
      { error: "Service not found for booking" },
      { status: 404 }
    );
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 500 }
    );
  }

  // Initialize transaction with Paystack
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: booking.customer_email,
      // Paystack expects amount in pesewas (kobo for NGN)
      amount: Math.round(booking.services.price * 100),
      currency: "GHS",
      reference: `booking_${bookingId}_${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/booking/success?bookingId=${bookingId}`,
      metadata: {
        booking_id: bookingId,
        service_id: booking.services.id,
        service_name: booking.services.name,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        appointment_date: booking.appointment_date,
        appointment_time: booking.appointment_time,
      },
    }),
  });

  const paystackResponse = await response.json();

  if (!paystackResponse.status) {
    console.error("Paystack initialization failed:", paystackResponse);
    return NextResponse.json(
      { error: paystackResponse.message || "Payment initialization failed" },
      { status: 400 }
    );
  }

  // Update booking with payment reference
  await supabase
    .from("bookings")
    .update({ paystack_reference: paystackResponse.data.reference })
    .eq("id", bookingId);

  return NextResponse.json({
    authorization_url: paystackResponse.data.authorization_url,
    access_code: paystackResponse.data.access_code,
    reference: paystackResponse.data.reference,
    amount: Math.round(booking.services.price * 100), // Amount in pesewas for frontend
  });
}