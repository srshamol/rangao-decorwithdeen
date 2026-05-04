"use client";

import { useState } from "react";
import { Layout, Image, Award, Grid3X3, Star, Package, ChevronDown, Plus, Trash2, GripVertical, Upload, Loader2, Banknote, Truck, ShieldCheck, HeartHandshake, Zap, Smartphone, Clock, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { AdminSettings, HeroSlide, TrustBadge } from "@/types/admin";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

const SectionCard = ({ id, icon: Icon, title, desc, color, children, isExpanded, onToggle }: {
  id: string;
  icon: any;
  title: string;
  desc: string;
  color: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
      <button onClick={() => onToggle(id)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}><Icon size={18} /></div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-white/5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ICON_OPTIONS = [
  { id: "Banknote", icon: Banknote },
  { id: "Truck", icon: Truck },
  { id: "ShieldCheck", icon: ShieldCheck },
  { id: "HeartHandshake", icon: HeartHandshake },
  { id: "Zap", icon: Zap },
  { id: "Smartphone", icon: Smartphone },
  { id: "Star", icon: Star },
  { id: "Clock", icon: Clock },
  { id: "Gift", icon: Gift }
];

export function HomepageSettings({ settings, onUpdate }: Props) {
  const { t, language } = useLanguage();
  const bn = language === 'bn';
  const [expandedSection, setExpandedSection] = useState<string | null>("hero");
  const [uploading, setUploading] = useState<number | null>(null);

  const update = (field: keyof AdminSettings, value: any) => onUpdate({ [field]: value });
  const toggleSection = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  const addHeroSlide = () => {
    const slides = [...(settings.hero_slides || [])];
    slides.push({ 
      badge: "", 
      title: "", 
      description: "", 
      button_text: t("order_now"), 
      button_two_text: t("combo_offers"),
      image: "",
      layout: "image-right"
    });
    update("hero_slides", slides);
  };
  const updateHeroSlide = (i: number, f: keyof HeroSlide, v: string) => {
    const slides = [...(settings.hero_slides || [])];
    slides[i] = { ...slides[i], [f]: v };
    update("hero_slides", slides);
  };
  const removeHeroSlide = (i: number) => update("hero_slides", (settings.hero_slides || []).filter((_: any, idx: number) => idx !== i));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(idx);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(t("session_expired"));
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `hero-slide-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      updateHeroSlide(idx, "image", publicUrl);
      toast.success(t("upload_success"));
    } catch (error: any) {
      console.error("Hero upload error:", error);
      if (error.message?.includes("exp")) {
        toast.error(bn ? "আপনার সেশন শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।" : "Login session expired. Please log in again.");
      } else {
        toast.error(`${t("upload_failed")}: ${error.message}`);
      }
    } finally {
      setUploading(null);
    }
  };

  const addTrustBadge = () => {
    const badges = [...(settings.trust_badges || [])];
    badges.push({ icon: "🌟", title: "", description: "" });
    update("trust_badges", badges);
  };
  const updateTrustBadge = (i: number, f: keyof TrustBadge, v: string) => {
    const badges = [...(settings.trust_badges || [])];
    badges[i] = { ...badges[i], [f]: v };
    update("trust_badges", badges);
  };
  const removeTrustBadge = (i: number) => update("trust_badges", (settings.trust_badges || []).filter((_: any, idx: number) => idx !== i));

  const inputCls = "h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const toggleCard = (label: string, desc: string, field: keyof AdminSettings) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
      <div><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p><p className="text-[11px] text-slate-400 mt-0.5">{desc}</p></div>
      <Switch checked={settings[field] !== false} onCheckedChange={(v) => update(field, v)} />
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionCard id="header" icon={Layout} title={bn ? "হেডার কনফিগারেশন" : "Header Configuration"} desc={bn ? "হেডারের ভিজিবিলিটি কন্ট্রোল করুন" : "Control header element visibility"} color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" isExpanded={expandedSection === 'header'} onToggle={toggleSection}>
        <div className="space-y-4">
          {toggleCard(bn ? "লোগো দেখান" : "Show Logo", bn ? "হেডারে ব্র্যান্ড লোগো প্রদর্শন করুন" : "Display brand logo in header", "show_logo")}
          {toggleCard(bn ? "নাম দেখান" : "Show Name", bn ? "হেডারে স্টোরের নাম প্রদর্শন করুন" : "Display store name in header", "show_name")}
          {toggleCard(bn ? "ট্যাগলাইন দেখান" : "Show Tagline", bn ? "হেডারে স্টোর ট্যাগলাইন প্রদর্শন করুন" : "Display store tagline in header", "show_tagline")}
        </div>
      </SectionCard>

      <SectionCard id="hero" icon={Image} title={t("hero_section")} desc={t("banner_slides")} color="bg-blue-50 dark:bg-blue-500/10 text-blue-600" isExpanded={expandedSection === 'hero'} onToggle={toggleSection}>
        <div className="space-y-4">
          {(settings.hero_slides || []).map((slide, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-2"><GripVertical size={14} className="text-slate-300" />{`${t("slide")} ${idx+1}`}</span>
                <button onClick={() => removeHeroSlide(idx)} className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                {/* Left Side: Text Fields */}
                <div className="space-y-3">
                  <input value={slide.badge||""} onChange={e=>updateHeroSlide(idx,"badge",e.target.value)} placeholder={t("badge_text")} className={inputCls + " w-full"} />
                  <textarea value={slide.title||""} onChange={e=>updateHeroSlide(idx,"title",e.target.value)} placeholder={t("title")} className={inputCls + " w-full font-bold h-24 py-2 resize-none"} />
                  <textarea value={slide.description||""} onChange={e=>updateHeroSlide(idx,"description",e.target.value)} placeholder={t("sub_text")} className={inputCls + " w-full h-20 py-2 resize-none"} />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={slide.button_text||""} onChange={e=>updateHeroSlide(idx,"button_text",e.target.value)} placeholder={t("btn1_text")} className={inputCls} />
                    <input value={slide.button_two_text||""} onChange={e=>updateHeroSlide(idx,"button_two_text",e.target.value)} placeholder={t("btn2_text")} className={inputCls} />
                  </div>
                </div>

                {/* Right Side: Image and Layout */}
                <div className="space-y-3">
                   <div className="relative group/img aspect-[16/10] rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                      {slide.image ? (
                        <img src={slide.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <Image size={24} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        {uploading === idx ? <Loader2 size={24} className="animate-spin text-white" /> : <Upload size={24} className="text-white" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, idx)} />
                      </label>
                   </div>
                   <input value={slide.image||""} onChange={e=>updateHeroSlide(idx,"image",e.target.value)} placeholder={t("image_url")} className={inputCls + " w-full text-[10px] h-8"} />
                   
                   {/* Layout Toggle */}
                   <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("layout")}</span>
                      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                         <button 
                           onClick={() => updateHeroSlide(idx, "layout", "image-left")}
                           className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${slide.layout === 'image-left' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           {t("left")}
                         </button>
                         <button 
                           onClick={() => updateHeroSlide(idx, "layout", "image-right")}
                           className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${slide.layout !== 'image-left' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           {t("right")}
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addHeroSlide} className="w-full h-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
            <Plus size={14} />{t("add_slide")}
          </button>
          
          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-white/5">
            <h4 className="text-sm font-semibold mb-3">{t("hero_text_customization")}</h4>
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
                <input value={settings.hero_text?.badge_en||""} onChange={e=>update("hero_text", {...settings.hero_text, badge_en: e.target.value})} placeholder="Badge (EN)" className={inputCls} />
                <input value={settings.hero_text?.badge_bn||""} onChange={e=>update("hero_text", {...settings.hero_text, badge_bn: e.target.value})} placeholder="Badge (BN)" className={inputCls} />
                <input value={settings.hero_text?.title_en_1||""} onChange={e=>update("hero_text", {...settings.hero_text, title_en_1: e.target.value})} placeholder="Title Line 1 (EN)" className={inputCls} />
                <input value={settings.hero_text?.title_bn_1||""} onChange={e=>update("hero_text", {...settings.hero_text, title_bn_1: e.target.value})} placeholder="Title Line 1 (BN)" className={inputCls} />
                <input value={settings.hero_text?.title_en_2||""} onChange={e=>update("hero_text", {...settings.hero_text, title_en_2: e.target.value})} placeholder="Title Line 2 (EN)" className={inputCls} />
                <input value={settings.hero_text?.title_bn_2||""} onChange={e=>update("hero_text", {...settings.hero_text, title_bn_2: e.target.value})} placeholder="Title Line 2 (BN)" className={inputCls} />
                <textarea value={settings.hero_text?.desc_en||""} onChange={e=>update("hero_text", {...settings.hero_text, desc_en: e.target.value})} placeholder="Description (EN)" className={inputCls + " h-16 py-2 resize-none"} />
                <textarea value={settings.hero_text?.desc_bn||""} onChange={e=>update("hero_text", {...settings.hero_text, desc_bn: e.target.value})} placeholder="Description (BN)" className={inputCls + " h-16 py-2 resize-none"} />
                <input value={settings.hero_text?.btn1_en||""} onChange={e=>update("hero_text", {...settings.hero_text, btn1_en: e.target.value})} placeholder="Button 1 (EN)" className={inputCls} />
                <input value={settings.hero_text?.btn1_bn||""} onChange={e=>update("hero_text", {...settings.hero_text, btn1_bn: e.target.value})} placeholder="Button 1 (BN)" className={inputCls} />
                <input value={settings.hero_text?.btn2_en||""} onChange={e=>update("hero_text", {...settings.hero_text, btn2_en: e.target.value})} placeholder="Button 2 (EN)" className={inputCls} />
                <input value={settings.hero_text?.btn2_bn||""} onChange={e=>update("hero_text", {...settings.hero_text, btn2_bn: e.target.value})} placeholder="Button 2 (BN)" className={inputCls} />
                <input value={settings.hero_text?.image||""} onChange={e=>update("hero_text", {...settings.hero_text, image: e.target.value})} placeholder="Banner Image URL" className={inputCls + " col-span-2"} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="trust" icon={Award} title={t("trust_badges")} desc={t("credibility_indicators")} color="bg-amber-50 dark:bg-gold/10 text-gold" isExpanded={expandedSection === 'trust'} onToggle={toggleSection}>
        <div className="space-y-3">
          {(settings.trust_badges || []).map((badge, idx: number) => (
            <div key={idx} className="space-y-3 p-4 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                   {ICON_OPTIONS.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => updateTrustBadge(idx, "icon", opt.id)}
                        className={`p-2 rounded-xl transition-all ${badge.icon === opt.id ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        title={opt.id}
                      >
                        <opt.icon size={16} />
                      </button>
                   ))}
                </div>
                <button onClick={() => removeTrustBadge(idx)} className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={badge.title||""} onChange={e=>updateTrustBadge(idx,"title",e.target.value)} placeholder={t("title")} className={inputCls+" flex-1 font-semibold"} />
                <input value={badge.description||""} onChange={e=>updateTrustBadge(idx,"description",e.target.value)} placeholder={t("description")} className={inputCls+" flex-1"} />
              </div>
            </div>
          ))}
          <button onClick={addTrustBadge} className="w-full h-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
            <Plus size={14} />{t("add_badge")}
          </button>
        </div>
      </SectionCard>

      <SectionCard id="categories" icon={Grid3X3} title={t("categories")} desc={t("category_section")} color="bg-violet-50 dark:bg-violet-500/10 text-violet-600" isExpanded={expandedSection === 'categories'} onToggle={toggleSection}>
        <div className="space-y-4">
          {toggleCard(t("show_categories"), t("display_on_homepage"), "show_categories")}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.categories_text?.title_en||""} onChange={e=>update("categories_text", {...settings.categories_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.categories_text?.title_bn||""} onChange={e=>update("categories_text", {...settings.categories_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <input value={settings.categories_text?.subtitle_en||""} onChange={e=>update("categories_text", {...settings.categories_text, subtitle_en: e.target.value})} placeholder="Subtitle (EN)" className={inputCls} />
            <input value={settings.categories_text?.subtitle_bn||""} onChange={e=>update("categories_text", {...settings.categories_text, subtitle_bn: e.target.value})} placeholder="Subtitle (BN)" className={inputCls} />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="featured" icon={Star} title={t("featured_products")} desc={t("highlighted_products")} color="bg-emerald-50 dark:bg-primary/10 text-primary" isExpanded={expandedSection === 'featured'} onToggle={toggleSection}>
        <div className="space-y-4">
          {toggleCard(t("show_featured"), t("special_products_highlight"), "show_featured")}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.featured_text?.title_en||""} onChange={e=>update("featured_text", {...settings.featured_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.featured_text?.title_bn||""} onChange={e=>update("featured_text", {...settings.featured_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <input value={settings.featured_text?.btn_en||""} onChange={e=>update("featured_text", {...settings.featured_text, btn_en: e.target.value})} placeholder="Button Text (EN)" className={inputCls} />
            <input value={settings.featured_text?.btn_bn||""} onChange={e=>update("featured_text", {...settings.featured_text, btn_bn: e.target.value})} placeholder="Button Text (BN)" className={inputCls} />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="combo" icon={Package} title={t("combo_section")} desc={t("combo_offers")} color="bg-pink-50 dark:bg-pink-500/10 text-pink-600" isExpanded={expandedSection === 'combo'} onToggle={toggleSection}>
        <div className="space-y-4">
          {toggleCard(t("show_combo"), t("display_combo_offers"), "show_combo")}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.combo_text?.title_en||""} onChange={e=>update("combo_text", {...settings.combo_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.combo_text?.title_bn||""} onChange={e=>update("combo_text", {...settings.combo_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <input value={settings.combo_text?.heading_en||""} onChange={e=>update("combo_text", {...settings.combo_text, heading_en: e.target.value})} placeholder="Heading (EN)" className={inputCls} />
            <input value={settings.combo_text?.heading_bn||""} onChange={e=>update("combo_text", {...settings.combo_text, heading_bn: e.target.value})} placeholder="Heading (BN)" className={inputCls} />
            <input value={settings.combo_text?.coupon_label_en||""} onChange={e=>update("combo_text", {...settings.combo_text, coupon_label_en: e.target.value})} placeholder="Coupon Label (EN)" className={inputCls} />
            <input value={settings.combo_text?.coupon_label_bn||""} onChange={e=>update("combo_text", {...settings.combo_text, coupon_label_bn: e.target.value})} placeholder="Coupon Label (BN)" className={inputCls} />
            <input value={settings.combo_text?.coupon_code||""} onChange={e=>update("combo_text", {...settings.combo_text, coupon_code: e.target.value})} placeholder="Coupon Code (e.g. RANGAO5)" className={inputCls} />
            <input value={settings.combo_text?.btn_text||""} onChange={e=>update("combo_text", {...settings.combo_text, btn_text: e.target.value})} placeholder="Button Text" className={inputCls} />
            <input value={settings.combo_text?.image||""} onChange={e=>update("combo_text", {...settings.combo_text, image: e.target.value})} placeholder="Background Image URL" className={inputCls + " col-span-2"} />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="why_choose" icon={ShieldCheck} title={t("why_choose_us")} desc={t("benefits")} color="bg-teal-50 dark:bg-teal-500/10 text-teal-600" isExpanded={expandedSection === 'why_choose'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.why_choose_text?.title_en||""} onChange={e=>update("why_choose_text", {...settings.why_choose_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.why_choose_text?.title_bn||""} onChange={e=>update("why_choose_text", {...settings.why_choose_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
        </div>
      </SectionCard>

      <SectionCard id="gallery" icon={Image} title={t("photo_gallery")} desc={t("customer_photos")} color="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600" isExpanded={expandedSection === 'gallery'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.gallery_text?.title_en||""} onChange={e=>update("gallery_text", {...settings.gallery_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.gallery_text?.title_bn||""} onChange={e=>update("gallery_text", {...settings.gallery_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <input value={settings.gallery_text?.subtitle_en||""} onChange={e=>update("gallery_text", {...settings.gallery_text, subtitle_en: e.target.value})} placeholder="Subtitle (EN)" className={inputCls} />
            <input value={settings.gallery_text?.subtitle_bn||""} onChange={e=>update("gallery_text", {...settings.gallery_text, subtitle_bn: e.target.value})} placeholder="Subtitle (BN)" className={inputCls} />
        </div>
      </SectionCard>

      <SectionCard id="reviews" icon={Star} title={t("reviews")} desc={t("customer_feedback")} color="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600" isExpanded={expandedSection === 'reviews'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.reviews_text?.title_en||""} onChange={e=>update("reviews_text", {...settings.reviews_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.reviews_text?.title_bn||""} onChange={e=>update("reviews_text", {...settings.reviews_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <input value={settings.reviews_text?.btn_en||""} onChange={e=>update("reviews_text", {...settings.reviews_text, btn_en: e.target.value})} placeholder="Button (EN)" className={inputCls} />
            <input value={settings.reviews_text?.btn_bn||""} onChange={e=>update("reviews_text", {...settings.reviews_text, btn_bn: e.target.value})} placeholder="Button (BN)" className={inputCls} />
        </div>
      </SectionCard>

      <SectionCard id="quote" icon={Award} title={t("islamic_quote")} desc={t("wisdom_text")} color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" isExpanded={expandedSection === 'quote'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.quote_text?.arabic||""} onChange={e=>update("quote_text", {...settings.quote_text, arabic: e.target.value})} placeholder="Arabic (﷽)" className={inputCls + " col-span-2 text-center text-xl font-arabic"} />
            <input value={settings.quote_text?.title_en||""} onChange={e=>update("quote_text", {...settings.quote_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.quote_text?.title_bn||""} onChange={e=>update("quote_text", {...settings.quote_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <textarea value={settings.quote_text?.text_en||""} onChange={e=>update("quote_text", {...settings.quote_text, text_en: e.target.value})} placeholder="Quote Text (EN)" className={inputCls + " h-20 py-2 resize-none"} />
            <textarea value={settings.quote_text?.text_bn||""} onChange={e=>update("quote_text", {...settings.quote_text, text_bn: e.target.value})} placeholder="Quote Text (BN)" className={inputCls + " h-20 py-2 resize-none"} />
            <input value={settings.quote_text?.ref_en||""} onChange={e=>update("quote_text", {...settings.quote_text, ref_en: e.target.value})} placeholder="Reference (EN)" className={inputCls} />
            <input value={settings.quote_text?.ref_bn||""} onChange={e=>update("quote_text", {...settings.quote_text, ref_bn: e.target.value})} placeholder="Reference (BN)" className={inputCls} />
        </div>
      </SectionCard>

      <SectionCard id="cta" icon={Zap} title={t("cta_banner")} desc={t("bottom_banner")} color="bg-rose-50 dark:bg-rose-500/10 text-rose-600" isExpanded={expandedSection === 'cta'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <input value={settings.cta_text?.title_en||""} onChange={e=>update("cta_text", {...settings.cta_text, title_en: e.target.value})} placeholder="Title (EN)" className={inputCls} />
            <input value={settings.cta_text?.title_bn||""} onChange={e=>update("cta_text", {...settings.cta_text, title_bn: e.target.value})} placeholder="Title (BN)" className={inputCls} />
            <textarea value={settings.cta_text?.desc_en||""} onChange={e=>update("cta_text", {...settings.cta_text, desc_en: e.target.value})} placeholder="Description (EN)" className={inputCls + " h-20 py-2 resize-none"} />
            <textarea value={settings.cta_text?.desc_bn||""} onChange={e=>update("cta_text", {...settings.cta_text, desc_bn: e.target.value})} placeholder="Description (BN)" className={inputCls + " h-20 py-2 resize-none"} />
            <input value={settings.cta_text?.btn1_en||""} onChange={e=>update("cta_text", {...settings.cta_text, btn1_en: e.target.value})} placeholder="Button 1 (EN)" className={inputCls} />
            <input value={settings.cta_text?.btn1_bn||""} onChange={e=>update("cta_text", {...settings.cta_text, btn1_bn: e.target.value})} placeholder="Button 1 (BN)" className={inputCls} />
            <input value={settings.cta_text?.btn2_en||""} onChange={e=>update("cta_text", {...settings.cta_text, btn2_en: e.target.value})} placeholder="WhatsApp Button (EN)" className={inputCls} />
            <input value={settings.cta_text?.btn2_bn||""} onChange={e=>update("cta_text", {...settings.cta_text, btn2_bn: e.target.value})} placeholder="WhatsApp Button (BN)" className={inputCls} />
        </div>
      </SectionCard>
    </div>
  );
}
