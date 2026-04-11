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
