import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // Verify webhook signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.error("Invalid Paystack signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle different event types
  if (event.event === "charge.success") {
    const data = event.data;

    const supabase = await createServiceClient();

    // Extract metadata
    const metadata = data.metadata || {};
    const bookingId = metadata.booking_id;
    const serviceName = metadata.service_name || "Unknown Service";

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        booking_id: bookingId || null,
        paystack_reference: data.reference,
        amount: data.amount / 100, // Paystack sends amount in kobo/pesewas
        currency: data.currency,
        status: "success",
        customer_email: data.customer?.email || "unknown",
        service_name: serviceName,
        metadata: data,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }

    // If we have a booking ID, update the booking status
    if (bookingId) {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          paystack_reference: data.reference,
          status: "confirmed",
        })
        .eq("id", bookingId);

      if (bookingError) {
        console.error("Error updating booking:", bookingError);
      }
    }

    return NextResponse.json({ received: true });
  }

  if (event.event === "charge.failed") {
    const data = event.data;
    const metadata = data.metadata || {};
    const bookingId = metadata.booking_id;

    const supabase = await createServiceClient();

    // Record the failed transaction
    await supabase.from("transactions").insert({
      booking_id: bookingId || null,
      paystack_reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      status: "failed",
      customer_email: data.customer?.email || "unknown",
      service_name: metadata.service_name || "Unknown Service",
      metadata: data,
    });

    // Update booking if exists
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
        })
        .eq("id", bookingId);
    }

    return NextResponse.json({ received: true });
  }

  // Acknowledge other events
  return NextResponse.json({ received: true });
}