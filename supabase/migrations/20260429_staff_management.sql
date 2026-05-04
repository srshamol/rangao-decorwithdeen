
-- Update app_role enum to include new roles
-- We use a DO block to ensure safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'super_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'super_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'production') THEN
        ALTER TYPE public.app_role ADD VALUE 'production';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'manager') THEN
        ALTER TYPE public.app_role ADD VALUE 'manager';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'customer_support') THEN
        ALTER TYPE public.app_role ADD VALUE 'customer_support';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'content_manager') THEN
        ALTER TYPE public.app_role ADD VALUE 'content_manager';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'inventory_manager') THEN
        ALTER TYPE public.app_role ADD VALUE 'inventory_manager';
    END IF;
END
$$;

-- Create staff_profiles table
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    status text NOT NULL DEFAULT 'active',
    last_login timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staff_activity_logs table
CREATE TABLE IF NOT EXISTS public.staff_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_name text NOT NULL,
    role text NOT NULL,
    action_type text NOT NULL,
    description text NOT NULL,
    ip_address text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for staff_profiles
CREATE POLICY "Staff can view all profiles"
ON public.staff_profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage profiles"
ON public.staff_profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Policies for staff_activity_logs
CREATE POLICY "Staff can view logs"
ON public.staff_activity_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can insert logs"
ON public.staff_activity_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = staff_id);

-- Add missing columns to orders for better tracking if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'assigned_to') THEN
        ALTER TABLE public.orders ADD COLUMN assigned_to uuid REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_status') THEN
        ALTER TABLE public.orders ADD COLUMN courier_status text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_tracking_id') THEN
        ALTER TABLE public.orders ADD COLUMN courier_tracking_id text;
    END IF;
END
$$;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_activity_logs;
