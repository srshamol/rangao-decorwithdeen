"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Palette, Layout, Home, Monitor, Smartphone, Save,
  AlertTriangle, Loader2, Eye, ChevronRight, Zap,
  Moon, Sun, Flame, Gift, RefreshCw, ExternalLink,
  ToggleLeft, ToggleRight, Image as ImageIcon, Type,
  Layers, Star, Sparkles, Check, X, Upload, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";

const THEMES = [
  { id: "default", label: "Rangao Default", sub: "Light Theme", recommended: true, preview: "bg-gradient-to-br from-emerald-50 to-white" },
  { id: "minimal", label: "Minimal", sub: "Clean & Modern", preview: "bg-gradient-to-br from-slate-50 to-white" },
  { id: "elegant", label: "Elegant", sub: "Premium Look", preview: "bg-gradient-to-br from-amber-50 to-stone-50" },
  { id: "vibrant", label: "Vibrant", sub: "Colorful Style", preview: "bg-gradient-to-br from-purple-100 to-pink-50" },
];

const CAMPAIGNS = [
  { id: "ramadan", label: "রমজান মোড", icon: Moon, color: "text-purple-500 bg-purple-50" },
  { id: "eid", label: "ঈদ মোড", icon: Sparkles, color: "text-amber-500 bg-amber-50" },
  { id: "wedding", label: "বিবাহ মোড", icon: Gift, color: "text-rose-500 bg-rose-50" },
];

const COLOR_PRESETS = [
  { id: "islamic", label: "Islamic", primary: "#0F3D2E", secondary: "#D4AF37" },
  { id: "minimal", label: "Minimal", primary: "#1a1a1a", secondary: "#6366f1" },
  { id: "luxury", label: "Luxury", primary: "#7c3aed", secondary: "#D4AF37" },
];

type Tab = "theme" | "colors" | "header" | "homepage" | "footer" | "advanced";

interface StoreConfig {
  theme: string;
  layout: string;
  container_width: number;
  sidebar_position: string;
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
  const { settings: storeSettings, loading: settingsLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
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

  // Sync with global settings on load
  useEffect(() => {
    if (storeSettings?.store_customize) {
      setConfig(prev => ({ ...prev, ...storeSettings.store_customize }));
    }
  }, [storeSettings]);

  const update = useCallback(<K extends keyof StoreConfig>(key: K, val: StoreConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("store_configs").upsert({ id: "store_customize", value: config });
      toast.success("স্টোর আপডেট সেভ হয়েছে ✓");
      setHasChanges(false);
    } catch {
      toast.error("সেভ করা সম্ভব হয়নি");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setHasChanges(false);
    toast.info("পরিবর্তন বাতিল করা হয়েছে");
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "theme", label: "থিম ও লেআউট", icon: Palette },
    { id: "colors", label: "রং কাস্টমাইজ", icon: Layers },
    { id: "header", label: "হেডার", icon: Layout },
    { id: "homepage", label: "হোমপেজ সেটিংস", icon: Home },
    { id: "footer", label: "ফুটার কাস্টমাইজেশন", icon: Globe },
    { id: "advanced", label: "আরও", icon: Zap },
  ];

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden -mx-6 -mt-8 lg:-mx-14 lg:-mt-12">
      {/* Top Tab Bar */}
      <div className="bg-white dark:bg-[#0c0c0c] border-b border-slate-200 dark:border-white/5 px-6 lg:px-10 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Controls */}
        <div className="w-[380px] flex-shrink-0 overflow-y-auto border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c] p-6 space-y-6 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "theme" && (
                <>
                  {/* Theme Selection */}
                  <Section title="থিম নির্বাচন করুন" icon={Palette}>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => update("theme", theme.id)}
                          className={`relative p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                            config.theme === theme.id
                              ? "border-emerald-600 shadow-lg shadow-emerald-600/10"
                              : "border-slate-100 dark:border-white/10"
                          }`}
                        >
                          {theme.recommended && (
                            <span className="absolute -top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                              ✦ সেরা
                            </span>
                          )}
                          <div className={`w-full h-16 rounded-lg mb-2 ${theme.preview}`} />
                          <p className="text-[11px] font-black text-slate-800 dark:text-white">{theme.label}</p>
                          <p className="text-[9px] text-slate-400">{theme.sub}</p>
                          {config.theme === theme.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Layout */}
                  <Section title="সাইট লেআউট" icon={Layout}>
                    <div className="flex gap-2">
                      {["boxed", "full-width"].map(l => (
                        <button
                          key={l}
                          onClick={() => update("layout", l)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            config.layout === l
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "border-slate-100 dark:border-white/10 text-slate-400"
                          }`}
                        >
                          {l === "boxed" ? "বক্সড" : "ফুল-উইড"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">কন্টেইনার প্রস্থ: {config.container_width}px</label>
                      <input
                        type="range" min={960} max={1600} step={40}
                        value={config.container_width}
                        onChange={e => update("container_width", Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">প্রোডাক্ট গ্রিড</label>
                      <div className="flex gap-2">
                        {[2, 3, 4, 5].map((n: number) => (
                          <button
                            key={n}
                            onClick={() => update("product_grid", n)}
                            className={`w-10 h-10 rounded-xl border-2 text-sm font-black transition-all ${
                              config.product_grid === n
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-100 dark:border-white/10 text-slate-400 hover:border-emerald-300"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Section>

                  {/* Campaign Mode */}
                  <Section title="ক্যাম্পেইন মোড" icon={Sparkles}>
                    <div className="space-y-2">
                      {CAMPAIGNS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setActiveCampaign(activeCampaign === c.id ? null : c.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            activeCampaign === c.id
                              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-slate-100 dark:border-white/10"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
                            <c.icon size={16} />
                          </div>
                          <span className="text-[12px] font-black text-slate-800 dark:text-white">{c.label}</span>
                          {activeCampaign === c.id && <Check size={14} className="ml-auto text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {activeTab === "colors" && (
                <>
                  <Section title="রং প্রিসেট" icon={Palette}>
                    <div className="flex gap-2">
                      {COLOR_PRESETS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { update("primary_color", p.primary); update("secondary_color", p.secondary); }}
                          className="flex-1 p-2.5 rounded-xl border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-emerald-400 transition-all"
                        >
                          <div className="flex gap-1 mb-1.5">
                            <div className="w-4 h-4 rounded-full" style={{ background: p.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: p.secondary }} />
                          </div>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="কাস্টম রং" icon={Layers}>
                    {[
                      { key: "primary_color", label: "প্রাইমারি রং" },
                      { key: "secondary_color", label: "সেকেন্ডারি রং" },
                      { key: "accent_color", label: "অ্যাকসেন্ট রং" },
                      { key: "bg_color", label: "ব্যাকগ্রাউন্ড" },
                      { key: "text_color", label: "টেক্সট রং" },
                    ] as const).map(c => (
                      <div key={c.key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config[c.key as keyof StoreConfig] as string}
                          onChange={e => update(c.key as keyof StoreConfig, e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border-none p-0.5 bg-slate-50 dark:bg-white/5"
                        />
                        <div>
                          <p className="text-[11px] font-black text-slate-700 dark:text-white">{c.label}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{config[c.key as keyof StoreConfig] as string}</p>
                        </div>
                      </div>
                    ))}
                  </Section>
                </>
              )}

              {activeTab === "homepage" && (
                <Section title="হোমপেজ সেকশন কন্ট্রোল" icon={Home}>
                  <p className="text-[10px] text-slate-400 mb-4">হোমপেজে কোন সেকশনগুলো দেখাবে তা নিয়ন্ত্রণ করুন</p>
                  {[
                    { key: "show_hero", label: "হিরো সেকশন", sub: "মূল ব্যানার স্লাইডার" },
                    { key: "show_categories", label: "ক্যাটাগরি সেকশন", sub: "পপুলার ক্যাটাগরি রো" },
                    { key: "show_featured", label: "ফিচার্ড প্রোডাক্ট", sub: "বাছাই করা পণ্য" },
                    { key: "show_combo", label: "কম্বো অফার", sub: "বিশেষ কম্বো ব্যানার" },
                    { key: "show_gallery", label: "গ্যালারি সেকশন", sub: "ইনস্টাগ্রাম গ্যালারি" },
                    { key: "show_reviews", label: "রিভিউ সেকশন", sub: "কাস্টমার রিভিউ" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                      <div>
                        <p className="text-[12px] font-black text-slate-800 dark:text-white">{item.label}</p>
                        <p className="text-[9px] text-slate-400">{item.sub}</p>
                      </div>
                      <button
                        onClick={() => update(item.key as keyof StoreConfig, !config[item.key as keyof StoreConfig])}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          config[item.key as keyof StoreConfig] ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          config[item.key as keyof StoreConfig] ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </Section>
              )}

              {(activeTab === "header" || activeTab === "footer" || activeTab === "advanced") && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Zap size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-white mb-1">শীঘ্রই আসছে</p>
                  <p className="text-[11px] text-slate-400">এই সেকশনটি শীঘ্রই যোগ করা হবে</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col">
          {/* Preview Header */}
          <div className="flex-shrink-0 bg-white dark:bg-[#0c0c0c] border-b border-slate-200 dark:border-white/5 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">স্টোর প্রিভিউ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
                <button
                  onClick={() => setDevicePreview("desktop")}
                  className={`p-1.5 rounded-md transition-all ${devicePreview === "desktop" ? "bg-white dark:bg-slate-800 shadow text-emerald-600" : "text-slate-400"}`}
                >
                  <Monitor size={14} />
                </button>
                <button
                  onClick={() => setDevicePreview("mobile")}
                  className={`p-1.5 rounded-md transition-all ${devicePreview === "mobile" ? "bg-white dark:bg-slate-800 shadow text-emerald-600" : "text-slate-400"}`}
                >
                  <Smartphone size={14} />
                </button>
              </div>
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 h-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600 transition-all"
              >
                <ExternalLink size={11} /> লাইভ দেখুন
              </a>
            </div>
          </div>

          {/* Preview Iframe */}
          <div className="flex-1 overflow-hidden flex items-center justify-center p-6">
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
              devicePreview === "desktop" ? "w-full h-full" : "w-[375px] h-[700px]"
            }`}>
              <iframe
                src="/"
                className="w-full h-full border-none"
                title="Store Preview"
                style={{ pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex-shrink-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-t border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-black">⚠️ সেভ না করা পরিবর্তন আছে</p>
                <p className="text-[10px] text-slate-400">পাবলিশ না করলে পরিবর্তন হারিয়ে যাবে</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-slate-300 text-[11px] font-black uppercase tracking-widest hover:text-white rounded-xl hover:bg-white/10 transition-all"
              >
                বাতিল
              </button>
              <button className="px-4 py-2 text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/20 hover:bg-white/10 transition-all">
                ড্রাফট সেভ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                পাবলিশ করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
          <Icon size={11} className="text-emerald-600" />
        </div>
        <h3 className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
