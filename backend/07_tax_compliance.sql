-- ==========================================
-- STEP 07: TAX & COMPLIANCE (FOUNDATION)
-- ==========================================
-- Adds a minimal tax metadata model to support region-specific reporting (GST/VAT).
-- This is intentionally lightweight: tax details live on the transaction record
-- and can be expanded later into normalized invoice/tax-line tables + RPC posting.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS tax jsonb;

-- Helpful index for period-based tax summaries
CREATE INDEX IF NOT EXISTS idx_tx_tax_present
  ON public.transactions (business_id, date)
  WHERE tax IS NOT NULL;

