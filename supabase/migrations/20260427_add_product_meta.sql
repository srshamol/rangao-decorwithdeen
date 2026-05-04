-- Migration to add SKU and Status to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing products to have an SKU if missing
UPDATE public.products SET sku = UPPER(SUBSTRING(id::text, 1, 8)) WHERE sku IS NULL;
