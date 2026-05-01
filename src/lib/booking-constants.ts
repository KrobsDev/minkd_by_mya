// Default maximum concurrent bookings per time slot.
// Overridden by the "max_bookings_per_slot" setting in the admin settings panel.
export const DEFAULT_MAX_BOOKINGS_PER_SLOT = 2;

// Default hard cutoff time in minutes from midnight (18:00 = 6pm).
// This is 5pm closing + 1hr layover. Overridden by the "closing_time"
// setting in the admin settings panel.
export const DEFAULT_CLOSING_TIME_MINUTES = 18 * 60; // 1080

export const DEFAULT_WEEKDAY_TIME_SLOTS = [
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

export const DEFAULT_SATURDAY_TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function getDefaultTimeSlotsForDate(date: Date | string) {
  const resolvedDate =
    typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return resolvedDate.getDay() === 6
    ? DEFAULT_SATURDAY_TIME_SLOTS
    : DEFAULT_WEEKDAY_TIME_SLOTS;
}

export function normalizeTimeSlot(time: string) {
  const [hours = "00", minutes = "00"] = time.split(":");

  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function timeStringToMinutes(time: string) {
  const [hours, minutes] = normalizeTimeSlot(time).split(":").map(Number);

  return hours * 60 + minutes;
}
