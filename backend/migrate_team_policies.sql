-- MIGRATE TEAM POLICIES (FIXED)
-- This script enables Owners to manage their business team members without recursive loops

-- 1. Create a helper function to check roles without recursion
-- SECURITY DEFINER allows this function to query the table regardless of RLS, avoiding loops
CREATE OR REPLACE FUNCTION public.is_business_owner(target_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_users
    WHERE business_id = target_business_id
    AND user_id = auth.uid()
    AND role = 'Owner'
  );
$$;

-- 2. DROP OLD POLICIES
DROP POLICY IF EXISTS "Users and Owners can view team members" ON public.business_users;
DROP POLICY IF EXISTS "Owners can assign team members" ON public.business_users;
DROP POLICY IF EXISTS "Owners can revoke team access" ON public.business_users;
DROP POLICY IF EXISTS "Users can view their own mappings" ON public.business_users;
DROP POLICY IF EXISTS "Users can create mappings" ON public.business_users;

-- 3. NEW SELECT POLICY (Non-Recursive via function)
CREATE POLICY "Team visibility"
ON public.business_users FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  public.is_business_owner(business_id)
);

-- 4. NEW INSERT POLICY
CREATE POLICY "Team assignment"
ON public.business_users FOR INSERT
WITH CHECK (
  public.is_business_owner(business_id)
);

-- 5. NEW DELETE POLICY
CREATE POLICY "Team revocation"
ON public.business_users FOR DELETE
USING (
  public.is_business_owner(business_id)
);

-- 6. ENSURE PUBLIC USERS Table is readable by authenticated users for lookup
DROP POLICY IF EXISTS "Public user read access" ON public.users;
DROP POLICY IF EXISTS "Allow email lookup" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can lookup users by email" ON public.users;

CREATE POLICY "Allow email lookup"
ON public.users FOR SELECT
USING (auth.role() = 'authenticated');
