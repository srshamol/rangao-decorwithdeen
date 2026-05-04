-- Add slug to products table for custom URLs
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
