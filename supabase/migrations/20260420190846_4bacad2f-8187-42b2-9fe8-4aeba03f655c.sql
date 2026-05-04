
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'wall-decor',
  stock INTEGER NOT NULL DEFAULT 10,
  is_combo BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  size TEXT,
  material TEXT,
  installation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 80,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'pending',
  coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Orders: anyone can insert (public store)
CREATE POLICY "Anyone can place orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Reviews: public read
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
