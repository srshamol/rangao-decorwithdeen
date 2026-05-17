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
  const bn = language === 'bn';
  const gen = settings?.general_settings || {};
  const logoUrl = gen.logo || "/placeholder.svg";
  const whatsapp = gen.whatsapp || "8801540707024";
  const facebook = gen.facebook_url || "https://facebook.com/rangao.bd";
  const instagram = gen.instagram_id ? `https://instagram.com/${gen.instagram_id.replace('@', '')}` : "https://instagram.com/rangao.bd";
  const tiktok = gen.tiktok_id ? `https://tiktok.com/${gen.tiktok_id.startsWith('@') ? gen.tiktok_id : '@' + gen.tiktok_id}` : "https://tiktok.com/@rangao.bd";
  const address = gen.address || t("dhaka_bangladesh");
  const storeName = gen.store_name || "RANGAO";

  const footer = settings?.footer_settings || {
    text_bn: "আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে। আমরা দিচ্ছি প্রিমিয়াম কোয়ালিটি ইসলামিক ওয়াল ডেকোর আইটেম যা আপনার ঘরের পরিবেশকে করবে শান্ত ও মার্জিত।",
    text_en: "Elevate your home with the beauty of Deen. We provide premium Islamic wall decor that makes your home peaceful and elegant.",
    show_social: true,
    show_payment_methods: true,
    columns: [
      { id: "col-1", title_bn: "কোম্পানি", title_en: "Company", links: [{ label_bn: 'দোকান', label_en: 'Shop', href: '/shop' }, { label_bn: 'অফার', label_en: 'Combo', href: '/combo' }] },
      { id: "col-2", title_bn: "কন্টাক্ট", title_en: "Contact", links: [{ label_bn: 'হোয়াটসঅ্যাপ', label_en: 'WhatsApp', href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` }] }
    ]
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-20">
          {/* Brand Identity */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
               {gen.logo ? (
                 <img src={logoUrl} alt={storeName} className="h-8 md:h-10 brightness-0 invert" />
               ) : (
                 <span className="text-xl font-black text-white">{storeName}</span>
               )}
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-sm">
              {bn ? footer.text_bn : footer.text_en}
            </p>
            
            {footer.show_social && (
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, href: facebook, color: "hover:bg-blue-600", show: !!gen.facebook_url },
                  { icon: Instagram, href: instagram, color: "hover:bg-pink-600", show: !!gen.instagram_id },
                  { icon: TiktokIcon, href: tiktok, color: "hover:bg-primary-foreground/20", show: !!gen.tiktok_id },
                  { icon: MessageCircle, href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, color: "hover:bg-primary", show: true },
                ].filter(s => s.show).map((social, idx) => (
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
            )}
          </div>

          {/* Navigation Links Columns */}
          <div className={`md:col-span-7 grid grid-cols-2 md:grid-cols-${footer.columns?.length || 2} gap-8`}>
            {footer.columns?.map((col: any) => (
              <div key={col.id} className="space-y-6 md:space-y-8">
                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gold">{bn ? col.title_bn : col.title_en}</h4>
                <div className="space-y-3 md:space-y-4 text-sm font-bold">
                  {col.links?.map((link: any, lidx: number) => (
                    <Link 
                      key={lidx} 
                      href={link.href} 
                      className="block text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {bn ? link.label_bn : link.label_en}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold text-primary-foreground/40">
          <p>© {new Date().getFullYear()} {footer.copyright_text || `${storeName}। ${t('copyright')}`}</p>
          <div className="flex items-center gap-8 uppercase tracking-widest">
            <a href="#" className="hover:text-primary-foreground transition-colors">{t('privacy_policy')}</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">{t('terms_conditions')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
