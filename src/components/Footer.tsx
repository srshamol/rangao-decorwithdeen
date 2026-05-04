"use client";

import Link from "next/link";
import { MessageCircle, Instagram, Facebook, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";

const TiktokIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    <path d="M15 8a4 4 0 1 0-4-4" />
    <path d="M15 4v12" />
  </svg>
);

export function Footer() {
  const { settings } = useSettings();
  const { language, t } = useLanguage();
  const gen = settings?.general_settings || {};
  const logoUrl = gen.logo || (logo as any).src;
  const whatsapp = gen.whatsapp || "8801540707024";
  const facebook = gen.facebook_url || "https://facebook.com/rangao.bd";
  const instagram = gen.instagram_id ? `https://instagram.com/${gen.instagram_id.replace('@', '')}` : "https://instagram.com/rangao.bd";
  const tiktok = gen.tiktok_id ? `https://tiktok.com/${gen.tiktok_id.startsWith('@') ? gen.tiktok_id : '@' + gen.tiktok_id}` : "https://tiktok.com/@rangao.bd";
  const address = gen.address || t("dhaka_bangladesh");
  const storeName = gen.store_name || "RANGAO - রাঙাও";
  const copyrightText = gen.copyright || `${storeName}। ${t('copyright')}`;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-20">
          {/* Brand Identity */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <img src={logoUrl} alt="Rangao" className="h-8 md:h-10 brightness-0 invert" />
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-sm">
              {gen.footer_description || t("footer_desc_fallback")}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: facebook, color: "hover:bg-blue-600" },
                { icon: Instagram, href: instagram, color: "hover:bg-pink-600" },
                { icon: TiktokIcon, href: tiktok, color: "hover:bg-primary-foreground/20" },
                { icon: MessageCircle, href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, color: "hover:bg-primary" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110 active:scale-95 group`}
                >
                  <social.icon size={18} className="text-primary-foreground/60 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links & Contact Grid on Mobile */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-7 gap-8">
            <div className="md:col-span-3">
              <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gold mb-6 md:mb-8">{t('company')}</h4>
              <div className="space-y-3 md:space-y-4 text-sm font-bold">
                <Link href="/shop" className="block text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t('shop')}</Link>
                <Link href="/combo" className="block text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t('combo')}</Link>
                <a href="#reviews" className="block text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t('reviews')}</a>
                <Link href="/admin" className="block text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  {t('admin_panel')}
                </Link>
              </div>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gold mb-6 md:mb-8">{t('contact')}</h4>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 md:w-[18px] md:h-[18px] text-gold" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary-foreground/40 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-[13px] md:text-sm font-bold mt-0.5 text-primary-foreground/80">+{whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 md:w-[18px] md:h-[18px] text-gold" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary-foreground/40 uppercase tracking-widest">{t('address')}</p>
                    <p className="text-[13px] md:text-sm font-bold mt-0.5 text-primary-foreground/80">{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold text-primary-foreground/40">
          <p>© {new Date().getFullYear()} {copyrightText}</p>
          <div className="flex items-center gap-8 uppercase tracking-widest">
            <a href="#" className="hover:text-primary-foreground transition-colors">{t('privacy_policy')}</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">{t('terms_conditions')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
