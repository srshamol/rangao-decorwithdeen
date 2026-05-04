"use client";

import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  User, 
  Languages, 
  X, 
  Loader2, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";
import { MobileSideMenu } from "./MobileSideMenu";
import { CartDrawer } from "./CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tables } from "@/integrations/supabase/types";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tables<"products">[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const gen = settings?.general_settings || {};
  const searchRef = useRef<HTMLDivElement>(null);

  const whatsapp = settings?.general_settings?.whatsapp || "8801540707024";

  const homeSettings = settings?.homepage_config || {};
  const navSettings = settings?.navigation_settings || {};
  const NAV_LINKS = navSettings.header_links?.length > 0 ? navSettings.header_links : [
    { label_bn: 'ক্যানভাস', label_en: 'Canvas', href: '/shop?category=canvas' },
    { label_bn: 'ওয়াল স্টিকার', label_en: 'Wall Sticker', href: '/shop?category=sticker' },
    { label_bn: 'ইসলামিক পোস্টার', label_en: 'Islamic Poster', href: '/shop?category=poster' },
    { label_bn: 'হোম ডেকোর', label_en: 'Home Decor', href: '/shop?category=decor' },
    { label_bn: 'উপহার সামগ্রী', label_en: 'Gift Items', href: '/shop?category=gift' },
    { label_bn: 'কম্বো অফার 🔥', label_en: 'Combo Offer 🔥', href: '/combo' },
  ];

  const showCategories = navSettings.show_categories !== false;
  const promoBadge = navSettings.promo_badge || { text_bn: "রমজান অফার", text_en: "Ramadan Offer", href: "/shop?offers=true", enabled: true };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      setShowSuggestions(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_bn, price, images, slug")
        .or(`name.ilike.%${searchQuery}%,name_bn.ilike.%${searchQuery}%`)
        .eq("status", "active")
        .limit(6);

      if (!error && data) {
        setSearchResults(data);
      }
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const isActive = (href: string) => pathname === href;

  const actionButtonStyle = "flex items-center justify-center group active:scale-95 transition-all duration-300";
  const actionIconContainerStyle = "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-slate-800 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300";
  const actionTextStyle = "hidden";

  return (
    <>
      <header className={`w-full z-[60] bg-white transition-all duration-300 ${scrolled ? 'sticky top-0 shadow-sm' : 'relative'}`}>
        {/* Top Row: Logo, Search, Icons */}
        <div className="border-b border-slate-50">
          <div className={`container mx-auto max-w-7xl px-4 transition-all duration-300 ${scrolled ? 'h-14 md:h-16' : 'h-16 md:h-24'} flex items-center justify-between lg:justify-between gap-4 md:gap-10`}>
             {/* Left: Mobile Menu */}
             <div className="flex lg:hidden items-center w-12">
                <button 
                  className="flex items-center justify-center text-slate-800 active:scale-95 transition-all p-1" 
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu size={24} strokeWidth={1.5} />
                </button>
             </div>

            {/* Center: Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Link href="/" className="flex items-center gap-2 shrink-0">
               {homeSettings.show_logo !== false && (gen.logo ? (
                  <img src={gen.logo} alt={gen.store_name || "Rangao"} className={`transition-all duration-300 ${scrolled ? 'h-8 md:h-9' : 'h-10 md:h-12'} w-auto object-contain`} />
               ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-primary/10">
                    {(gen.store_name || "Rangao").charAt(0).toUpperCase()}
                  </div>
               ))}
               {(homeSettings.show_name !== false || homeSettings.show_tagline !== false) && (
                 <div className="hidden md:block">
                    {homeSettings.show_name !== false && (
                      <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight uppercase">{gen.store_name || "RANGAO"}</h1>
                    )}
                    {homeSettings.show_tagline !== false && (
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{gen.store_tagline || t("decor_dream_space")}</p>
                    )}
                 </div>
               )}
              </Link>
            </div>

            {/* Search Bar - Hidden on Mobile, Shown on Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl relative" ref={searchRef}>
               <form onSubmit={handleSearchSubmit} className="w-full relative group">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                    placeholder={t("search_placeholder")}
                    className={`w-full transition-all duration-300 ${scrolled ? 'h-10' : 'h-12'} bg-slate-50 border border-slate-200 rounded-xl px-6 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                  />
                  <button type="submit" className={`absolute right-0 top-0 transition-all duration-300 ${scrolled ? 'h-10 w-12' : 'h-12 w-14'} bg-primary text-white rounded-r-xl flex items-center justify-center hover:bg-primary/95 transition-all shadow-lg shadow-primary/10`}>
                     {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
                  </button>
               </form>

               {/* Search Suggestions Dropdown */}
               <AnimatePresence>
                 {showSuggestions && (searchQuery.trim().length >= 2) && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[70] min-w-[300px]"
                   >
                     {isSearching && searchResults.length === 0 ? (
                       <div className="p-8 text-center text-slate-400">
                         <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary/40" />
                         <p className="text-sm font-medium">{t("searching")}</p>
                       </div>
                     ) : searchResults.length > 0 ? (
                       <div className="p-2">
                         <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                           {t("product_suggestions")}
                         </div>
                         {searchResults.map((product) => (
                           <Link 
                             key={product.id}
                             href={`/product/${product.slug}`}
                             onClick={() => setShowSuggestions(false)}
                             className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                           >
                             <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                               {product.images?.[0] && (
                                 <img 
                                   src={product.images[0]} 
                                   alt={product.name} 
                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                 />
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-sm font-bold text-slate-800 truncate">
                                 {language === 'bn' ? product.name_bn : product.name}
                               </h4>
                               <p className="text-xs font-black text-primary">৳{product.price}</p>
                             </div>
                             <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                           </Link>
                         ))}
                         <button 
                           onClick={handleSearchSubmit}
                           className="w-full p-3 text-center text-[13px] font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all mt-1 rounded-xl"
                         >
                           {t("view_all_results")} ({searchResults.length}+)
                         </button>
                       </div>
                     ) : !isSearching && (
                       <div className="p-8 text-center text-slate-400">
                         <Search size={24} className="mx-auto mb-2 opacity-20" />
                         <p className="text-sm font-medium">{t("no_products_found")}</p>
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

               <div className="flex items-center gap-4 md:gap-8">
                  {/* Language Switcher - Desktop */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                       onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                       className={`${actionButtonStyle} hidden lg:flex`}
                      >
                         <Languages size={22} strokeWidth={1.5} className="transition-transform group-hover:rotate-12" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {language === 'bn' ? "English" : "বাংলা"}
                    </TooltipContent>
                  </Tooltip>


                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/account" className={`${actionButtonStyle} hidden lg:flex`}>
                         <User size={22} strokeWidth={1.5} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {t("my_account")}
                    </TooltipContent>
                  </Tooltip>
                  

                   <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                       onClick={() => setCartOpen(true)}
                       className={`${actionButtonStyle} hidden lg:flex relative`}
                      >
                         <ShoppingBag size={24} strokeWidth={1.5} />
                         {totalItems > 0 && (
                           <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg shadow-emerald-600/20">
                             {totalItems}
                           </span>
                         )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {t("shopping_cart")}
                    </TooltipContent>
                   </Tooltip>
                   
                   {/* Mobile Translate Trigger */}
                   <button 
                     onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                     className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-800 active:scale-95 transition-all"
                   >
                     <Languages size={22} strokeWidth={1.5} />
                   </button>
                </div>
          </div>
        </div>

        {/* Navigation Row - Desktop Only */}
        <div className={`hidden lg:block border-b border-slate-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white/95 backdrop-blur-md' : 'relative py-3'}`}>
          <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
              <div className="flex items-center gap-10">
                {showCategories && (
                  <button className="flex items-center gap-3 text-slate-900 font-bold text-sm hover:text-primary transition-all group">
                     <Menu size={18} />
                     {t("all_categories")}
                     <ChevronRight size={14} className="rotate-90 text-slate-400 group-hover:text-primary transition-transform" />
                  </button>
                )}


                <nav className="flex items-center gap-8">
                  {NAV_LINKS.map((link: any) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`text-[13px] font-bold transition-all relative py-1 ${
                        isActive(link.href) ? "text-primary" : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      {language === 'bn' ? link.label_bn : link.label_en}
                      {isActive(link.href) && (
                        <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  ))}
                </nav>
             </div>

             {promoBadge.enabled && (
               <Link href={promoBadge.href} className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl text-xs font-black hover:bg-primary/10 transition-all">
                  <Sparkles size={14} className="text-gold" />
                  {language === 'bn' ? promoBadge.text_bn : promoBadge.text_en}
               </Link>
             )}
          </div>
        </div>
      </header>

      <MobileSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
