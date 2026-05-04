-- ============================================================
-- store_configs: key-value configuration store for the site
-- RLS is DISABLED — this is non-sensitive site configuration.
-- Anyone can read/write (admin panel has its own app-level auth).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.store_configs (
  id         TEXT NOT NULL PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS so anon/service role can both read and write freely
ALTER TABLE public.store_configs DISABLE ROW LEVEL SECURITY;

-- Seed default rows (safe to run multiple times)
INSERT INTO public.store_configs (id, value) VALUES
  ('hero_slides',
    '[]'::jsonb),
  ('home_categories',
    '[]'::jsonb),
  ('home_banners',
    '[]'::jsonb),
  ('trust_badges',
    '[]'::jsonb),
  ('home_cta',
    '{"title":"আজই অর্ডার করুন","description":"৳3,000+ অর্ডারে ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি","button_text":"Shop Now","button_url":"/shop","whatsapp_text":"WhatsApp"}'::jsonb),
  ('general_settings',
    '{"whatsapp":"8801540707024","email":"info@rangao.com","address":"Dhaka, Bangladesh","facebook_url":"","instagram_url":"","primary_color":"#0F3D2E","accent_color":"#C9A24D","background_color":"#F5F3EE","card_color":"#FFFFFF","border_color":"#E8DCCB","text_dark":"#1E1E1E","text_body":"#333333","text_light":"#8A8A8A","heading_font":"Inter","body_font":"Inter"}'::jsonb),
  ('combo_settings',
    '{"show_trust_badges":true,"show_reviews":true,"show_lifestyle_gallery":true,"show_offer_strip":true,"checkout_button_text":"৯৯০৳-তে অর্ডার করুন","custom_message":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;
