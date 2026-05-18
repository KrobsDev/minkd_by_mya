-- Backfill for transactions that succeeded on Paystack but never reached our DB.
-- Run in Supabase SQL Editor. Each block is independent.

-- =====================================================================
-- #1 pammyfortune9@gmail.com — Ombré Brows Touch Up (DUPLICATE CHARGE)
-- Booking c86f562f is already confirmed/paid from the 5:54 PM retry.
-- This row is for the 5:06 PM charge that's about to be refunded in Paystack,
-- so we have an audit trail of what was charged.
-- =====================================================================
INSERT INTO transactions (
  booking_id,
  paystack_reference,
  amount,
  currency,
  status,
  customer_email,
  service_name,
  metadata,
  created_at
) VALUES (
  'c86f562f-6624-4727-9bc8-191f59f9a37b',
  'booking_c86f562f-6624-4727-9bc8-191f59f9a37b_1778951171876',
  100.00,
  'GHS',
  'success',
  'pammyfortune9@gmail.com',
  'Ombré Brows Touch Up',
  jsonb_build_object(
    'backfilled', true,
    'backfill_reason', 'duplicate charge — pending refund in Paystack',
    'paid_at', '2026-05-16T17:06:12Z',
    'channel', 'mobile_money'
  ),
  '2026-05-16 17:06:12+00'
)
ON CONFLICT (paystack_reference) DO NOTHING;

-- =====================================================================
-- #2 hlkg70@gil.com — appointment was May 9 (already passed).
-- Insert the transaction and flip the booking to confirmed/paid.
-- No email is sent because this runs as direct SQL.
-- =====================================================================
INSERT INTO transactions (
  booking_id,
  paystack_reference,
  amount,
  currency,
  status,
  customer_email,
  service_name,
  metadata,
  created_at
) VALUES (
  '685d29d1-6d28-463d-89c9-a2c13044783c',
  'booking_685d29d1-6d28-463d-89c9-a2c13044783c_1778072829115',
  100.00,
  'GHS',
  'success',
  'hlkg70@gil.com',
  -- update if the booking's primary service has a different display name
  (SELECT s.name FROM bookings b
     LEFT JOIN services s ON s.id = b.service_id
    WHERE b.id = '685d29d1-6d28-463d-89c9-a2c13044783c'),
  jsonb_build_object(
    'backfilled', true,
    'backfill_reason', 'silent verify failure; appointment already passed',
    'paid_at', '2026-05-06T13:07:09Z',
    'channel', 'mobile_money'
  ),
  '2026-05-06 13:07:09+00'
)
ON CONFLICT (paystack_reference) DO NOTHING;

UPDATE bookings
   SET status = 'confirmed',
       payment_status = 'paid',
       paystack_reference = 'booking_685d29d1-6d28-463d-89c9-a2c13044783c_1778072829115'
 WHERE id = '685d29d1-6d28-463d-89c9-a2c13044783c'
   AND payment_status <> 'paid';

-- Verify
SELECT id, status, payment_status, customer_email, paystack_reference
  FROM bookings
 WHERE id IN (
   '685d29d1-6d28-463d-89c9-a2c13044783c',
   'c86f562f-6624-4727-9bc8-191f59f9a37b'
 );

SELECT paystack_reference, amount, status, customer_email, service_name, created_at
  FROM transactions
 WHERE paystack_reference IN (
   'booking_c86f562f-6624-4727-9bc8-191f59f9a37b_1778951171876',
   'booking_685d29d1-6d28-463d-89c9-a2c13044783c_1778072829115'
 );
