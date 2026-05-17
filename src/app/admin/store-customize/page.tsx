"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Palette, Layout, Home, Save,
  Loader2, Zap, Moon, Sparkles, Check, Globe, Menu as MenuIcon, Layers, Code, Undo2, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import { AdminSettings } from "@/types/admin";

import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { BrandingSettings } from "@/components/admin/settings/BrandingSettings";
import { StoreDesignSettings } from "@/components/admin/settings/StoreDesignSettings";
import { NavigationSettings } from "@/components/admin/settings/NavigationSettings";
import { HomepageSettings } from "@/components/admin/settings/HomepageSettings";
import { FooterSettings } from "@/components/admin/settings/FooterSettings";
import { CodeInjectionSettings } from "@/components/admin/settings/CodeInjectionSettings";

const THEMES = [
  { id: "default", label: "Rangao Default", sub: "Light Theme", recommended: true, preview: "bg-gradient-to-br from-emerald-50 to-white" },
  { id: "minimal", label: "Minimal", sub: "Clean & Modern", preview: "bg-gradient-to-br from-slate-50 to-white" },
  { id: "elegant", label: "Elegant", sub: "Premium Look", preview: "bg-gradient-to-br from-amber-50 to-stone-50" },
  { id: "vibrant", label: "Vibrant", sub: "Colorful Style", preview: "bg-gradient-to-br from-purple-100 to-pink-50" },
];

const CAMPAIGNS = [
  { id: "ramadan", label: "রমজান মোড", icon: Moon, color: "text-purple-500 bg-purple-50" },
  { id: "eid", label: "ঈদ মোড", icon: Sparkles, color: "text-amber-500 bg-amber-50" },
];

type EditorView = "root" | "general" | "header" | "homepage" | "footer" | "code";

interface StoreConfig {
  theme: string;
  layout: "boxed" | "full";
  container_width: number;
  sidebar_position: "left" | "right";
  product_grid: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  bg_color: string;
  text_color: string;
  show_hero: boolean;
  show_categories: boolean;
  show_combo: boolean;
  show_reviews: boolean;
  show_featured: boolean;
  show_gallery: boolean;
}

export default function StoreCustomizePage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { settings: storeSettings, loading: settingsLoading } = useSettings();
  const [view, setView] = useState<EditorView>("root");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);

  const [config, setConfig] = useState<StoreConfig>({
    theme: "default",
    layout: "boxed",
    container_width: 1200,
    sidebar_position: "left",
    product_grid: 3,
    primary_color: "#0F3D2E",
    secondary_color: "#D4AF37",
    accent_color: "#10b981",
    bg_color: "#ffffff",
    text_color: "#1a1a1a",
    show_hero: true,
    show_categories: true,
    show_combo: true,
    show_reviews: true,
    show_featured: true,
    show_gallery: true,
  });

  const [generalSettings, setGeneralSettings] = useState<Partial<AdminSettings>>({});
  const [brandingSettings, setBrandingSettings] = useState<Partial<AdminSettings>>({});
  const [designSettings, setDesignSettings] = useState<AdminSettings>({
    hero_slides: [],
    home_banners: [],
    home_cta: { title: "", subtitle: "", button_text: "", button_link: "", image_url: "" },
    trust_badges: [],
    show_categories: true,
    show_featured: true,
    show_combo: true,
    homepage_sections: []
  });
  const [navigationSettings, setNavigationSettings] = useState<Partial<AdminSettings>>({
    header_links: [],
    show_categories: true,
    promo_badge: { text_bn: "", text_en: "", href: "", enabled: false }
  });
  const [footerSettings, setFooterSettings] = useState<Partial<AdminSettings>>({});

  useEffect(() => {
    if (storeSettings) {
      if (storeSettings.store_customize) setConfig(prev => ({ ...prev, ...storeSettings.store_customize }));
      if (storeSettings.general_settings) setGeneralSettings(storeSettings.general_settings);
      if (storeSettings.branding_settings) setBrandingSettings(storeSettings.branding_settings);
      
      const design: AdminSettings = { ...designSettings };
      if (storeSettings.hero_slides) design.hero_slides = storeSettings.hero_slides;
      if (storeSettings.home_banners) design.home_banners = storeSettings.home_banners;
      if (storeSettings.home_cta) design.home_cta = storeSettings.home_cta;
      if (storeSettings.trust_badges) design.trust_badges = storeSettings.trust_badges;
      if (storeSettings.homepage_config) Object.assign(design, storeSettings.homepage_config);
      setDesignSettings(design);

      if (storeSettings.navigation_settings) setNavigationSettings(storeSettings.navigation_settings);
      if (storeSettings.footer_settings) setFooterSettings(storeSettings.footer_settings);
    }
  }, [storeSettings]);

  const update = useCallback(<K extends keyof StoreConfig>(key: K, val: StoreConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        supabase.from("store_configs").upsert({ id: "store_customize", value: config }),
        supabase.from("store_configs").upsert({ id: "general_settings", value: generalSettings }),
        supabase.from("store_configs").upsert({ id: "branding_settings", value: brandingSettings }),
        supabase.from("store_configs").upsert({ id: "hero_slides", value: designSettings.hero_slides }),
        supabase.from("store_configs").upsert({ id: "home_banners", value: designSettings.home_banners }),
        supabase.from("store_configs").upsert({ id: "home_cta", value: designSettings.home_cta }),
        supabase.from("store_configs").upsert({ id: "trust_badges", value: designSettings.trust_badges }),
        supabase.from("store_configs").upsert({ id: "navigation_settings", value: navigationSettings }),
        supabase.from("store_configs").upsert({ id: "footer_settings", value: footerSettings }),
        supabase.from("store_configs").upsert({ id: "homepage_config", value: {
          show_categories: designSettings.show_categories,
          show_featured: designSettings.show_featured,
          show_combo: designSettings.show_combo,
          featured_product_ids: designSettings.featured_product_ids,
          combo_product_ids: designSettings.combo_product_ids,
          selected_categories: designSettings.selected_categories,
          hero_text: designSettings.hero_text,
          categories_text: designSettings.categories_text,
          featured_text: designSettings.featured_text,
          why_choose_text: designSettings.why_choose_text,
          combo_text: designSettings.combo_text,
          gallery_text: designSettings.gallery_text,
          reviews_text: designSettings.reviews_text,
          quote_text: designSettings.quote_text,
          cta_text: designSettings.cta_text,
          homepage_sections: designSettings.homepage_sections,
        }})
      ];

      await Promise.all(updates);
      toast.success(isBn ? "স্টোর আপডেট সেভ হয়েছে ✓" : "Store config saved ✓");
      setHasChanges(false);
    } catch {
      toast.error(isBn ? "সেভ করা সম্ভব হয়নি" : "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setHasChanges(false);
    toast.info(isBn ? "পরিবর্তন বাতিল করা হয়েছে" : "Changes discarded");
  };

  const SECTIONS = [
    { 
      id: "general", 
      label: isBn ? "স্টোর আইডেন্টিটি" : "Store Identity", 
      icon: Globe, 
      desc: isBn ? "লোগো, নাম ও কন্টাক্ট" : "Logo, name & contact details",
      color: "from-blue-500 to-indigo-600",
      accent: "bg-blue-500/10 text-blue-500"
    },
    { 
      id: "homepage", 
      label: isBn ? "হোমপেজ লেআউট" : "Homepage Studio", 
      icon: Layout, 
      desc: isBn ? "সেকশন সাজান ও এডিট" : "Build & arrange your homepage",
      color: "from-emerald-500 to-teal-600",
      accent: "bg-emerald-500/10 text-emerald-500"
    },
    { 
      id: "header", 
      label: isBn ? "নেভিগেশন মেনু" : "Navigation & Links", 
      icon: MenuIcon, 
      desc: isBn ? "হেডার মেনু বিল্ডার" : "Configure menus & top links",
      color: "from-purple-500 to-violet-600",
      accent: "bg-purple-500/10 text-purple-500"
    },
    { 
      id: "footer", 
      label: isBn ? "ফুটার কাস্টমাইজ" : "Footer Architecture", 
      icon: Layers, 
      desc: isBn ? "ফুটার সেকশন এডিট" : "Design the bottom of your site",
      color: "from-amber-500 to-orange-600",
      accent: "bg-amber-500/10 text-amber-500"
    },
    { 
      id: "code", 
      label: isBn ? "কোড ইনজেকশন" : "Code Injection", 
      icon: Code, 
      desc: isBn ? "কাস্টম CSS এবং JS" : "Inject custom styling and scripts",
      color: "from-purple-500 to-indigo-600",
      accent: "bg-purple-500/10 text-purple-500"
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 selection:bg-primary/20">
      
      {/* Header Banner - Standard Admin Style */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold">{isBn ? "ডিজাইন স্টুডিও" : "Design Studio"}</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-xl text-xs font-medium uppercase">
                <Sparkles size={12} className="text-emerald-400" />
                Storefront v4.2
              </div>
            </div>
            <p className="text-xs text-white/60">{isBn ? "আপনার স্টোরের লুক এবং ফিল পরিবর্তন করুন" : "Customize your storefront's visual identity and layout"}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={handleDiscard} 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all"
              >
                {isBn ? "বাতিল" : "Discard"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                hasChanges 
                  ? "bg-white text-primary shadow-lg hover:bg-white/90" 
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? (isBn ? "সেভ হচ্ছে..." : "Saving...") : (isBn ? "পরিবর্তন সেভ করুন" : "Publish")}
            </button>
          </div>
        </div>
      </div>

      <main className="animate-in fade-in duration-500">
        <AnimatePresence mode="wait" initial={false}>
          {view === "root" ? (
            <motion.div 
              key="root"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setView(section.id as EditorView)}
                    className="group p-6 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-left relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${section.accent} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                        <section.icon size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{section.label}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{section.desc}</p>
                      </div>
                      <Undo2 className="rotate-180 text-slate-300 group-hover:text-primary transition-colors mt-1" size={16} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Simplified Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Storefront", status: "Active", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                  { label: "Performance", status: "98/100", icon: Monitor, color: "text-blue-500", bg: "bg-blue-500/5" },
                  { label: "Version", status: "Pro v4.2", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/5" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{stat.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setView("root")} 
                  className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
                >
                  <Undo2 size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                    {SECTIONS.find(s => s.id === view)?.label}
                  </h3>
                  <div className="w-8 h-1 bg-primary rounded-full mt-2" />
                </div>
              </div>

              <div className="pb-20">
                    {view === "general" && (
                      <GeneralSettings
                        settings={generalSettings}
                        brandingSettings={brandingSettings}
                        onUpdate={(data: any) => {
                          setGeneralSettings({ ...generalSettings, ...data });
                          setHasChanges(true);
                        }}
                        onBrandingUpdate={(field: string, val: any) => {
                          setBrandingSettings({ ...brandingSettings, [field]: val });
                          setHasChanges(true);
                        }}
                      />
                    )}

                    {view === "homepage" && (
                      <HomepageSettings
                        settings={designSettings}
                        onUpdate={(data: any) => {
                          setDesignSettings({ ...designSettings, ...data });
                          setHasChanges(true);
                        }}
                      />
                    )}

                    {view === "header" && (
                      <NavigationSettings
                        settings={navigationSettings}
                        onUpdate={(data: any) => {
                          setNavigationSettings({ ...navigationSettings, ...data });
                          setHasChanges(true);
                        }}
                      />
                    )}

                    {view === "footer" && (
                      <FooterSettings
                        settings={footerSettings || {}}
                        onUpdate={(data: any) => {
                          setFooterSettings({ ...footerSettings, ...data });
                          setHasChanges(true);
                        }}
                      />
                    )}

                    {view === "code" && (
                      <CodeInjectionSettings
                        settings={generalSettings as any}
                        onUpdate={(data: any) => {
                          setGeneralSettings({ ...generalSettings, ...data });
                          setHasChanges(true);
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
        </AnimatePresence>
      </main>

      {/* Sticky Publication Bar - High Contrast Elite */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 flex items-center justify-between gap-12 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] border border-white/10 dark:border-slate-200 min-w-[600px]"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles size={20} className="text-primary animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[13px] font-black uppercase tracking-tight">
                  {isBn ? "অপ্রকাশিত পরিবর্তন" : "Unpublished Design Changes"}
                </p>
                <p className="text-[10px] opacity-60 font-medium uppercase tracking-[0.1em]">
                  {isBn ? "সেভ না করলে পরিবর্তনগুলো স্টোরে দেখা যাবে না" : "Changes are staged. Click publish to go live."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleDiscard}
                className="h-12 px-6 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 dark:hover:bg-slate-100 rounded-xl transition-all"
              >
                {isBn ? "বাতিল" : "Discard"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 px-10 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? (isBn ? "সেভ হচ্ছে..." : "Saving...") : (isBn ? "পাবলিশ করুন" : "Publish Now")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
