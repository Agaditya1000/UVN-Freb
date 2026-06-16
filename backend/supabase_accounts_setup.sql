-- TABLE: public.accounts
CREATE TABLE public.accounts (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  id text NOT NULL, -- The account code (e.g., 1001)
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  sub_category text NOT NULL, -- e.g., 'Current Asset', 'Fixed Asset', 'Long-Term Liability'
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (business_id, id)
);

-- RLS: public.accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accounts of their businesses"
ON public.accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = accounts.business_id 
    AND business_users.user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can create accounts"
ON public.accounts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = accounts.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);
