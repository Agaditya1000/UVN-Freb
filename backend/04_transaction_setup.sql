-- ==========================================
-- STEP 04: TRANSACTION ENGINE
-- ==========================================

-- 1. Table: public.transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  debits jsonb NOT NULL, -- Stores [{ accountId, amount }]
  credits jsonb NOT NULL, -- Stores [{ accountId, amount }]
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Policies
DROP POLICY IF EXISTS "Transaction visibility" ON public.transactions;
CREATE POLICY "Transaction visibility" ON public.transactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.business_users WHERE business_id = transactions.business_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Transaction management" ON public.transactions;
CREATE POLICY "Transaction management" ON public.transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = transactions.business_id 
    AND business_users.user_id = auth.uid() 
    AND business_users.role IN ('Owner', 'Accountant')
  )
);
