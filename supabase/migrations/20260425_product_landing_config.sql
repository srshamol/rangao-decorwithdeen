-- Add landing_page_config to products table for per-product landing page customization
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS landing_page_config JSONB DEFAULT '{}'::jsonb;
