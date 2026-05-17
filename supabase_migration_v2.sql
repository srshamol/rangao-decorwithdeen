-- Create table for caching customer risk data
CREATE TABLE IF NOT EXISTS public.customer_risk_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    success_ratio INTEGER NOT NULL,
    total_parcels INTEGER NOT NULL,
    success_parcels INTEGER NOT NULL,
    cancelled_parcels INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    raw_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_risk_history ENABLE ROW LEVEL SECURITY;

-- Add policies (Allow read/write for service role or authenticated admins)
CREATE POLICY "Allow read for all authenticated users" ON public.customer_risk_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Update orders table to include risk tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS risk_score INTEGER,
ADD COLUMN IF NOT EXISTS risk_badge TEXT,
ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT false;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_customer_risk_phone ON public.customer_risk_history(phone);
