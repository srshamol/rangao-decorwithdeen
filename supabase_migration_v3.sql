-- Add metadata columns to orders for elite fraud detection
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_metadata JSONB,
ADD COLUMN IF NOT EXISTS fraud_signals JSONB,
ADD COLUMN IF NOT EXISTS system_recommendation TEXT;

-- Create index for faster risk triage
CREATE INDEX IF NOT EXISTS idx_orders_risk_badge ON public.orders(risk_badge);
