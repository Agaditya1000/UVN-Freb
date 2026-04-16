-- ==========================================
-- STEP 05: INTEGRITY & AUDIT (RIGOR)
-- ==========================================

-- 1. Table: public.audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name text NOT NULL,
    record_id text, -- FIXED: Support for both UUID and custom account codes
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner audit access" ON public.audit_logs;
CREATE POLICY "Owner audit access" ON public.audit_logs FOR SELECT 
USING (public.is_business_owner(business_id));

-- 2. Audit Log Function
CREATE OR REPLACE FUNCTION public.proc_audit_log()
RETURNS trigger AS $$
DECLARE v_bid uuid;
BEGIN
    IF (TG_OP = 'DELETE') THEN v_bid := OLD.business_id; ELSE v_bid := NEW.business_id; END IF;
    INSERT INTO public.audit_logs (business_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (v_bid, auth.uid(), TG_OP, TG_TABLE_NAME, COALESCE(NEW.id::text, OLD.id::text), CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END, CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Audit Triggers
DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();

DROP TRIGGER IF EXISTS trg_audit_accounts ON public.accounts;
CREATE TRIGGER trg_audit_accounts AFTER INSERT OR UPDATE OR DELETE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();

-- 4. TRANSACTION BALANCER (Zero Tolerance for Error)
CREATE OR REPLACE FUNCTION public.check_transaction_balance()
RETURNS trigger AS $$
DECLARE v_d numeric := 0; v_c numeric := 0; v_i jsonb;
BEGIN
    FOR v_i IN SELECT * FROM jsonb_array_elements(NEW.debits) LOOP v_d := v_d + (v_i->>'amount')::numeric; END LOOP;
    FOR v_i IN SELECT * FROM jsonb_array_elements(NEW.credits) LOOP v_c := v_c + (v_i->>'amount')::numeric; END LOOP;
    IF abs(v_d - v_c) > 0.005 THEN RAISE EXCEPTION 'Balance Discrepancy: Debit (%) != Credit (%)', v_d, v_c; END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_balance ON public.transactions;
CREATE TRIGGER trg_validate_balance BEFORE INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.check_transaction_balance();
