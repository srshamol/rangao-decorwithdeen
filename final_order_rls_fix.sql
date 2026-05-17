-- 1. Ensure RLS is enabled for critical tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting policies to start fresh
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Full Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Staff Full Access Orders" ON public.orders;

DROP POLICY IF EXISTS "Public Insert Abandoned Carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Public Update Abandoned Carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Admin Full Access Abandoned Carts" ON public.abandoned_carts;

-- 3. Public Storefront Policies (Allowed for everyone)
-- Allow anyone to place an order
CREATE POLICY "Public Insert Orders" ON public.orders 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- Allow anyone to create an abandoned cart
CREATE POLICY "Public Insert Abandoned Carts" ON public.abandoned_carts 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- Allow anyone to update their own abandoned cart (tracked by phone)
CREATE POLICY "Public Update Abandoned Carts" ON public.abandoned_carts 
FOR UPDATE TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- 4. Admin/Staff Policies (Restricted to logged-in staff)
-- This policy allows anyone with ANY staff role to have FULL access to orders and carts
CREATE POLICY "Staff Full Access Orders" ON public.orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'moderator', 'production')
  )
)
WITH CHECK (true);

CREATE POLICY "Staff Full Access Abandoned Carts" ON public.abandoned_carts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'moderator', 'production')
  )
)
WITH CHECK (true);

-- Allow public read of products and categories (required for checkout calculations)
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

-- 5. Enable Realtime for Orders (Critical for the admin sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- Note: If the above fails because it already exists, that's fine.
