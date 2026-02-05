import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { addDays, format, parse, startOfDay, isBefore } from "date-fns";

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
    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("date", date)
      .single();

    if (blockedDate) {
      return NextResponse.json({ slots: [], blocked: true });
    }

    // Get custom availability for this date
    const { data: availability } = await supabase
      .from("availability")
      .select("*")
      .eq("date", date)
      .eq("is_available", true);

    // Get existing bookings for this date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("appointment_time, services:service_id(duration_minutes)")
      .eq("appointment_date", date)
      .neq("status", "cancelled");

    // Calculate booked time ranges
    const bookedRanges: { start: number; end: number }[] = (bookings || []).map(
      (b) => {
        const startTime = parse(b.appointment_time, "HH:mm:ss", new Date());
        const duration = (b.services as { duration_minutes: number })?.duration_minutes || 60;
        return {
          start: startTime.getHours() * 60 + startTime.getMinutes(),
          end:
            startTime.getHours() * 60 + startTime.getMinutes() + duration,
        };
      }
    );

    // Use custom availability or defaults
    let timeSlots = DEFAULT_TIME_SLOTS;

    if (availability && availability.length > 0) {
      // Generate slots from availability ranges
      timeSlots = [];
      for (const slot of availability) {
        const startHour = parseInt(slot.start_time.split(":")[0], 10);
        const endHour = parseInt(slot.end_time.split(":")[0], 10);
        for (let hour = startHour; hour < endHour; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
        }
      }
    }

    // Filter out booked slots
    const availableSlots = timeSlots.filter((slot) => {
      const slotTime = parse(slot, "HH:mm", new Date());
      const slotMinutes = slotTime.getHours() * 60 + slotTime.getMinutes();
      const slotEnd = slotMinutes + serviceDuration;

      // Check if this slot overlaps with any booking
      return !bookedRanges.some(
        (range) =>
          (slotMinutes >= range.start && slotMinutes < range.end) ||
          (slotEnd > range.start && slotEnd <= range.end) ||
          (slotMinutes <= range.start && slotEnd >= range.end)
      );
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

  // Consider a day fully booked if it has 9+ bookings (matching default slots)
  const fullyBooked = Object.entries(bookingCounts)
    .filter(([_, count]) => count >= DEFAULT_TIME_SLOTS.length)
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