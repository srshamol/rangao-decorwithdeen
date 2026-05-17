"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { language } = useLanguage();

  const NAV_ITEMS = [
    { label: language === 'bn' ? 'হোম' : 'Home', icon: Home, href: '/' },
    { label: language === 'bn' ? 'শপ' : 'Shop', icon: ShoppingBag, href: '/shop' },
    { label: language === 'bn' ? 'সার্চ' : 'Search', icon: Search, href: '/shop?search=true' },
    { label: language === 'bn' ? 'কার্ট' : 'Cart', icon: ShoppingCart, href: '/cart', count: totalItems },
    { label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User, href: '/account' },
  ];

  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path, query] = href.split('?');
    if (query) {
      const [key, value] = query.split('=');
      return pathname === path && searchParams.get(key) === value;
    }
    return pathname === path && !searchParams.get('search');
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-xl max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href as any}
              onClick={(e) => {
                if (item.href.includes('search=true')) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open-search'));
                }
              }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group"
            >
              <div className={`relative p-2 flex flex-col items-center transition-all duration-300 ${active ? 'text-emerald-600' : 'text-slate-400 group-active:scale-90'}`}>
                <item.icon size={22} strokeWidth={1.5} />
                
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[8px] font-black w-4 h-4 rounded-xl flex items-center justify-center border-2 border-white shadow-lg shadow-emerald-600/20">
                    {item.count}
                  </span>
                )}

                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>

                {active && (
                  <>
                    <motion.div 
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-emerald-500/5 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 w-1 h-1 bg-emerald-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
