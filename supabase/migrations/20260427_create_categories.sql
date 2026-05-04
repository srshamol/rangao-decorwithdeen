-- Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Insert Initial Data (based on existing categories used in Products)
INSERT INTO public.categories (name, slug, sort_order) VALUES 
('Wall Decor', 'wall-decor', 1),
('Calligraphy', 'calligraphy', 2),
('Frame', 'frame', 3),
('Clock', 'clock', 4),
('Combo', 'combo', 5),
('Gift', 'gift', 6)
ON CONFLICT (slug) DO NOTHING;
