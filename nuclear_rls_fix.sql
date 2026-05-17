-- NUCLEAR RLS RESET FOR ORDERS
-- Run this in your Supabase SQL Editor

-- 1. Temporarily DISABLE RLS to clear the way
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Grant basic table permissions (Required for RLS to work)
GRANT ALL ON public.orders TO postgres, service_role;
GRANT INSERT, SELECT, UPDATE ON public.orders TO anon, authenticated;
GRANT ALL ON public.abandoned_carts TO postgres, service_role;
GRANT INSERT, SELECT, UPDATE ON public.abandoned_carts TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 3. Clean up ALL existing policies for orders
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Full Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Staff Full Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.orders;
DROP POLICY IF EXISTS "storefront_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "staff_management_policy" ON public.orders;

-- 3. Re-enable RLS (Clean slate)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create the most permissive policies possible
-- PUBLIC: Can insert only
CREATE POLICY "storefront_insert_policy" ON public.orders 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- STAFF: Full access to everything
CREATE POLICY "staff_management_policy" ON public.orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'moderator', 'production')
  )
)
WITH CHECK (true);

-- 5. Products/Categories Safety Check

-- 6. Check Categories and Products (Ensure they are readable)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
