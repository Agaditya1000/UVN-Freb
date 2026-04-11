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
