import { useState } from "react";
import { 
  Layout, Tag, Zap, ShieldCheck, Plus, Trash2, 
  Upload, Loader2, Smartphone, Banknote, Truck, 
  HeartHandshake, Star, Clock, Gift 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { ComboSettings } from "./ComboSettings";

interface Props {
  heroSlides: any[];
  banners: any[];
  ctaData: any;
  trustBadges: any[];
  comboSettings: any;
  onUpdate: (field: string, data: any) => void;
  onUpdateCombo: (data: any) => void;
}

export function StoreDesignSettings({ heroSlides, banners, ctaData, trustBadges, comboSettings, onUpdate, onUpdateCombo }: Props) {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState("hero");

  return (
    <div className="space-y-8">
      {/* Module Selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
        {[
          { id: "hero", label: language === 'bn' ? "হিরো স্লাইডার" : "Hero Slider", icon: Layout },
          { id: "banners", label: language === 'bn' ? "প্রোমো ব্যানার" : "Promo Banners", icon: Tag },
          { id: "cta", label: language === 'bn' ? "সিটিএ ব্যানার" : "CTA Banner", icon: Zap },
          { id: "badges", label: language === 'bn' ? "ট্রাস্ট ব্যাজ" : "Trust Badges", icon: ShieldCheck },
          { id: "combo", label: language === 'bn' ? "কম্বো পেজ" : "Combo Pages", icon: Gift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeSubTab === tab.id 
              ? "bg-white dark:bg-white/10 text-primary shadow-sm" 
              : "text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white/40"
            }`}
          >
            <tab.icon size={12} className={activeSubTab === tab.id ? "text-primary" : "text-slate-400 dark:text-white/20"} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeSubTab === "hero" && <HeroSettings slides={heroSlides} onChange={(d: any[]) => onUpdate("hero_slides", d)} />}
          {activeSubTab === "banners" && <BannerSettings banners={banners} onChange={(d: any[]) => onUpdate("home_banners", d)} />}
          {activeSubTab === "cta" && <CTASettings data={ctaData} onChange={(d: any) => onUpdate("home_cta", d)} />}
          {activeSubTab === "badges" && <TrustSettings badges={trustBadges} onChange={(d: any[]) => onUpdate("trust_badges", d)} />}
          {activeSubTab === "combo" && <div className="-mx-8"><ComboSettings settings={comboSettings} onUpdate={onUpdateCombo} /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HeroSettings({ slides, onChange }: { slides: any[], onChange: any }) {
  const addSlide = () => {
    onChange([...slides, { 
      id: Date.now(), 
      badge_text: "NEW ARRIVAL",
      title: "Exclusive Collection", 
      subtitle: "Discover our latest premium products...", 
      image_url: "", 
      button_text: "Shop Now", 
      button_url: "/shop",
      button2_text: "",
      button2_url: ""
    }]);
  };

  const updateSlide = (id: any, field: string, value: string) => {
    onChange(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlide = (id: any) => {
    onChange(slides.filter(s => s.id !== id));
  };

  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Slider Configuration</h3>
        <button onClick={addSlide} className="flex items-center gap-2 px-4 h-9 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
          <Plus size={14} /> {language === 'bn' ? "স্লাইড যোগ করুন" : "Add Slide"}
        </button>
      </div>

      <div className="space-y-6">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="p-8 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 space-y-8 relative group shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slide #{idx + 1}</span>
              <button onClick={() => removeSlide(slide.id)} className="w-8 h-8 bg-rose-500/5 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Badge Text</label>
                  <input type="text" value={slide.badge_text} onChange={(e) => updateSlide(slide.id, "badge_text", e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Headline</label>
                  <textarea value={slide.title} onChange={(e) => updateSlide(slide.id, "title", e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold h-20 resize-none shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <div className="space-y-6">
                <ImageUpload 
                  label={language === 'bn' ? "স্লাইড ইমেজ" : "Slide Image"}
                  value={slide.image_url} 
                  onChange={(url) => updateSlide(slide.id, "image_url", url)} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustSettings({ badges, onChange }: { badges: any[], onChange: any }) {
  const ICON_OPTIONS = [
    { id: "Banknote", icon: Banknote },
    { id: "Truck", icon: Truck },
    { id: "ShieldCheck", icon: ShieldCheck },
    { id: "HeartHandshake", icon: HeartHandshake },
    { id: "Zap", icon: Zap },
    { id: "Star", icon: Star },
    { id: "Clock", icon: Clock },
    { id: "Gift", icon: Gift },
    { id: "Smartphone", icon: Smartphone },
  ];

  const addBadge = () => {
    onChange([...badges, { id: Date.now(), label: "New Badge", sub: "Subtitle", icon: "ShieldCheck" }]);
  };

  const updateBadge = (id: any, field: string, value: string) => {
    onChange(badges.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBadge = (id: any) => {
    onChange(badges.filter(b => b.id !== id));
  };

  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Trust Badges</h3>
        <button onClick={addBadge} className="flex items-center gap-2 px-4 h-9 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
          <Plus size={14} /> {language === 'bn' ? "ব্যাজ যোগ করুন" : "Add Badge"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl space-y-4 relative group shadow-sm">
            <button onClick={() => removeBadge(badge.id)} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={14} />
            </button>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateBadge(badge.id, "icon", opt.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${badge.icon === opt.id ? "bg-primary text-white shadow-md scale-105" : "bg-slate-50 dark:bg-white/5 text-slate-300 hover:text-slate-500"}`}
                >
                  <opt.icon size={12} />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <input 
                type="text" 
                value={badge.label} 
                onChange={(e) => updateBadge(badge.id, "label", e.target.value)} 
                className="w-full bg-transparent border-none font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest focus:ring-0 p-0"
                placeholder="Title"
              />
              <input 
                type="text" 
                value={badge.sub} 
                onChange={(e) => updateBadge(badge.id, "sub", e.target.value)} 
                className="w-full bg-transparent border-none text-[9px] font-bold text-slate-400 uppercase tracking-widest focus:ring-0 p-0"
                placeholder="Description"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerSettings({ banners, onChange }: { banners: any[], onChange: any }) {
  const addBanner = () => {
    onChange([...banners, { id: Date.now(), title: "Special Offer", subtitle: "Limited Time Only", image_url: "", link: "/shop" }]);
  };
  const updateBanner = (id: any, field: string, value: string) => {
    onChange(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  const removeBanner = (id: any) => {
    onChange(banners.filter(b => b.id !== id));
  };

  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Promotion Banners</h3>
        <button onClick={addBanner} className="flex items-center gap-2 px-4 h-9 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
          <Plus size={14} /> {language === 'bn' ? "ব্যানার যোগ করুন" : "Add Banner"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="p-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl space-y-6 relative group shadow-sm">
            <button onClick={() => removeBanner(banner.id)} className="absolute top-6 right-6 text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={16} />
            </button>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
                <input type="text" value={banner.title} onChange={(e) => updateBanner(banner.id, "title", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <ImageUpload 
                label={language === 'bn' ? "ব্যানার ইমেজ" : "Banner Image"}
                value={banner.image_url} 
                onChange={(url) => updateBanner(banner.id, "image_url", url)} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASettings({ data, onChange }: { data: any, onChange: any }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Call-to-Action (CTA)</h3>
      
      <div className="p-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl space-y-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{language === 'bn' ? "প্রধান শিরোনাম" : "Main Headline"}</label>
            <input type="text" value={data.title} onChange={(e) => onChange({...data, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{language === 'bn' ? "বর্ণনা" : "Sub-headline"}</label>
            <textarea value={data.subtitle} onChange={(e) => onChange({...data, subtitle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold h-24 resize-none shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{language === 'bn' ? "বাটন টেক্সট" : "Button Text"}</label>
              <input type="text" value={data.button_text} onChange={(e) => onChange({...data, button_text: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-primary shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <ImageUpload 
              label={language === 'bn' ? "সিটিএ ইমেজ" : "Background Image"}
              value={data.image_url} 
              onChange={(url) => onChange({...data, image_url: url})} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ value, onChange, label }: { value: string, onChange: (url: string) => void, label: string }) {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Verify session before upload
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(language === 'bn' ? "আপনার সেশন শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।" : "Session expired. Please log in again.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      onChange(publicUrl);
      toast.success(language === 'bn' ? "ইমেজ আপলোড সফল" : "Image uploaded");
    } catch (error: any) {
      console.error("Design upload error:", error);
      if (error.message?.includes("exp")) {
        toast.error(language === 'bn' ? "লগইন সেশন শেষ হয়ে গেছে, দয়া করে আবার লগইন করুন।" : "Login session expired. Please log in again.");
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative group/img shrink-0">
            <img src={value} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm" alt="Preview" />
          </div>
        )}
        <label className="flex-1 cursor-pointer">
          <div className="h-16 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group/box">
            {uploading ? (
              <Loader2 className="animate-spin text-primary" size={16} />
            ) : (
              <>
                <Upload className="text-slate-300 dark:text-white/10 group-hover/box:text-primary transition-all mb-1" size={16} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  {value ? (language === 'bn' ? "পরিবর্তন" : "Change") : (language === 'bn' ? "আপলোড" : "Upload")}
                </span>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
}
