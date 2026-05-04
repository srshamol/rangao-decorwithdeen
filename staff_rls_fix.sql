-- 1. Ensure RLS is enabled
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive or conflicting policies
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
DROP POLICY IF EXISTS "Super Admin Full Access Profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can view all roles" ON public.user_roles;

-- 3. Create permissive policies for staff
-- This allows any authenticated staff member to see the team list
CREATE POLICY "Staff can view all profiles" ON public.staff_profiles 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()));

-- This allows staff members to update their own activity timestamp
CREATE POLICY "Staff can update own profile" ON public.staff_profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- This allows staff to see the roles of others (needed for the team list)
CREATE POLICY "Staff can view all roles" ON public.user_roles 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()));

-- 4. Super Admin override (Full Access)
CREATE POLICY "Super Admin Full Access Profiles" ON public.staff_profiles 
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super Admin Full Access Roles" ON public.user_roles 
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'super_admin'));
