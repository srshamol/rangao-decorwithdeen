-- Insert Demo Combo Products
INSERT INTO public.products (
  id, 
  name, 
  name_bn, 
  description, 
  price, 
  old_price, 
  stock, 
  is_combo, 
  slug, 
  badge,
  images, 
  category,
  landing_page_config
) VALUES 
(
  'p6', 
  'Islamic Wall Decor Combo', 
  'আয়াতুল কুরসি ৩ডি ওয়াল ক্যানভাস + ২০ পিস ইসলামিক দোয়া স্টিকার + উডেন কী হ্যাঙ্গার', 
  'আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে। এই বিশেষ কম্বোতে পাচ্ছেন ৩টি প্রিমিয়াম প্রোডাক্ট।', 
  990, 
  1550, 
  15, 
  true, 
  'Islamic', 
  'Best Seller',
  ARRAY[
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621274790572-7c32596bc67f?auto=format&fit=crop&q=80'
  ],
  'Combo',
  '{
    "hero_title_bn": "আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে",
    "hero_desc_bn": "আয়াতুল কুরসি ৩ডি ওয়াল ক্যানভাস + ২০ পিস ইসলামিক দোয়া স্টিকার + উডেন কী হ্যাঙ্গার",
    "hero_button_text_bn": "অর্ডার করতে এখানে ক্লিক করুন",
    "hero_badge_text_bn": "১০০% অরিজিনাল প্রিমিয়াম প্রোডাক্ট",
    "countdown_enabled": true,
    "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "trust_badges": [
      {"icon": "Truck", "text": "দ্রুত ডেলিভারি"},
      {"icon": "ShieldCheck", "text": "প্রিমিয়াম কোয়ালিটি"},
      {"icon": "HeartHandshake", "text": "৭ দিনের রিপ্লেসমেন্ট"}
    ],
    "included_products": [
      {
        "name": "Ayatul Kursi 3D Wall Canvas",
        "badge": "Best Seller",
        "badge_color": "bg-amber-100 text-amber-600",
        "points": ["Premium 3D look", "Drawing/Living Room-এ perfect", "Wall-ready — সরাসরি লাগানো যায়"],
        "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80"
      },
      {
        "name": "20 pcs Islamic Dua Sticker",
        "badge": "Bonus",
        "badge_color": "bg-rose-100 text-rose-600",
        "points": ["Fridge, wall-এ লাগানো যায়", "বাচ্চাদের শেখাতে দারুণ", "Daily Islamic reminder"],
        "image": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80"
      },
      {
        "name": "Wooden Key Hanger",
        "badge": "Useful",
        "badge_color": "bg-emerald-100 text-emerald-600",
        "points": ["Keys, tasbih গুছিয়ে রাখুন", "Entry-তে neat look দেয়", "Premium wood finish"],
        "image": "https://images.unsplash.com/photo-1621274790572-7c32596bc67f?auto=format&fit=crop&q=80"
      }
    ],
    "comparison_rows": [
      {"feature": "৩ডি ওয়াল ক্যানভাস", "individual_price": 850, "is_included": true},
      {"feature": "২০ পিস দোয়া স্টিকার", "individual_price": 250, "is_included": true},
      {"feature": "উডেন কী হ্যাঙ্গার", "individual_price": 450, "is_included": true}
    ],
    "reviews": [
      {"name": "শহীদুল ইসলাম", "text": "প্রোডাক্ট কোয়ালিটি অসাধারণ! বিশেষ করে ৩ডি ক্যানভাসটা অনেক সুন্দর।", "rating": 5},
      {"name": "নাসরিন আক্তার", "text": "ডেলিভারি খুব দ্রুত পেয়েছি। দোয়া স্টিকারগুলো বাচ্চাদের অনেক কাজে লাগছে।", "rating": 5}
    ],
    "faq": [
      {"q": "পণ্য হাতে পেতে কতদিন সময় লাগবে?", "a": "ঢাকার মধ্যে ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে আপনি পণ্যটি হাতে পাবেন।"},
      {"q": "পেমেন্ট কীভাবে করব?", "a": "আমরা ক্যাশ অন ডেলিভারি সুবিধা দিচ্ছি। পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানকে টাকা দিবেন।"}
    ]
  }'
),
(
  'p7', 
  'Premium Home Decor Bundle', 
  'প্রিমিয়াম হোম ডেকোর বান্ডিল - ৪টি এক্সক্লুসিভ আইটেম', 
  'আধুনিক ঘর সাজাতে আপনার যা যা প্রয়োজন সব পাবেন এই একটি কম্বোতেই।', 
  1490, 
  2250, 
  10, 
  true, 
  'Home', 
  'Limited Offer',
  ARRAY[
    'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80'
  ],
  'Combo',
  '{
    "hero_title_bn": "আধুনিক ঘর সাজাতে সেরা কম্বো অফার",
    "hero_desc_bn": "প্রিমিয়াম হোম ডেকোর বান্ডিল - ৪টি এক্সক্লুসিভ আইটেম (লিমিটেড স্টক)",
    "hero_button_text_bn": "লুফে নিন আজকের ডিল",
    "countdown_enabled": true,
    "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "included_products": [
      {
        "name": "Luxury Canvas Art",
        "badge": "Top Rated",
        "image": "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80",
        "points": ["Ultra high definition", "Large format 24x36", "Premium frame included"]
      },
      {
        "name": "Digital Tasbih Counter",
        "badge": "Free Gift",
        "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80",
        "points": ["LED display", "Soft touch buttons", "Long battery life"]
      }
    ]
  }'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  name_bn = EXCLUDED.name_bn,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  stock = EXCLUDED.stock,
  slug = EXCLUDED.slug,
  badge = EXCLUDED.badge,
  images = EXCLUDED.images,
  landing_page_config = EXCLUDED.landing_page_config;
