"use client";

import { useState } from "react";
import { 
  Layout, Image as ImageIcon, Award, Grid3X3, Star, Package, 
  ChevronDown, Plus, Trash2, GripVertical, Upload, Loader2, 
  Zap, Smartphone, Monitor, Eye, EyeOff, Layers, Flame, 
  Quote, Mail, Heart, Palette, MoveUp, MoveDown, Gift, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings, HomepageSection } from "@/types/admin";
import { toast } from "sonner";
import { HeroSettings, TrustSettings, CTASettings, BannerSettings, QuoteSettings, SectionTextSettings, ProductPicker } from "./StoreDesignSettings";
import { ComboSettings } from "./ComboSettings";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

const SECTION_TYPES = [
  { type: "hero", label_en: "Hero Slider", label_bn: "হিরো স্লাইডার", icon: Layout },
  { type: "categories", label_en: "Featured Categories", label_bn: "সেরা ক্যাটাগরি", icon: Grid3X3 },
  { type: "promo_banners", label_en: "Promo Banners", label_bn: "প্রোমো ব্যানার", icon: Flame },
  { type: "featured_products", label_en: "Featured Products", label_bn: "সেরা পণ্য", icon: Package },
  { type: "trust_metrics", label_en: "Trust Badges", label_bn: "ট্রাস্ট ব্যাজ", icon: Award },
  { type: "why_choose", label_en: "Why Choose Us", label_bn: "কেন আমাদের বেছে নেবেন", icon: Heart },
  { type: "combo", label_en: "Combo Packages", label_bn: "কম্বো প্যাকেজ", icon: Gift },
  { type: "gallery", label_en: "Visual Gallery", label_bn: "গ্যালারি সেকশন", icon: ImageIcon },
  { type: "islamic_quote", label_en: "Islamic Verse", label_bn: "আরবি আয়াত", icon: Quote },
  { type: "reviews", label_en: "Testimonials", label_bn: "কাস্টমার রিভিউ", icon: Star },
  { type: "cta", label_en: "Call to Action", label_bn: "অর্ডার কল", icon: Zap },
];


export function HomepageSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = settings.homepage_sections || [
    { id: "hero-1", type: "hero", label_en: "Main Hero", label_bn: "মেইন হিরো", enabled: true, visibility: { desktop: true, mobile: true } },
    { id: "trust-1", type: "trust_metrics", label_en: "Trust Bar", label_bn: "ট্রাস্ট বার", enabled: true, visibility: { desktop: true, mobile: true } },
    { id: "featured-1", type: "featured_products", label_en: "New Arrivals", label_bn: "নতুন পণ্য", enabled: true, visibility: { desktop: true, mobile: true } },
  ];

  const updateSections = (newSections: HomepageSection[]) => {
    onUpdate({ homepage_sections: newSections });
  };

  const addSection = (type: string) => {
    const sectionInfo = SECTION_TYPES.find(s => s.type === type);
    if (!sectionInfo) return;

    const newSection: HomepageSection = {
      id: `${type}-${Date.now()}`,
      type,
      label_en: sectionInfo.label_en,
      label_bn: sectionInfo.label_bn,
      enabled: true,
      visibility: { desktop: true, mobile: true }
    };
    updateSections([...sections, newSection]);
    setExpandedSection(newSection.id);
    toast.success(bn ? "সেকশন যোগ করা হয়েছে" : "Section added successfully");
  };

  const removeSection = (id: string) => {
    updateSections(sections.filter(s => s.id !== id));
    if (expandedSection === id) setExpandedSection(null);
  };

  const toggleVisibility = (id: string, device: 'desktop' | 'mobile') => {
    updateSections(sections.map(s => s.id === id ? { 
      ...s, 
      visibility: { ...s.visibility, [device]: !s.visibility[device] } 
    } : s));
  };

  const toggleEnabled = (id: string) => {
    updateSections(sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-6 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers size={16} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Homepage Architecture</h3>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section Stacker</h2>
          <p className="text-xs text-slate-400 font-medium">Drag to reorder, click to customize content.</p>
        </div>
        
        <div className="relative group">
          <button className="h-11 px-6 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={16} strokeWidth={3} /> {bn ? "সেকশন যোগ করুন" : "Add New Section"}
          </button>
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 p-2 grid grid-cols-1 gap-1">
            <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Available Sections</span>
            </div>
            {SECTION_TYPES.map(type => (
              <button
                key={type.type}
                onClick={() => addSection(type.type)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group/item"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-all">
                  <type.icon size={16} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none mb-1">{bn ? type.label_bn : type.label_en}</span>
                  <span className="block text-[9px] text-slate-400 font-medium uppercase tracking-wider">{type.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Reorder.Group axis="y" values={sections} onReorder={updateSections} className="space-y-4">
        <AnimatePresence initial={false}>
          {sections.map((section) => (
            <Reorder.Item
              key={section.id}
              value={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`group bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden transition-all duration-300 ${expandedSection === section.id ? 'shadow-lg ring-1 ring-primary/20' : 'hover:border-primary/20 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl">
                  <GripVertical size={20} strokeWidth={2.5} />
                </div>
                
                {/* Visual Miniature Representation */}
                <div className="hidden sm:flex w-24 h-16 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 items-center justify-center relative overflow-hidden group-hover:border-emerald-500/30 transition-all">
                  {section.type === 'hero' && <div className="flex gap-1"><div className="w-8 h-6 bg-slate-200 dark:bg-white/10 rounded-xl" /><div className="w-8 h-6 bg-emerald-500/20 rounded-xl border border-emerald-500/20" /></div>}
                  {section.type === 'featured_products' && <div className="grid grid-cols-2 gap-1"><div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded-xl" /><div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded-xl" /><div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded-xl" /><div className="w-4 h-4 bg-emerald-500/20 rounded-xl" /></div>}
                  {section.type === 'categories' && <div className="flex gap-1"><div className="w-5 h-5 rounded-xl bg-slate-200 dark:bg-white/10" /><div className="w-5 h-5 rounded-xl bg-emerald-500/20" /><div className="w-5 h-5 rounded-xl bg-slate-200 dark:bg-white/10" /></div>}
                  {section.type === 'islamic_quote' && <div className="w-12 h-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10" />}
                  {!['hero', 'featured_products', 'categories', 'islamic_quote'].includes(section.type) && <Layers size={20} className="text-slate-200 dark:text-white/5" />}
                  
                  <div className={`absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center ${section.enabled ? '' : 'bg-slate-200/50'}`}>
                    <Eye size={16} className="text-emerald-500" />
                  </div>
                </div>

                <div className="flex-1 cursor-pointer" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-xl ${section.enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                    <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] leading-none ${section.enabled ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {bn ? section.label_bn : section.label_en}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{section.type}</p>
                    <span className="w-1 h-1 rounded-xl bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <Monitor size={10} className={section.visibility.desktop ? 'text-emerald-500' : 'text-slate-300'} />
                      <Smartphone size={10} className={section.visibility.mobile ? 'text-emerald-500' : 'text-slate-300'} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.02] p-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <button 
                      onClick={() => toggleVisibility(section.id, 'desktop')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${section.visibility.desktop ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-lg shadow-black/5' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      <Monitor size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => toggleVisibility(section.id, 'mobile')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${section.visibility.mobile ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-lg shadow-black/5' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      <Smartphone size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeSection(section.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group/trash"
                  >
                    <Trash2 size={18} className="group-hover/trash:scale-110 transition-all" />
                  </button>
                </div>
              </div>

              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]"
                >
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Section Label (BN)</label>
                        <input 
                          value={section.label_bn} 
                          onChange={e => updateSections(sections.map(s => s.id === section.id ? { ...s, label_bn: e.target.value } : s))}
                          className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          placeholder="যেমন: সেরা অফারসমূহ"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Section Label (EN)</label>
                        <input 
                          value={section.label_en} 
                          onChange={e => updateSections(sections.map(s => s.id === section.id ? { ...s, label_en: e.target.value } : s))}
                          className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          placeholder="e.g. Featured Products"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-6">
                        <Zap size={14} className="text-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Detailed Content Configuration</h4>
                      </div>

                      {section.type === 'hero' && (
                        <HeroSettings 
                          slides={settings.hero_slides || []} 
                          onChange={(slides: any) => onUpdate({ hero_slides: slides })} 
                        />
                      )}

                      {section.type === 'trust_metrics' && (
                        <TrustSettings 
                          badges={settings.trust_badges || []} 
                          onChange={(badges: any) => onUpdate({ trust_badges: badges })} 
                        />
                      )}

                      {section.type === 'promo_banners' && (
                        <BannerSettings 
                          banners={settings.home_banners || []} 
                          onChange={(banners: any) => onUpdate({ home_banners: banners })} 
                        />
                      )}

                      {section.type === 'cta' && (
                        <CTASettings 
                          data={settings.home_cta || {}} 
                          onChange={(data: any) => onUpdate({ home_cta: data })} 
                        />
                      )}

                      {section.type === 'combo' && (
                        <ComboSettings 
                          settings={settings} 
                          onUpdate={onUpdate} 
                        />
                      )}

                      {section.type === 'islamic_quote' && (
                        <QuoteSettings 
                          data={settings.quote_text || {}} 
                          onChange={(data: any) => onUpdate({ quote_text: data })} 
                        />
                      )}

                      {section.type === 'featured_products' && (
                        <div className="space-y-12">
                          <SectionTextSettings 
                            title={bn ? "সেরা পণ্য সেটিংস" : "FEATURED PRODUCTS CONFIG"}
                            icon={Package}
                            data={settings.featured_text || {}} 
                            onChange={(data: any) => onUpdate({ featured_text: data })} 
                          />
                          <ProductPicker 
                            title={bn ? "পণ্য নির্বাচন করুন" : "SELECT FEATURED PRODUCTS"}
                            icon={Sparkles}
                            selectedIds={settings.featured_product_ids || []}
                            onChange={(ids) => onUpdate({ featured_product_ids: ids })}
                          />
                        </div>
                      )}

                      {section.type === 'categories' && (
                        <SectionTextSettings 
                          title={bn ? "সেরা ক্যাটাগরি সেটিংস" : "FEATURED CATEGORIES CONFIG"}
                          icon={Grid3X3}
                          data={settings.categories_text || {}} 
                          onChange={(data: any) => onUpdate({ categories_text: data })} 
                        />
                      )}

                      {section.type === 'why_choose' && (
                        <SectionTextSettings 
                          title={bn ? "কেন আমাদের বেছে নেবেন সেটিংস" : "WHY CHOOSE US CONFIG"}
                          icon={Heart}
                          data={settings.why_choose_text || {}} 
                          onChange={(data: any) => onUpdate({ why_choose_text: data })} 
                        />
                      )}

                      {section.type === 'gallery' && (
                        <SectionTextSettings 
                          title={bn ? "গ্যালারি সেটিংস" : "GALLERY CONFIG"}
                          icon={ImageIcon}
                          data={settings.gallery_text || {}} 
                          onChange={(data: any) => onUpdate({ gallery_text: data })} 
                        />
                      )}

                      {section.type === 'reviews' && (
                        <SectionTextSettings 
                          title={bn ? "কাস্টমার রিভিউ সেটিংস" : "REVIEWS CONFIG"}
                          icon={Star}
                          data={settings.reviews_text || {}} 
                          onChange={(data: any) => onUpdate({ reviews_text: data })} 
                        />
                      )}

                      {/* For other sections, show a generic message or simpler controls */}
                      {!['hero', 'trust_metrics', 'promo_banners', 'cta', 'combo', 'islamic_quote', 'featured_products', 'categories', 'why_choose', 'gallery', 'reviews'].includes(section.type) && (
                        <div className="p-10 bg-slate-50 dark:bg-white/[0.01] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl text-center">
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                            This section uses dynamic data from your store catalog. 
                            Use the labels above to customize the public display name.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {sections.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-[#0c0c0c] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
          <Layers size={48} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">No sections added yet</h4>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Use the "Add Section" button to start building your homepage</p>
        </div>
      )}
    </div>
  );
}
