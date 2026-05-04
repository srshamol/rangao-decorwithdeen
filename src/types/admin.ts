
export interface AdminSettings {
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
  customer_notifications?: Record<string, CustomerNotification>;
  [key: string]: any;
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
  label_bn: string;
  label_en: string;
  href: string;
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
