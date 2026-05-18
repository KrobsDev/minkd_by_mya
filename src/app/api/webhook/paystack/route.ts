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

  // Paystack sometimes serializes metadata as a JSON string in webhook payloads.
  // Normalize to an object so booking_id can be read consistently.
  const readMetadata = (raw: unknown): Record<string, unknown> => {
    if (!raw) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw as Record<string, unknown>;
  };

  // Handle different event types
  if (event.event === "charge.success") {
    const data = event.data;

    const supabase = await createServiceClient();

    const metadata = readMetadata(data.metadata);
    const bookingId = metadata.booking_id as string | undefined;
    const serviceName = (metadata.service_name as string) || "Unknown Service";

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

    // Treat duplicate-reference (race with verify endpoint) as success;
    // surface anything else so Paystack retries.
    if (transactionError && transactionError.code !== "23505") {
      console.error(
        `[webhook] Error recording transaction for reference=${data.reference}:`,
        transactionError
      );
      return NextResponse.json(
        { error: "Failed to record transaction" },
        { status: 500 }
      );
    }

    // If we have a booking ID, update the booking status
    if (bookingId) {
      const { data: updated, error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          paystack_reference: data.reference,
          status: "confirmed",
        })
        .eq("id", bookingId)
        .select("id");

      if (bookingError) {
        console.error(
          `[webhook] Error updating booking ${bookingId} for reference=${data.reference}:`,
          bookingError
        );
        return NextResponse.json(
          { error: "Failed to update booking" },
          { status: 500 }
        );
      }

      if (!updated || updated.length === 0) {
        console.error(
          `[webhook] Booking ${bookingId} not found for reference=${data.reference}`
        );
      }
    } else {
      console.warn(
        `[webhook] charge.success had no booking_id in metadata for reference=${data.reference}`
      );
    }

    return NextResponse.json({ received: true });
  }

  if (event.event === "charge.failed") {
    const data = event.data;
    const metadata = readMetadata(data.metadata);
    const bookingId = metadata.booking_id as string | undefined;

    const supabase = await createServiceClient();

    // Record the failed transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      booking_id: bookingId || null,
      paystack_reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      status: "failed",
      customer_email: data.customer?.email || "unknown",
      service_name: (metadata.service_name as string) || "Unknown Service",
      metadata: data,
    });

    if (transactionError && transactionError.code !== "23505") {
      console.error(
        `[webhook] Error recording failed transaction for reference=${data.reference}:`,
        transactionError
      );
      return NextResponse.json(
        { error: "Failed to record transaction" },
        { status: 500 }
      );
    }

    // Update booking if exists
    if (bookingId) {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
        })
        .eq("id", bookingId);

      if (bookingError) {
        console.error(
          `[webhook] Error marking booking ${bookingId} failed for reference=${data.reference}:`,
          bookingError
        );
        return NextResponse.json(
          { error: "Failed to update booking" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  }

  // Acknowledge other events
  return NextResponse.json({ received: true });
}