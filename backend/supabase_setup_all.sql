-- UVN-P1 SaaS: Supabase one-shot setup (run in Supabase SQL Editor)
--
-- This file concatenates the repo's setup scripts in a safe order.
-- Run this in the correct Supabase project (Dashboard -> SQL Editor -> New query).
--
-- Order matters because `public.business_users` references `public.users`.

-- ============================================================
-- 1) AUTH / USERS MIRROR TABLE + TRIGGER
-- Source: backend/supabase_auth_setup.sql
-- ============================================================

-- 1. Create a public 'users' table linking to Supabase's internal auth.users
CREATE TABLE public.users (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'Viewer',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Primary key
  PRIMARY KEY (id)
);

-- 2. Turn on RLS for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Allow public access to view users (Adjust this later if only Owners should view users)
CREATE POLICY "Public user read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can edit their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 4. Create the function that automatically copies auth data to public tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'Viewer') -- default to Viewer if undefined
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 2) BUSINESSES + BUSINESS_USERS (MULTI-TENANT MAPPING) + RLS
-- Source: backend/supabase_business_setup.sql
-- ============================================================

-- 1. Create the businesses table
CREATE TABLE public.businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  tax_id text NOT NULL,
  financial_year text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the business_users junction table (Multi-Tenant Mapping)
CREATE TABLE public.business_users (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  PRIMARY KEY (business_id, user_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS for businesses
-- A user can only view a business if they are listed in business_users
CREATE POLICY "Users can view their linked businesses" 
ON public.businesses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = businesses.id 
    AND business_users.user_id = auth.uid()
  )
);

-- Note: We temporarily allow ANY authenticated user to insert a business, 
-- but the backend logic will immediately bind them to it.
CREATE POLICY "Users can create businesses" 
ON public.businesses FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Only Owners mapped in business_users can update the business
CREATE POLICY "Only Owners can update businesses"
ON public.businesses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = businesses.id 
    AND business_users.user_id = auth.uid()
    AND business_users.role = 'Owner'
  )
);

-- 5. RLS for business_users mapping table
CREATE POLICY "Users can view their own mappings"
ON public.business_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create mappings"
ON public.business_users FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3) ACCOUNTS + RLS
-- Source: backend/supabase_accounts_setup.sql
-- ============================================================

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

-- ============================================================
-- 4) TRANSACTIONS + RLS
-- Source: backend/supabase_transactions_setup.sql
-- ============================================================

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

-- ============================================================
-- OPTIONAL: enable UPDATE/DELETE on accounts
-- Source: backend/migrate_accounts_policies.sql
-- ============================================================
-- Uncomment to apply later:
--
-- CREATE POLICY "Authorized users can update accounts"
-- ON public.accounts FOR UPDATE
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.business_users 
--     WHERE business_users.business_id = accounts.business_id 
--     AND business_users.user_id = auth.uid()
--     AND business_users.role IN ('Owner', 'Accountant')
--   )
-- );
--
-- CREATE POLICY "Authorized users can delete accounts"
-- ON public.accounts FOR DELETE
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.business_users 
--     WHERE business_users.business_id = accounts.business_id 
--     AND business_users.user_id = auth.uid()
--     AND business_users.role IN ('Owner', 'Accountant')
--   )
-- );

