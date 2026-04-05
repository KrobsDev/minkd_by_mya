// Default maximum concurrent bookings per time slot.
// Overridden by the "max_bookings_per_slot" setting in the admin settings panel.
export const DEFAULT_MAX_BOOKINGS_PER_SLOT = 2;

// Default hard cutoff time in minutes from midnight (18:00 = 6pm).
// This is 5pm closing + 1hr layover. Overridden by the "closing_time"
// setting in the admin settings panel.
export const DEFAULT_CLOSING_TIME_MINUTES = 18 * 60; // 1080
