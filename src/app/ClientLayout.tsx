"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, TRACKING_EVENTS, initPixel } from "@/lib/tracking";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic imports for non-critical components to improve initial TTI and reduced main bundle
const ScrollProgress = dynamic(() => import("@/components/ScrollProgress").then(mod => mod.ScrollProgress), { ssr: false });

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton").then(mod => mod.WhatsAppButton), { ssr: false });
const VisitorTracker = dynamic(() => import("@/components/VisitorTracker").then(mod => mod.VisitorTracker), { ssr: false });
const BottomNav = dynamic(() => import("@/components/BottomNav").then(mod => mod.BottomNav), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/SearchOverlay").then(mod => mod.SearchOverlay), { ssr: false });





function CartRecoveryHandler() {
  const { setCartItems } = useCart();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [recoveredItems, setRecoveredItems] = React.useState<any[]>([]);
  const [recoveredTotal, setRecoveredTotal] = React.useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const recoveryId = searchParams.get('cart_recovery');
    if (recoveryId) {
      const fetchRecoveredCart = async () => {
        try {
          const { data, error } = await supabase
            .from("abandoned_carts")
            .select("*")
            .eq("id", recoveryId)
            .single();
          
          if (!error && data) {
            const items = (data.items as any[]).map((i: any) => ({
              ...i,
              quantity: i.qty || i.quantity || 1,
              images: i.images || (i.image ? [i.image] : [])
            }));
            setRecoveredItems(items);
            setRecoveredTotal(data.total_amount);
            setCartItems(items);
            setIsModalOpen(true);
            toast.success("Welcome back! We've restored your cart.", {
              description: "Review your items and complete your order."
            });
            
            // Clear URL param without reloading
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        } catch (err) {
          console.error("Recovery failed", err);
        }
      };
      fetchRecoveredCart();
    }
  }, [searchParams, setCartItems]);

  return (
    <CheckoutModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      items={recoveredItems}
      total={recoveredTotal}
    />
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const gen = settings?.general_settings;
    if (!gen) return;
    
    const title = gen.store_name 
      ? `${gen.store_name}${gen.store_tagline ? ` - ${gen.store_tagline}` : ""}`
      : "Rangao - রাঙাও | Premium Islamic Wall Decor";
    document.title = title;

    if (gen.favicon) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = gen.favicon;
    }
  }, [settings]);

  useEffect(() => {
    const gen = settings?.general_settings;
    const root = document.documentElement;

    const hexTint = (hex: string, ratio: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const tr = Math.round(Math.min(255, Math.max(0, r + (255 - r) * ratio)));
      const tg = Math.round(Math.min(255, Math.max(0, g + (255 - g) * ratio)));
      const tb = Math.round(Math.min(255, Math.max(0, b + (255 - b) * ratio)));
      return `#${[tr, tg, tb].map(c => c.toString(16).padStart(2, '0')).join('')}`;
    };

    const primary = gen?.primary_color || '#064E3B';
    const accent = gen?.accent_color || '#C5A24D';
    const bg = gen?.background_color || '#FFFFFF';
    const card = gen?.card_color || '#FFFFFF';
    const border = gen?.border_color || '#F1F5F9';
    const textDark = gen?.text_dark || '#0F172A';
    const textBody = gen?.text_body || '#475569';
    const textLight = gen?.text_light || '#94A3B8';
    const primaryFg = '#FFFFFF';
    const accentFg = '#FFFFFF';

    const secondary = hexTint(bg, -0.04);
    const darkBg = '#05070A';
    const darkCard = '#0B1221';
    const darkElevated = '#111827';
    const darkBorder = '#1E293B';
    const darkFg = '#F8FAFC';
    const darkFgSecondary = '#CBD5E1';
    const darkFgMuted = '#64748B';

    const rootCss = `:root {
      --background: ${bg};
      --foreground: ${textDark};
      --card: ${card};
      --card-foreground: ${textDark};
      --popover: ${card};
      --popover-foreground: ${textDark};
      --primary: ${primary};
      --primary-foreground: ${primaryFg};
      --secondary: ${secondary};
      --secondary-foreground: ${textBody};
      --muted: ${secondary};
      --muted-foreground: ${textLight};
      --accent: ${accent};
      --accent-foreground: ${accentFg};
      --destructive: #ef4444;
      --destructive-foreground: #ffffff;
      --border: ${border};
      --input: ${border};
      --ring: ${primary};
      --gold: ${accent};
      --gold-foreground: ${accentFg};
      --sidebar: #0F172A;
      --sidebar-foreground: #F8FAFC;
      --sidebar-primary: ${primary};
      --sidebar-primary-foreground: #FFFFFF;
      --sidebar-accent: #1E293B;
      --sidebar-accent-foreground: #FFFFFF;
      --sidebar-border: #1E293B;
      --sidebar-ring: ${primary};
    }`;

    const darkCss = `.dark {
      --background: ${darkBg};
      --foreground: ${darkFg};
      --card: ${darkCard};
      --card-foreground: ${darkFg};
      --popover: ${darkCard};
      --popover-foreground: ${darkFg};
      --primary: ${primary};
      --primary-foreground: #FFFFFF;
      --secondary: ${darkElevated};
      --secondary-foreground: ${darkFgSecondary};
      --muted: ${darkElevated};
      --muted-foreground: ${darkFgMuted};
      --accent: ${darkElevated};
      --accent-foreground: ${accent};
      --destructive: #F43F5E;
      --destructive-foreground: #FFFFFF;
      --border: ${darkBorder};
      --input: ${darkBorder};
      --ring: ${primary};
      --gold: ${accent};
      --gold-foreground: ${darkBg};
      --chart-1: ${primary};
      --chart-2: ${accent};
      --sidebar: #020617;
      --sidebar-foreground: #F8FAFC;
      --sidebar-primary: ${primary};
      --sidebar-primary-foreground: #FFFFFF;
      --sidebar-accent: ${darkBorder};
      --sidebar-accent-foreground: #FFFFFF;
      --sidebar-border: ${darkBorder};
      --sidebar-ring: ${primary};
    }`;

    let themeStyle = document.getElementById('rangao-theme-vars');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'rangao-theme-vars';
      document.head.appendChild(themeStyle);
    }
    themeStyle.textContent = `${rootCss}\n${darkCss}`;

    if (gen?.heading_font) {
      root.style.setProperty('--font-heading', `"${gen.heading_font}", sans-serif`);
    }
    if (gen?.body_font) {
      root.style.setProperty('--font-body', `"${gen.body_font}", sans-serif`);
    }
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) {
      trackEvent(TRACKING_EVENTS.PAGE_VIEW);
    }
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin || !settings) return;

    const pixelConfig = settings.integrations?.find((i: any) => i.providerId === 'metapixel' && i.isActive);
    if (pixelConfig?.config?.pixel_id) {
      initPixel(pixelConfig.config.pixel_id, pixelConfig.config.test_code);
    }

    const timer = setTimeout(() => {
      trackEvent(TRACKING_EVENTS.TIME_ON_PAGE, { seconds: 30, path: pathname });
    }, 30000);

    let scrollTracked = false;
    const handleScroll = () => {
      if (scrollTracked) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.5) {
        trackEvent(TRACKING_EVENTS.PAGE_SCROLL, { percentage: 50, path: pathname });
        scrollTracked = true;
      }
    };
    window.addEventListener('scroll', handleScroll);

    const handleInternalClicks = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href.startsWith(window.location.origin)) {
        const href = target.getAttribute('href');
        if (href && !href.startsWith('#')) {
          trackEvent(TRACKING_EVENTS.INTERNAL_CLICK, { 
            target_url: href,
            link_text: target.innerText?.trim().slice(0, 50)
          });
        }
      }
    };
    document.addEventListener('click', handleInternalClicks);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleInternalClicks);
    };
  }, [pathname, isAdmin, settings]);

  const [showDeferred, setShowDeferred] = React.useState(false);

  useEffect(() => {
    // Delay non-critical components by 1s to prioritize initial render
    const timer = setTimeout(() => setShowDeferred(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ScrollProgress />
      {showDeferred && <VisitorTracker />}
      <Suspense fallback={null}>
        <CartRecoveryHandler />
      </Suspense>
      {!isAdmin && <Header />}
      <main className={isAdmin ? "" : "min-h-screen"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {showDeferred && !isAdmin && (
        <>
          <WhatsAppButton />
          <BottomNav />
          <SearchOverlay />
        </>
      )}
    </>
  );
}
