import { NextResponse } from "next/server";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { sendAppointmentReminderEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

type ReminderBooking = {
  id: string;
  customer_name: string;
  customer_email: string;
  appointment_date: string;
  appointment_time: string;
  services: { name: string } | null;
  booking_services:
    | {
        services: { name: string } | null;
      }[]
    | null;
};

function getTomorrowDateString(now = new Date()) {
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  return tomorrow.toISOString().slice(0, 10);
}

function formatAppointmentDate(date: string) {
  return format(new Date(`${date}T00:00:00+00:00`), "EEEE, MMMM d, yyyy");
}

function formatAppointmentTime(time: string) {
  return format(new Date(`2000-01-01T${time}+00:00`), "h:mm a");
}

function getServiceNames(booking: ReminderBooking) {
  const bookingServiceNames =
    booking.booking_services
      ?.map((bookingService) => bookingService.services?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  if (bookingServiceNames.length > 0) {
    return bookingServiceNames.join(", ");
  }

  return booking.services?.name ?? "Service";
}

function authorizeCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET must be configured in production" },
      { status: 500 },
    );
  }

  if (!authorizeCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const targetDate = getTomorrowDateString();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      customer_email,
      appointment_date,
      appointment_time,
      services:service_id (
        name
      ),
      booking_services (
        services:service_id (
          name
        )
      )
    `,
    )
    .eq("appointment_date", targetDate)
    .eq("status", "confirmed")
    .eq("payment_status", "paid")
    .is("reminder_24h_sent_at", null);

  if (error) {
    console.error("Failed to fetch appointment reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment reminders" },
      { status: 500 },
    );
  }

  const bookings = (data ?? []) as unknown as ReminderBooking[];

  const results = await Promise.all(
    bookings.map(async (booking) => {
      const emailResult = await sendAppointmentReminderEmail({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        serviceName: getServiceNames(booking),
        appointmentDate: formatAppointmentDate(booking.appointment_date),
        appointmentTime: formatAppointmentTime(booking.appointment_time),
        bookingReference: booking.id.slice(0, 8).toUpperCase(),
      });

      if (!emailResult.success || emailResult.skipped) {
        return {
          bookingId: booking.id,
          status: emailResult.skipped ? "skipped" : "failed",
          error: emailResult.error,
        };
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ reminder_24h_sent_at: new Date().toISOString() })
        .eq("id", booking.id)
        .is("reminder_24h_sent_at", null);

      if (updateError) {
        console.error(
          `Failed to mark reminder sent for booking ${booking.id}:`,
          updateError,
        );

        return {
          bookingId: booking.id,
          status: "failed",
          error: "Reminder sent but failed to mark as sent",
        };
      }

      return {
        bookingId: booking.id,
        status: "sent",
      };
    }),
  );

  const summary = results.reduce(
    (totals, result) => ({
      sent: totals.sent + (result.status === "sent" ? 1 : 0),
      skipped: totals.skipped + (result.status === "skipped" ? 1 : 0),
      failed: totals.failed + (result.status === "failed" ? 1 : 0),
    }),
    { sent: 0, skipped: 0, failed: 0 },
  );

  return NextResponse.json({
    targetDate,
    found: bookings.length,
    ...summary,
  });
}
