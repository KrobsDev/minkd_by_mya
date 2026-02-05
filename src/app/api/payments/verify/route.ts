import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        paystack_reference: reference,
        status: "confirmed",
      })
      .eq("id", resolvedBookingId);

    if (bookingError) {
      console.error("Error updating booking:", bookingError);
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