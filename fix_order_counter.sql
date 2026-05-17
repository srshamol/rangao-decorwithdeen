-- 1. Create a security-definer function to count orders
-- This bypasses RLS to give an accurate count for the order sequence
CREATE OR REPLACE FUNCTION get_daily_order_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT count(*)
    FROM public.orders
    WHERE created_at >= CURRENT_DATE
  );
END;
$$;

-- 2. Grant permission to everyone to use this counter
GRANT EXECUTE ON FUNCTION get_daily_order_count() TO anon, authenticated;

-- 3. Verify it's working
-- SELECT get_daily_order_count();
