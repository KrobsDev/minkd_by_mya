-- Enforce one row per Paystack reference.
-- Eliminates the webhook-vs-verify race window. With this in place, whichever
-- path inserts first wins; the loser hits 23505 and our routes already treat
-- that as success (see webhook/paystack/route.ts and payments/verify/route.ts).
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.

-- 1. Sanity check: refuse to add the constraint if duplicates exist.
--    If this returns any rows, dedupe them first (manually) before proceeding.
SELECT paystack_reference, COUNT(*) AS row_count
  FROM transactions
 GROUP BY paystack_reference
HAVING COUNT(*) > 1;

-- 2. Add the unique index. IF NOT EXISTS makes this safe to re-run.
CREATE UNIQUE INDEX IF NOT EXISTS transactions_paystack_reference_key
  ON transactions (paystack_reference);

-- 3. Verify it landed.
SELECT indexname, indexdef
  FROM pg_indexes
 WHERE tablename = 'transactions'
   AND indexname = 'transactions_paystack_reference_key';
