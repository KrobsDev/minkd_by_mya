-- Add day-before appointment reminder tracking.
-- Run this once in Supabase SQL Editor for existing databases.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h
  ON bookings(appointment_date, reminder_24h_sent_at)
  WHERE status = 'confirmed' AND payment_status = 'paid';
