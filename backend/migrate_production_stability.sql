-- 1. ADD UPDATE/DELETE POLICIES FOR TRANSACTIONS
CREATE POLICY "Authorized users can update transactions"
ON public.transactions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = transactions.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);

CREATE POLICY "Authorized users can delete transactions"
ON public.transactions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = transactions.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);

-- 2. CREATE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name text NOT NULL,
    record_id uuid,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = audit_logs.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role = 'Owner'
  )
);

-- 3. CREATE AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.proc_audit_log()
RETURNS trigger AS $$
DECLARE
    v_business_id uuid;
BEGIN
    -- Try to find the business_id from the record
    IF (TG_OP = 'DELETE') THEN
        v_business_id := OLD.business_id;
    ELSE
        v_business_id := NEW.business_id;
    END IF;

    INSERT INTO public.audit_logs (business_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        v_business_id,
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE WHEN TG_TABLE_NAME = 'transactions' THEN COALESCE(NEW.id, OLD.id) ELSE NULL END, -- Only for UUID-based tables
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATTACH TRIGGERS
CREATE TRIGGER trg_audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();

CREATE TRIGGER trg_audit_accounts
AFTER INSERT OR UPDATE OR DELETE ON public.accounts
FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();

-- 5. CREATE ACCOUNT BALANCES VIEW
CREATE OR REPLACE VIEW public.account_balances AS
WITH debit_totals AS (
    SELECT 
        business_id, 
        (d->>'accountId') as account_id, 
        SUM((d->>'amount')::numeric) as total_debit
    FROM public.transactions, jsonb_array_elements(debits) d
    GROUP BY business_id, (d->>'accountId')
),
credit_totals AS (
    SELECT 
        business_id, 
        (c->>'accountId') as account_id, 
        SUM((c->>'amount')::numeric) as total_credit
    FROM public.transactions, jsonb_array_elements(credits) c
    GROUP BY business_id, (c->>'accountId')
)
SELECT 
    a.business_id,
    a.id as account_id,
    COALESCE(dt.total_debit, 0) as total_debit,
    COALESCE(ct.total_credit, 0) as total_credit,
    CASE 
        WHEN a.category IN ('Asset', 'Expense') THEN COALESCE(dt.total_debit, 0) - COALESCE(ct.total_credit, 0)
        ELSE COALESCE(ct.total_credit, 0) - COALESCE(dt.total_debit, 0)
    END as balance
FROM public.accounts a
LEFT JOIN debit_totals dt ON a.id = dt.account_id AND a.business_id = dt.business_id
LEFT JOIN credit_totals ct ON a.id = ct.account_id AND a.business_id = ct.business_id;
