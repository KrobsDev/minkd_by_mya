import type { Database } from "@/types/database";
import {
  getDefaultTimeSlotsForDate,
  normalizeTimeSlot,
  timeStringToMinutes,
} from "@/lib/booking-constants";

type AvailabilityRow = Pick<
  Database["public"]["Tables"]["availability"]["Row"],
  "start_time" | "end_time"
>;

type BookingRow = {
  appointment_time: string;
  booking_services:
    | {
        services: Pick<
          Database["public"]["Tables"]["services"]["Row"],
          "duration_minutes"
        > | null;
      }[]
    | null;
};

type BookedRange = {
  start: number;
  end: number;
};

export function buildBookedRanges(bookings: BookingRow[] | null | undefined): BookedRange[] {
  return (bookings || []).map((booking) => {
    const start = timeStringToMinutes(booking.appointment_time);
    const totalDuration =
      booking.booking_services && booking.booking_services.length > 0
        ? booking.booking_services.reduce(
            (sum, bookingService) =>
              sum + (bookingService.services?.duration_minutes ?? 60),
            0
          )
        : 60;

    return { start, end: start + totalDuration };
  });
}

export function buildCandidateTimeSlots(
  date: string,
  availability: AvailabilityRow[] | null | undefined
) {
  if (!availability || availability.length === 0) {
    return getDefaultTimeSlotsForDate(date);
  }

  const timeSlots: string[] = [];

  for (const slot of availability) {
    const startHour = parseInt(slot.start_time.split(":")[0], 10);
    const endHour = parseInt(slot.end_time.split(":")[0], 10);

    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
  }

  return timeSlots;
}

export function getAvailableTimeSlots(params: {
  date: string;
  availability: AvailabilityRow[] | null | undefined;
  bookings: BookingRow[] | null | undefined;
  requestedDurationMinutes: number;
  closingTimeMinutes: number;
  maxBookingsPerSlot: number;
}) {
  const {
    date,
    availability,
    bookings,
    requestedDurationMinutes,
    closingTimeMinutes,
    maxBookingsPerSlot,
  } = params;

  const timeSlots = buildCandidateTimeSlots(date, availability);
  const bookedRanges = buildBookedRanges(bookings);

  return timeSlots.filter((slot) => {
    const slotStart = timeStringToMinutes(slot);
    const slotEnd = slotStart + requestedDurationMinutes;

    if (slotEnd > closingTimeMinutes) {
      return false;
    }

    const overlapCount = bookedRanges.filter(
      (range) => slotStart < range.end && slotEnd > range.start
    ).length;

    return overlapCount < maxBookingsPerSlot;
  });
}

export function isTimeSlotAvailable(params: {
  date: string;
  availability: AvailabilityRow[] | null | undefined;
  bookings: BookingRow[] | null | undefined;
  requestedDurationMinutes: number;
  closingTimeMinutes: number;
  maxBookingsPerSlot: number;
  requestedTime: string;
}) {
  const { requestedTime, ...rest } = params;

  return getAvailableTimeSlots(rest).includes(normalizeTimeSlot(requestedTime));
}
