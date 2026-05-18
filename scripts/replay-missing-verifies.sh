#!/usr/bin/env bash
# Replays /api/payments/verify for two missing transactions whose appointments
# are still upcoming. The verify route (with the fixes applied) will:
#   - update the booking to status=confirmed, payment_status=paid
#   - insert the transactions row (idempotent — skips if a row already exists)
#   - send the customer's confirmation email
#   - create the Google Calendar event
#
# Must be run against PRODUCTION because PAYSTACK_SECRET_KEY, Resend, and the
# Google Calendar credentials only live there.
#
# Usage:
#   ./scripts/replay-missing-verifies.sh
# Or, to point at a different host:
#   APP_URL=https://staging.minkdbymya.com ./scripts/replay-missing-verifies.sh

set -euo pipefail
APP_URL="${APP_URL:-https://www.minkdbymya.com}"

call_verify() {
  local label="$1"
  local reference="$2"
  local booking_id="$3"

  echo "=== Replaying $label ==="
  echo "  booking_id: $booking_id"
  echo "  reference:  $reference"
  echo "  endpoint:   $APP_URL/api/payments/verify"
  echo
  curl -sS -X POST "$APP_URL/api/payments/verify" \
    -H "Content-Type: application/json" \
    -d "{\"reference\":\"$reference\",\"bookingIds\":[\"$booking_id\"]}" \
    | tee /dev/stderr
  echo
  echo
}

# #3 racheal2a4@gmail.com — appointment 2026-05-27 12:00
call_verify "racheal2a4@gmail.com (May 27)" \
  "booking_f9e36a46-5d9f-49b7-b5e3-535401e43541_1779109910321" \
  "f9e36a46-5d9f-49b7-b5e3-535401e43541"

# #4 frembiescoametics@gmail.com — appointment 2026-05-21 12:00
call_verify "frembiescoametics@gmail.com (May 21)" \
  "booking_51169b9d-fab2-4030-9242-e7fbab836184_1779134678408" \
  "51169b9d-fab2-4030-9242-e7fbab836184"
