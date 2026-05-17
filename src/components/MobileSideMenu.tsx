"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import { X, ChevronRight, Phone, MessageCircle, User, LogOut, Globe, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "./ui/button";

interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSideMenu({ isOpen, onClose }: MobileSideMenuProps) {
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const gen = settings?.general_settings || {};
  const bn = language === 'bn';

  const navSettings = settings?.navigation_settings || {};
  const homeSettings = settings?.home_page_settings || {};
  const NAV_LINKS = navSettings.header_links?.length > 0 ? navSettings.header_links : [
    { label_bn: 'ক্যানভাস', label_en: 'Canvas', href: '/shop?category=canvas' },
    { label_bn: 'ওয়াল স্টিকার', label_en: 'Wall Sticker', href: '/shop?category=sticker' },
    { label_bn: 'ইসলামিক পোস্টার', label_en: 'Islamic Poster', href: '/shop?category=poster' },
    { label_bn: 'হোম ডেকোর', label_en: 'Home Decor', href: '/shop?category=decor' },
    { label_bn: 'উপহার সামগ্রী', label_en: 'Gift Items', href: '/shop?category=gift' },
    { label_bn: 'কম্বো অফার 🔥', label_en: 'Combo Offer 🔥', href: '/combo' },
  ];

  const whatsapp = settings?.general_settings?.whatsapp || "8801540707024";
  const logoUrl = settings?.general_settings?.logo || (logo as any).src;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full bg-white border-r-0">
        <SheetHeader className="p-8 border-b border-slate-50 flex-shrink-0 text-center relative overflow-hidden flex items-center justify-center">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-50" />
          
          <div className="flex flex-col items-center gap-4">
             {homeSettings.show_logo !== false && (gen.logo ? (
                <img src={gen.logo} alt={gen.store_name || "Rangao"} className="h-14 w-auto object-contain mx-auto" />
             ) : (
                <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-600/20 mx-auto">
                  {(gen.store_name || "Rangao").charAt(0).toUpperCase()}
                </div>
             ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {/* Main Links */}
          <div className="px-4 space-y-1">
             <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("categories_title")}</p>
             {NAV_LINKS.map((link: any) => (
               <Link 
                 key={link.href} 
                 href={link.href} 
                 onClick={onClose}
                 className="flex items-center justify-between p-4 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-primary transition-all group"
               >
                 <span className="font-bold text-[15px]">{bn ? link.label_bn : link.label_en}</span>
                 <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
               </Link>
             ))}
          </div>

          <div className="mt-8 px-4 space-y-1">
             <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("settings_title")}</p>
             <button 
               onClick={() => { setLanguage(bn ? 'en' : 'bn'); onClose(); }}
               className="w-full flex items-center justify-between p-4 rounded-xl text-slate-700 hover:bg-slate-50 transition-all group"
             >
               <div className="flex items-center gap-3">
                 <Globe size={18} className="text-slate-400" />
                 <span className="font-bold text-[15px]">{bn ? 'English Version' : 'বাংলা ভার্সন'}</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
             </button>
             <Link 
               href="/account" 
               onClick={onClose}
               className="flex items-center justify-between p-4 rounded-xl text-slate-700 hover:bg-slate-50 transition-all group"
             >
               <div className="flex items-center gap-3">
                 <User size={18} className="text-slate-400" />
                 <span className="font-bold text-[15px]">{t("my_account")}</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
             </Link>
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 space-y-4">
           <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                 <Phone size={18} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("helpline")}</p>
                 <p className="text-sm font-black text-slate-900">{whatsapp}</p>
              </div>
           </div>
           
           <Button asChild className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#1fb355] text-white font-black text-sm gap-2 shadow-lg shadow-[#25D366]/20">
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                 <MessageCircle size={20} />
                 {t("whatsapp_chat")}
              </a>
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
