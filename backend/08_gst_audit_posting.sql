-- ==========================================
-- STEP 08: GST — NORMALIZED TAX LINES + ATOMIC POSTING (RPC)
-- ==========================================
-- Requires Step 04 (transactions) and Step 07 (transactions.tax jsonb).
-- India COA must include IN-1400, IN-2400, IN-1411, IN-1421, IN-2411, IN-2421
-- (see frontend India template / re-seed accounts for existing orgs).
--
-- post_gst_journal(...) inserts a balanced voucher with split GST lines and
-- one row in public.transaction_tax_lines for audit / return drafting.

DROP FUNCTION IF EXISTS public.post_gst_journal(
  uuid, date, text, text, text, text, numeric, text, numeric, text, text, boolean
);

CREATE TABLE IF NOT EXISTS public.transaction_tax_lines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  regime text NOT NULL DEFAULT 'GST',
  kind text NOT NULL CHECK (kind IN ('purchase', 'sale')),
  hsn_sac text,
  place_of_supply text,
  itc_eligible boolean NOT NULL DEFAULT true,
  taxable_value numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_type text NOT NULL,
  igst_amount numeric NOT NULL DEFAULT 0,
  cgst_amount numeric NOT NULL DEFAULT 0,
  sgst_amount numeric NOT NULL DEFAULT 0,
  total_tax numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ttl_business_created ON public.transaction_tax_lines (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ttl_tx ON public.transaction_tax_lines (transaction_id);

ALTER TABLE public.transaction_tax_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tax line visibility" ON public.transaction_tax_lines;
CREATE POLICY "Tax line visibility" ON public.transaction_tax_lines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_users bu
    WHERE bu.business_id = transaction_tax_lines.business_id
      AND bu.user_id = auth.uid()
  )
);

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS gst_state_code text;

CREATE OR REPLACE FUNCTION public.post_gst_journal(
  p_business_id uuid,
  p_date date,
  p_description text,
  p_kind text,
  p_main_account_id text,
  p_counterparty_account_id text,
  p_taxable_base numeric,
  p_tax_type text,
  p_tax_rate numeric,
  p_hsn_sac text DEFAULT NULL,
  p_place_of_supply text DEFAULT NULL,
  p_itc_eligible boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country text;
  v_tx_id uuid;
  v_tax_amt numeric;
  v_half numeric;
  v_total numeric;
  v_debits jsonb;
  v_credits jsonb;
  v_tax_json jsonb;
  v_igst numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
BEGIN
  IF p_taxable_base IS NULL OR p_taxable_base <= 0 THEN
    RAISE EXCEPTION 'taxable base must be positive';
  END IF;
  IF p_tax_rate IS NULL OR p_tax_rate < 0 THEN
    RAISE EXCEPTION 'tax rate invalid';
  END IF;
  IF p_kind NOT IN ('purchase', 'sale') THEN
    RAISE EXCEPTION 'kind must be purchase or sale';
  END IF;
  IF p_tax_type NOT IN ('IGST', 'CGST_SGST') THEN
    RAISE EXCEPTION 'tax_type must be IGST or CGST_SGST';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.business_users bu
    WHERE bu.business_id = p_business_id
      AND bu.user_id = auth.uid()
      AND bu.role IN ('Owner', 'Accountant')
  ) THEN
    RAISE EXCEPTION 'not authorized to post for this business';
  END IF;

  SELECT b.country INTO v_country FROM public.businesses b WHERE b.id = p_business_id;
  IF v_country IS DISTINCT FROM 'India' THEN
    RAISE EXCEPTION 'GST posting is only enabled for India businesses';
  END IF;

  v_tax_amt := round(p_taxable_base * p_tax_rate / 100.0, 2);
  v_total := p_taxable_base + v_tax_amt;

  IF p_kind = 'purchase' THEN
    IF p_tax_type = 'IGST' THEN
      v_debits := jsonb_build_array(
        jsonb_build_object('accountId', p_main_account_id, 'amount', p_taxable_base),
        jsonb_build_object('accountId', 'IN-1400', 'amount', v_tax_amt)
      );
      v_credits := jsonb_build_array(
        jsonb_build_object('accountId', p_counterparty_account_id, 'amount', v_total)
      );
      v_igst := v_tax_amt;
    ELSE
      v_half := round(v_tax_amt / 2.0, 2);
      v_debits := jsonb_build_array(
        jsonb_build_object('accountId', p_main_account_id, 'amount', p_taxable_base),
        jsonb_build_object('accountId', 'IN-1411', 'amount', v_half),
        jsonb_build_object('accountId', 'IN-1421', 'amount', v_tax_amt - v_half)
      );
      v_credits := jsonb_build_array(
        jsonb_build_object('accountId', p_counterparty_account_id, 'amount', v_total)
      );
      v_cgst := v_half;
      v_sgst := v_tax_amt - v_half;
    END IF;
  ELSE
    IF p_tax_type = 'IGST' THEN
      v_debits := jsonb_build_array(
        jsonb_build_object('accountId', p_counterparty_account_id, 'amount', v_total)
      );
      v_credits := jsonb_build_array(
        jsonb_build_object('accountId', p_main_account_id, 'amount', p_taxable_base),
        jsonb_build_object('accountId', 'IN-2400', 'amount', v_tax_amt)
      );
      v_igst := v_tax_amt;
    ELSE
      v_half := round(v_tax_amt / 2.0, 2);
      v_debits := jsonb_build_array(
        jsonb_build_object('accountId', p_counterparty_account_id, 'amount', v_total)
      );
      v_credits := jsonb_build_array(
        jsonb_build_object('accountId', p_main_account_id, 'amount', p_taxable_base),
        jsonb_build_object('accountId', 'IN-2411', 'amount', v_half),
        jsonb_build_object('accountId', 'IN-2421', 'amount', v_tax_amt - v_half)
      );
      v_cgst := v_half;
      v_sgst := v_tax_amt - v_half;
    END IF;
  END IF;

  v_tax_json := jsonb_build_object(
    'regime', 'GST',
    'kind', p_kind,
    'type', p_tax_type,
    'rate', p_tax_rate,
    'base', p_taxable_base,
    'amount', v_tax_amt,
    'hsn_sac', p_hsn_sac,
    'place_of_supply', p_place_of_supply,
    'itc_eligible', p_itc_eligible,
    'posting_engine', 'rpc_v1'
  );

  INSERT INTO public.transactions (business_id, date, description, debits, credits, tax)
  VALUES (p_business_id, p_date, p_description, v_debits, v_credits, v_tax_json)
  RETURNING id INTO v_tx_id;

  INSERT INTO public.transaction_tax_lines (
    transaction_id, business_id, regime, kind, hsn_sac, place_of_supply, itc_eligible,
    taxable_value, tax_rate, tax_type, igst_amount, cgst_amount, sgst_amount, total_tax
  ) VALUES (
    v_tx_id, p_business_id, 'GST', p_kind, p_hsn_sac, p_place_of_supply, p_itc_eligible,
    p_taxable_base, p_tax_rate, p_tax_type, v_igst, v_cgst, v_sgst, v_tax_amt
  );

  RETURN v_tx_id;
END;
$$;

REVOKE ALL ON FUNCTION public.post_gst_journal(
  uuid, date, text, text, text, text, numeric, text, numeric, text, text, boolean
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.post_gst_journal(
  uuid, date, text, text, text, text, numeric, text, numeric, text, text, boolean
) TO authenticated;
