
export interface AdminSettings {
  store_name?: string;
  store_tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  facebook_url?: string;
  instagram_id?: string;
  tiktok_id?: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  accent_color?: string;
  background_color?: string;
  card_color?: string;
  border_color?: string;
  heading_font?: string;
  body_font?: string;
  show_logo?: boolean;
  show_name?: boolean;
  show_tagline?: boolean;
  hero_slides?: HeroSlide[];
  hero_text?: HeroText;
  trust_badges?: TrustBadge[];
  show_categories?: boolean;
  categories_text?: CategoriesText;
  show_featured?: boolean;
  featured_text?: FeaturedText;
  show_combo?: boolean;
  combo_text?: ComboText;
  why_choose_text?: WhyChooseText;
  gallery_text?: GalleryText;
  reviews_text?: ReviewsText;
  quote_text?: QuoteText;
  cta_text?: CTAText;
  header_links?: HeaderLink[];
  promo_badge?: PromoBadge;
  order_notifications?: OrderNotifications;
  low_stock_alerts?: LowStockAlerts;
  visibility?: Record<string, { desktop: boolean; mobile: boolean }>;
  homepage_sections?: HomepageSection[];
  footer_settings?: FooterSettings;
  menus?: MenuConfig[];
  [key: string]: any;
}

export interface FooterSettings {
  text_bn: string;
  text_en: string;
  show_social: boolean;
  show_payment_methods: boolean;
  copyright_text: string;
  columns: FooterColumn[];
}

export interface FooterColumn {
  id: string;
  title_bn: string;
  title_en: string;
  links: HeaderLink[];
}

export interface HomepageSection {
  id: string;
  type: string;
  label_bn: string;
  label_en: string;
  enabled: boolean;
  visibility: { desktop: boolean; mobile: boolean };
}

export interface HeroSlide {
  badge: string;
  title: string;
  description: string;
  button_text: string;
  button_two_text: string;
  image: string;
  layout: "image-left" | "image-right";
}

export interface HeroText {
  badge_en?: string;
  badge_bn?: string;
  title_en_1?: string;
  title_bn_1?: string;
  title_en_2?: string;
  title_bn_2?: string;
  desc_en?: string;
  desc_bn?: string;
  btn1_en?: string;
  btn1_bn?: string;
  btn2_en?: string;
  btn2_bn?: string;
  image?: string;
}

export interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

export interface CategoriesText {
  title_en?: string;
  title_bn?: string;
  subtitle_en?: string;
  subtitle_bn?: string;
}

export interface FeaturedText {
  title_en?: string;
  title_bn?: string;
  btn_en?: string;
  btn_bn?: string;
}

export interface ComboText {
  title_en?: string;
  title_bn?: string;
  heading_en?: string;
  heading_bn?: string;
  coupon_label_en?: string;
  coupon_label_bn?: string;
  coupon_code?: string;
  btn_text?: string;
  image?: string;
}

export interface WhyChooseText {
  title_en?: string;
  title_bn?: string;
}

export interface GalleryText {
  title_en?: string;
  title_bn?: string;
  subtitle_en?: string;
  subtitle_bn?: string;
}

export interface ReviewsText {
  title_en?: string;
  title_bn?: string;
  btn_en?: string;
  btn_bn?: string;
}

export interface QuoteText {
  arabic?: string;
  title_en?: string;
  title_bn?: string;
  text_en?: string;
  text_bn?: string;
  ref_en?: string;
  ref_bn?: string;
}

export interface CTAText {
  title_en?: string;
  title_bn?: string;
  desc_en?: string;
  desc_bn?: string;
  btn1_en?: string;
  btn1_bn?: string;
  btn2_en?: string;
  btn2_bn?: string;
}

export interface HeaderLink {
  id: string;
  label_bn: string;
  label_en: string;
  href: string;
  type?: 'link' | 'category' | 'product' | 'collection' | 'static_page' | 'external' | 'whatsapp' | 'social';
  icon?: string;
  badge?: 'new' | 'sale' | 'hot' | 'ramadan' | 'eid' | null;
  children?: HeaderLink[];
  mega_menu_config?: {
    enabled: boolean;
    layout: 'multi-column' | 'product-showcase';
    columns?: number;
    featured_product_id?: string;
    banner_url?: string;
  };
}

export interface MenuConfig {
  id: string;
  name: string;
  slug: string;
  location: 'header' | 'mobile' | 'footer' | 'sidebar' | 'mega' | 'category' | 'sticky' | 'topbar';
  status: 'published' | 'draft';
  items: HeaderLink[];
}

export interface PromoBadge {
  enabled: boolean;
  text_bn: string;
  text_en: string;
  href: string;
}

export interface OrderNotifications {
  enabled: boolean;
  admin_emails: string[];
  admin_phones: string[];
  channels: string[];
}

export interface LowStockAlerts {
  enabled: boolean;
  threshold: number;
}

export interface CustomerNotification {
  sms: boolean;
  email: boolean;
  template: string;
}
