-- ==========================================
-- STEP 01: AUTH & USER SYNC
-- ==========================================

-- 1. Table: public.users (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text UNIQUE,
  avatar_url text,
  role text DEFAULT 'Owner',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 🛠️ DATABASE REPAIR: Ensure the mandatory 'role' column exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'Owner';

-- Update any existing users to have the default role
UPDATE public.users SET role = 'Owner' WHERE role IS NULL;

-- 2. Trigger Function for Syncing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public lookup" ON public.users;
CREATE POLICY "Public lookup" ON public.users 
  FOR SELECT USING (auth.role() = 'authenticated');
