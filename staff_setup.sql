-- 1. Ensure staff_profiles has the username column if it was missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='username') THEN
        ALTER TABLE public.staff_profiles ADD COLUMN username TEXT UNIQUE;
    END IF;
END $$;

-- 2. Add avatar_url if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.staff_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 3. Fix RLS Policies for staff_profiles
DROP POLICY IF EXISTS "Allow authenticated to read staff_profiles" ON public.staff_profiles;
CREATE POLICY "Allow authenticated to read staff_profiles" 
ON public.staff_profiles FOR SELECT 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Allow individuals to update their own staff_profile" ON public.staff_profiles;
CREATE POLICY "Allow individuals to update their own staff_profile" 
ON public.staff_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Fix RLS Policies for user_roles
DROP POLICY IF EXISTS "Allow authenticated to read user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated to read user_roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (public.is_admin());

-- 5. Ensure Super Admin role exists for primary owner
-- Replace 'USER_ID_HERE' with actual UID if running manually, 
-- but this is mostly for the logic.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role 
FROM auth.users 
WHERE email = 'rangao.bd@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Sync profiles for users who might have been created without one
INSERT INTO public.staff_profiles (id, full_name, email, status)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), email, 'active'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
