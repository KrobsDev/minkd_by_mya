import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { addDays, format, parse, startOfDay } from "date-fns";
import {
  DEFAULT_MAX_BOOKINGS_PER_SLOT,
  DEFAULT_CLOSING_TIME_MINUTES,
} from "@/lib/booking-constants";

// Default time slots if none are set in the database
const DEFAULT_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceDuration = parseInt(searchParams.get("duration") || "60", 10);

  const supabase = await createClient();

  // If specific date requested, get available slots for that date
  if (date) {
    // Check if the weekday is blocked
    const { data: weekdaySetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "blocked_weekdays")
      .single();

    if (weekdaySetting) {
      const blockedWeekdays = weekdaySetting.value as number[];
      const requestedDate = new Date(date + "T00:00:00");
      if (blockedWeekdays.includes(requestedDate.getDay())) {
        return NextResponse.json({ slots: [], blocked: true });
      }
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("date", date)
      .single();

    if (blockedDate) {
      return NextResponse.json({ slots: [], blocked: true });
    }

    // Fetch admin-configurable settings in parallel
    const [{ data: closingTimeSetting }, { data: maxBookingsSetting }] =
      await Promise.all([
        supabase.from("settings").select("value").eq("key", "closing_time").single(),
        supabase.from("settings").select("value").eq("key", "max_bookings_per_slot").single(),
      ]);

    let closingTimeMinutes = DEFAULT_CLOSING_TIME_MINUTES;
    if (closingTimeSetting?.value) {
      const [h, m] = (closingTimeSetting.value as string).split(":").map(Number);
      closingTimeMinutes = h * 60 + (m || 0);
    }

    const maxBookingsPerSlot =
      typeof maxBookingsSetting?.value === "number"
        ? maxBookingsSetting.value
        : DEFAULT_MAX_BOOKINGS_PER_SLOT;

    // Get custom availability for this date
    const { data: availability } = await supabase
      .from("availability")
      .select("*")
      .eq("date", date)
      .eq("is_available", true);

    // Get existing bookings for this date, including ALL services per booking
    // so we can accurately compute each booking's total occupied duration.
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        "appointment_time, booking_services(services:service_id(duration_minutes))"
      )
      .eq("appointment_date", date)
      .neq("status", "cancelled");

    // Build accurate time ranges using total multi-service duration per booking
    const bookedRanges: { start: number; end: number }[] = (bookings || []).map(
      (b) => {
        const startTime = parse(b.appointment_time, "HH:mm:ss", new Date());
        const startMinutes =
          startTime.getHours() * 60 + startTime.getMinutes();

        // Sum durations of all services in this booking
        const bookingServices = b.booking_services as {
          services: { duration_minutes: number } | null;
        }[];
        const totalDuration =
          bookingServices && bookingServices.length > 0
            ? bookingServices.reduce(
                (sum, bs) => sum + (bs.services?.duration_minutes ?? 60),
                0
              )
            : 60;

        return { start: startMinutes, end: startMinutes + totalDuration };
      }
    );

    // Use custom availability or defaults
    let timeSlots = DEFAULT_TIME_SLOTS;

    if (availability && availability.length > 0) {
      timeSlots = [];
      for (const slot of availability) {
        const startHour = parseInt(slot.start_time.split(":")[0], 10);
        const endHour = parseInt(slot.end_time.split(":")[0], 10);
        for (let hour = startHour; hour < endHour; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
        }
      }
    }

    // Filter slots:
    // 1. Remove slots where this booking would exceed the closing time.
    // 2. Remove slots where MAX_BOOKINGS_PER_SLOT concurrent bookings already overlap.
    const availableSlots = timeSlots.filter((slot) => {
      const slotTime = parse(slot, "HH:mm", new Date());
      const slotMinutes = slotTime.getHours() * 60 + slotTime.getMinutes();
      const slotEnd = slotMinutes + serviceDuration;

      // Hard cutoff: booking must finish by closing time
      if (slotEnd > closingTimeMinutes) return false;

      // Count how many existing bookings overlap this slot
      const overlapCount = bookedRanges.filter(
        (range) =>
          (slotMinutes >= range.start && slotMinutes < range.end) ||
          (slotEnd > range.start && slotEnd <= range.end) ||
          (slotMinutes <= range.start && slotEnd >= range.end)
      ).length;

      return overlapCount < maxBookingsPerSlot;
    });

    return NextResponse.json({ slots: availableSlots, blocked: false });
  }

  // Return all blocked dates and dates with bookings for calendar
  const today = startOfDay(new Date());
  const endDate = addDays(today, 90); // Show 90 days ahead

  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("date")
    .gte("date", format(today, "yyyy-MM-dd"))
    .lte("date", format(endDate, "yyyy-MM-dd"));

  const { data: fullyBookedDates } = await supabase
    .from("bookings")
    .select("appointment_date")
    .gte("appointment_date", format(today, "yyyy-MM-dd"))
    .lte("appointment_date", format(endDate, "yyyy-MM-dd"))
    .neq("status", "cancelled");

  // Count bookings per date
  const bookingCounts: Record<string, number> = {};
  (fullyBookedDates || []).forEach((b) => {
    bookingCounts[b.appointment_date] =
      (bookingCounts[b.appointment_date] || 0) + 1;
  });

  // A day is fully booked when every default slot is filled to capacity
  const totalCapacity = DEFAULT_TIME_SLOTS.length * DEFAULT_MAX_BOOKINGS_PER_SLOT;
  const fullyBooked = Object.entries(bookingCounts)
    .filter(([_, count]) => count >= totalCapacity)
    .map(([date]) => date);

  return NextResponse.json({
    blockedDates: (blockedDates || []).map((d) => d.date),
    fullyBookedDates: fullyBooked,
    bookingCounts,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { date, startTime, endTime, isAvailable } = body;

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("availability")
    .upsert(
      {
        date,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable ?? true,
      },
      { onConflict: "date,start_time" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
