-- ==========================================
-- STEP 02: BUSINESS & TEAM ENGINE
-- ==========================================

-- 1. Table: public.businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  tax_id text NOT NULL,
  financial_year text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: public.business_users (Multi-Tenant Mapping)
CREATE TABLE IF NOT EXISTS public.business_users (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'Owner', 'Accountant', 'Viewer'
  PRIMARY KEY (business_id, user_id)
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;

-- 3. Security Helper (NON-RECURSIVE)
CREATE OR REPLACE FUNCTION public.is_business_owner(target_business_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_users
    WHERE business_id = target_business_id AND user_id = auth.uid() AND role = 'Owner'
  );
$$;

-- 4. Policies: Businesses
DROP POLICY IF EXISTS "Linked view" ON public.businesses;
CREATE POLICY "Linked view" ON public.businesses FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.business_users WHERE business_id = id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated create" ON public.businesses;
CREATE POLICY "Authenticated create" ON public.businesses FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner update" ON public.businesses;
CREATE POLICY "Owner update" ON public.businesses FOR UPDATE 
USING (public.is_business_owner(id));

-- 5. Policies: Teams (Refined for Onboarding)
DROP POLICY IF EXISTS "Team visibility" ON public.business_users;
CREATE POLICY "Team visibility" ON public.business_users FOR SELECT 
USING (user_id = auth.uid() OR public.is_business_owner(business_id));

DROP POLICY IF EXISTS "Team assignment" ON public.business_users;
CREATE POLICY "Team assignment" ON public.business_users FOR INSERT 
WITH CHECK (user_id = auth.uid() OR public.is_business_owner(business_id));

DROP POLICY IF EXISTS "Team management" ON public.business_users FOR ALL
USING (public.is_business_owner(business_id));
