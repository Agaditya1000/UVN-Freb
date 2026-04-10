-- TABLE: public.transactions
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  debits jsonb NOT NULL, -- Stores [{ accountId, amount }]
  credits jsonb NOT NULL, -- Stores [{ accountId, amount }]
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: public.transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions of their businesses"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = transactions.business_id 
    AND business_users.user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = transactions.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);
