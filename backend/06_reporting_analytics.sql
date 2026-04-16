-- ==========================================
-- STEP 06: REPORTING & ANALYTICS VIEWS
-- ==========================================

-- 1. VIEW: Real-time Account Balances
DROP VIEW IF EXISTS public.account_balances CASCADE;
CREATE OR REPLACE VIEW public.account_balances AS
WITH d_t AS (
    SELECT business_id, (d->>'accountId') as a_id, SUM((d->>'amount')::numeric) as t_d 
    FROM public.transactions, jsonb_array_elements(debits) d GROUP BY business_id, a_id
),
c_t AS (
    SELECT business_id, (c->>'accountId') as a_id, SUM((c->>'amount')::numeric) as t_c 
    FROM public.transactions, jsonb_array_elements(credits) c GROUP BY business_id, a_id
)
SELECT 
    a.business_id, a.id as account_id, a.name, a.category, a.sub_category, 
    COALESCE(dt.t_d, 0) as total_debit, COALESCE(ct.t_c, 0) as total_credit,
    CASE 
        WHEN a.category IN ('Asset', 'Expense') THEN COALESCE(dt.t_d, 0) - COALESCE(ct.t_c, 0) 
        ELSE COALESCE(ct.t_c, 0) - COALESCE(dt.t_d, 0) 
    END as balance
FROM public.accounts a 
LEFT JOIN d_t dt ON a.id = dt.a_id AND a.business_id = dt.business_id 
LEFT JOIN c_t ct ON a.id = ct.a_id AND a.business_id = ct.business_id;

-- 2. VIEW: Detailed Audit Logs (Decoded)
DROP VIEW IF EXISTS public.vw_detailed_audit_logs CASCADE;
CREATE OR REPLACE VIEW public.vw_detailed_audit_logs AS
SELECT al.*, p.full_name as user_name FROM public.audit_logs al LEFT JOIN public.users p ON al.user_id = p.id;

ALTER VIEW public.vw_detailed_audit_logs SET (security_invoker = on);

-- 3. Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_tx_date ON public.transactions(business_id, date);
CREATE INDEX IF NOT EXISTS idx_acc_cat ON public.accounts(business_id, category);
