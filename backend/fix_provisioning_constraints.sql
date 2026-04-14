-- MIGRATION: STABILIZE BUSINESS PROVISIONING
-- This script fixes the issue where business creation fails because the user isn't yet synced to the public.users table.

-- 1. DROP THE OLD CONSTRAINT
ALTER TABLE public.business_users 
DROP CONSTRAINT IF EXISTS business_users_user_id_fkey;

-- 2. ADD THE STABLE CONSTRAINT (pointing directly to auth.users)
ALTER TABLE public.business_users
ADD CONSTRAINT business_users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. ENSURE RLS FOR BUSINESS CREATION IS EXPLICIT
-- This allows any authenticated user to start their first business.
DROP POLICY IF EXISTS "Users can create businesses" ON public.businesses;
CREATE POLICY "Users can create businesses" 
ON public.businesses FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 4. ENSURE OWNERS CAN MAP THEMSELVES
DROP POLICY IF EXISTS "Users can create mappings" ON public.business_users;
CREATE POLICY "Users can create mappings"
ON public.business_users FOR INSERT
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.business_users IS 'Stable mapping table linking businesses to authenticated users.';
