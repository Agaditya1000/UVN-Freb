-- ==========================================
-- STEP 03: CHART OF ACCOUNTS
-- ==========================================

-- 1. Table: public.accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id text PRIMARY KEY, -- Custom code like '1001'
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
  sub_category text NOT NULL, -- Level 3 Heading
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 2. Policies
DROP POLICY IF EXISTS "Account visibility" ON public.accounts;
CREATE POLICY "Account visibility" ON public.accounts FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.business_users WHERE business_id = accounts.business_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Account management" ON public.accounts;
CREATE POLICY "Account management" ON public.accounts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = accounts.business_id 
    AND business_users.user_id = auth.uid() 
    AND business_users.role IN ('Owner', 'Accountant')
  )
);
