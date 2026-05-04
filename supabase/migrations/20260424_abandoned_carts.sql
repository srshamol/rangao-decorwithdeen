-- Migration for Abandoned Carts / Incomplete Orders Tracking
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text,
    customer_name text,
    phone text UNIQUE, -- Unique constraint for upsert
    email text,
    address text,
    items jsonb DEFAULT '[]'::jsonb,
    total_amount decimal(12,2) DEFAULT 0,
    source_page text,
    is_recovered boolean DEFAULT false,
    last_active timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow public upsert (anon) for tracking
CREATE POLICY "Enable insert/upsert for tracking" ON public.abandoned_carts
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "Enable full access for admins" ON public.abandoned_carts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered ON public.abandoned_carts(is_recovered);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_last_active ON public.abandoned_carts(last_active);
