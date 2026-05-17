import { useState, useEffect } from "react";
import { 
  Layout, Tag, Zap, ShieldCheck, Plus, Trash2, 
  Upload, Loader2, Smartphone, Banknote, Truck, 
  HeartHandshake, Star, Clock, Gift, Image as ImageIcon,
  ChevronRight, CheckCircle2, Globe, Sparkles, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { ComboSettings } from "./ComboSettings";

interface Props {
  settings: any;
  onUpdate: (data: any) => void;
  onUpdateCombo?: (data: any) => void;
  onlyCombos?: boolean;
}

export function StoreDesignSettings({ settings, onUpdate, onUpdateCombo, onlyCombos = false }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [activeSubTab, setActiveSubTab] = useState(onlyCombos ? "combo" : "hero");

  const heroSlides = settings.hero_slides || [];
  const banners = settings.home_banners || [];
  const ctaData = settings.home_cta || {};
  const trustBadges = settings.trust_badges || [];
  const comboSettings = settings;

  const handleUpdate = (field: string, data: any) => {
    onUpdate({ [field]: data });
  };

  const handleUpdateCombo = onUpdateCombo || ((data: any) => onUpdate(data));

  const modules = [
    { id: "hero", label: bn ? "হিরো স্লাইডার" : "HERO MASTER", icon: Layout, color: "emerald" },
    { id: "banners", label: bn ? "প্রোমো ব্যানার" : "PROMO HUB", icon: Tag, color: "blue" },
    { id: "cta", label: bn ? "সিটিএ ব্যানার" : "ACTION BAR", icon: Zap, color: "amber" },
    { id: "badges", label: bn ? "ট্রাস্ট ব্যাজ" : "TRUST PANEL", icon: ShieldCheck, color: "violet" },
    { id: "combo", label: bn ? "কম্বো পেজ" : "COMBO SUITE", icon: Gift, color: "rose" },
  ].filter(m => !onlyCombos || m.id === "combo");

  return (
    <div className="space-y-12">
      {/* Premium Module Selector */}
      {!onlyCombos && (
        <div className="grid grid-cols-2 gap-4">
          {modules.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-4 p-6 rounded-xl border-2 transition-all group relative overflow-hidden ${
                activeSubTab === tab.id 
                ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-2xl shadow-emerald-500/10 text-emerald-600" 
                : "bg-slate-50/50 dark:bg-white/[0.02] border-transparent text-slate-400 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-white/5"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                activeSubTab === tab.id 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-white dark:bg-white/5 text-slate-400 group-hover:scale-110 group-hover:text-emerald-500"
              }`}>
                <tab.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
              
              {activeSubTab === tab.id && (
                <motion.div 
                  layoutId="activeModuleHighlight"
                  className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={onlyCombos ? "" : "min-h-[600px]"}
        >
          {activeSubTab === "hero" && <HeroSettings slides={heroSlides} onChange={(d: any[]) => handleUpdate("hero_slides", d)} />}
          {activeSubTab === "banners" && <BannerSettings banners={banners} onChange={(d: any[]) => handleUpdate("home_banners", d)} />}
          {activeSubTab === "cta" && <CTASettings data={ctaData || {}} onChange={(d: any) => handleUpdate("home_cta", d)} />}
          {activeSubTab === "badges" && <TrustSettings badges={trustBadges} onChange={(d: any[]) => handleUpdate("trust_badges", d)} />}
          {activeSubTab === "combo" && <div className={onlyCombos ? "" : "-mx-4 md:-mx-8"}><ComboSettings settings={comboSettings} onUpdate={handleUpdateCombo} /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function HeroSettings({ slides, onChange }: { slides: any[], onChange: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";

  const addSlide = () => {
    onChange([...slides, { 
      badge: bn ? "নতুন কালেকশন" : "NEW ARRIVAL",
      title: bn ? "এক্সক্লুসিভ কালেকশন" : "Exclusive Collection", 
      description: bn ? "আমাদের প্রিমিয়াম প্রোডাক্টগুলো দেখুন..." : "Discover our latest premium products...", 
      image: "", 
      button_text: bn ? "এখনই কিনুন" : "Shop Now", 
      layout: "image-right"
    }]);
  };

  const updateSlide = (idx: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[idx] = { ...newSlides[idx], [field]: value };
    onChange(newSlides);
  };

  const removeSlide = (idx: number) => {
    onChange(slides.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
             <Layout className="text-emerald-500" size={28} />
             {bn ? "হিরো স্লাইডার কনফিগারেশন" : "HERO SLIDER MASTER"}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {bn ? "হোমপেজের মূল ব্যানারগুলো ম্যানেজ করুন" : "ORCHESTRATE THE PRIMARY VISUALS OF YOUR HOMEPAGE"}
          </p>
        </div>
        <button 
          onClick={addSlide}
          className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={18} /> {bn ? "নতুন স্লাইড" : "LAUNCH SLIDE"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {slides.map((slide, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all"
          >
            <div className="p-10 lg:p-16">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black text-lg shadow-xl">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                      {slide.title || (bn ? "নতুন স্লাইড" : "NEW CAMPAIGN SLIDE")}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SLIDE CONFIGURATION INDEX</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeSlide(idx)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-20">
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম" : "PRIMARY HEADLINE"}</label>
                    <input 
                      type="text" 
                      value={slide.title} 
                      onChange={(e) => updateSlide(idx, "title", e.target.value)}
                      placeholder="ENTER STRIKING TITLE"
                      className="w-full h-16 px-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[15px] font-black text-slate-900 dark:text-white focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "উপশিরোনাম" : "CONTEXTUAL DESCRIPTION"}</label>
                    <textarea 
                      value={slide.description} 
                      onChange={(e) => updateSlide(idx, "description", e.target.value)}
                      placeholder="COMPOSE ENGAGING NARRATIVE..."
                      className="w-full h-32 px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-300 focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "বাটন টেক্সট" : "ACTION LABEL"}</label>
                      <input 
                        type="text" 
                        value={slide.button_text} 
                        onChange={(e) => updateSlide(idx, "button_text", e.target.value)}
                        className="w-full h-14 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-black uppercase tracking-widest outline-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "লেআউট" : "VISUAL ANCHOR"}</label>
                      <div className="relative">
                        <select 
                          value={slide.layout} 
                          onChange={(e) => updateSlide(idx, "layout", e.target.value)}
                          className="w-full h-14 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                        >
                          <option value="image-right">IMAGE ANCHOR: RIGHT</option>
                          <option value="image-left">IMAGE ANCHOR: LEFT</option>
                          <option value="centered">CENTERED COMPOSITION</option>
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ইমেজ" : "MASTER VISUAL ASSET"}</label>
                    <div className="aspect-[16/10] rounded-xl bg-slate-50 dark:bg-white/5 border-4 border-dashed border-slate-200 dark:border-white/10 overflow-hidden relative group/img shadow-inner">
                      {slide.image ? (
                        <>
                          <img src={slide.image} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white text-slate-900 flex items-center justify-center shadow-2xl animate-in zoom-in-75">
                               <Upload size={24} />
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Replace Asset</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4">
                          <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                             <ImageIcon size={40} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest">Drop Creative Asset Here</span>
                        </div>
                      )}
                    </div>
                    <div className="relative mt-6">
                      <input 
                        type="text" 
                        value={slide.image} 
                        onChange={(e) => updateSlide(idx, "image", e.target.value)}
                        placeholder="SOURCE URL (HTTPS://...)"
                        className="w-full h-14 px-6 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-mono outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                         <Globe size={18} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                     <div className="flex gap-4">
                        <Sparkles className="text-emerald-500 shrink-0" size={20} />
                        <div>
                           <p className="text-[11px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest mb-1">PRO-TIP</p>
                           <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                             Maintain a 16:10 aspect ratio (e.g. 1920x1200px) for optimal visual clarity across Retina and 4K displays.
                           </p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function TrustSettings({ badges, onChange }: { badges: any[], onChange: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";

  const addBadge = () => {
    onChange([...badges, { icon: "Truck", title: bn ? "দ্রুত ডেলিভারি" : "Fast Delivery", description: bn ? "২৪-৪৮ ঘণ্টার মধ্যে" : "Within 24-48 hours" }]);
  };
  const updateBadge = (idx: number, field: string, value: string) => {
    const nb = [...badges];
    nb[idx] = { ...nb[idx], [field]: value };
    onChange(nb);
  };
  const removeBadge = (idx: number) => {
    onChange(badges.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
             <ShieldCheck className="text-emerald-500" size={28} />
             {bn ? "ট্রাস্ট ব্যাজ সেটিংস" : "TRUST & CREDIBILITY"}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {bn ? "গ্রাহকদের আস্থা অর্জনের ব্যাজগুলো পরিবর্তন করুন" : "MANAGE ICONS THAT BUILD UNYIELDING CUSTOMER CONFIDENCE"}
          </p>
        </div>
        <button onClick={addBadge} className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
          <Plus size={18} /> {bn ? "ব্যাজ যোগ করুন" : "ADD CREDENTIAL"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {badges.map((badge, idx) => (
          <motion.div 
            key={idx} 
            layout
            whileHover={{ y: -5 }}
            className="group p-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl space-y-8 relative shadow-sm hover:shadow-2xl transition-all"
          >
            <button 
              onClick={() => removeBadge(idx)} 
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
            
            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck size={32} />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম" : "BADGE IDENTITY"}</label>
                <input 
                  type="text" 
                  value={badge.title} 
                  onChange={(e) => updateBadge(idx, "title", e.target.value)} 
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-xl px-4 h-12 text-[12px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "বর্ণনা" : "SUBTEXT"}</label>
                 <input 
                  type="text" 
                  value={badge.description} 
                  onChange={(e) => updateBadge(idx, "description", e.target.value)} 
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-xl px-4 h-10 text-[11px] font-medium text-slate-500 outline-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function BannerSettings({ banners, onChange }: { banners: any[], onChange: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";

  const addBanner = () => {
    onChange([...(banners || []), { id: Date.now(), title: bn ? "বিশেষ অফার" : "Special Offer", image_url: "", link: "/shop" }]);
  };
  const updateBanner = (id: any, field: string, value: string) => {
    onChange((banners || []).map((b: any) => b.id === id ? { ...b, [field]: value } : b));
  };
  const removeBanner = (id: any) => {
    onChange((banners || []).filter((b: any) => b.id !== id));
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
             <Tag className="text-emerald-500" size={28} />
             {bn ? "প্রোমো ব্যানার" : "PROMO HUB"}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {bn ? "হোমপেজের সেকেন্ডারি ব্যানারগুলো কনফিগার করুন" : "CONFIGURE SECONDARY PROMOTIONAL REAL ESTATE"}
          </p>
        </div>
        <button onClick={addBanner} className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
          <Plus size={18} /> {bn ? "ব্যানার যোগ করুন" : "LAUNCH PROMO"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {(banners || []).map((banner: any) => (
          <motion.div 
            key={banner.id} 
            layout
            className="group p-10 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl space-y-10 relative shadow-sm transition-all hover:shadow-2xl"
          >
            <button 
              onClick={() => removeBanner(banner.id)} 
              className="absolute top-8 right-8 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="grid grid-cols-1 gap-12">
               <div className="space-y-8">
                 <div className="space-y-2.5">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ব্যানার শিরোনাম" : "PROMO IDENTITY"}</label>
                   <input 
                     value={banner.title} 
                     onChange={(e) => updateBanner(banner.id, "title", e.target.value)}
                     placeholder="ENTER PROMO TITLE"
                     className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                   />
                 </div>
                 <div className="space-y-2.5">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "লিংক" : "NAVIGATION LINK"}</label>
                   <div className="relative">
                      <input 
                        value={banner.link} 
                        onChange={(e) => updateBanner(banner.id, "link", e.target.value)}
                        className="w-full h-12 px-6 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-mono outline-none"
                        placeholder="/collections/sale"
                      />
                      <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                   </div>
                 </div>
               </div>
               
               <div className="space-y-4">
                  <div className="aspect-[16/8] rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 overflow-hidden relative group/bimg shadow-inner">
                    {banner.image_url ? (
                      <>
                        <img src={banner.image_url} className="w-full h-full object-cover group-hover/bimg:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/bimg:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center shadow-xl">
                              <Upload size={18} />
                           </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                        <ImageIcon size={32} />
                        <span className="text-[9px] font-black uppercase tracking-widest">UPLOAD CREATIVE</span>
                      </div>
                    )}
                  </div>
                  <input 
                    value={banner.image_url} 
                    onChange={(e) => updateBanner(banner.id, "image_url", e.target.value)}
                    placeholder="https://asset.cdn/..."
                    className="w-full h-11 px-5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-mono outline-none opacity-60 focus:opacity-100 transition-all"
                  />
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CTASettings({ data, onChange }: { data: any, onChange: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  
  return (
    <div className="space-y-12">
      <div className="px-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
           <Zap className="text-amber-500 fill-amber-500" size={28} />
           {bn ? "সিটিএ ব্যানার (Call-to-Action)" : "ACTION BAR CONFIG"}
        </h3>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {bn ? "হোমপেজের মেইন হাইলাইট সেকশন" : "OPTIMIZE THE CONVERSION ENGINE ON YOUR HOMEPAGE"}
        </p>
      </div>
      
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-12 lg:p-20 space-y-16">
          <div className="grid grid-cols-1 gap-20">
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "প্রধান শিরোনাম" : "CAMPAIGN HEADLINE"}</label>
                <input 
                  type="text" 
                  value={data.title} 
                  onChange={(e) => onChange({...data, title: e.target.value})} 
                  placeholder="ENTER BOLD CALL-TO-ACTION"
                  className="w-full px-6 h-16 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[16px] font-black text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "উপ-শিরোনাম / বর্ণনা" : "SUPPORTING COPY"}</label>
                <textarea 
                  value={data.subtitle} 
                  onChange={(e) => onChange({...data, subtitle: e.target.value})} 
                  placeholder="ENTER PERSUASIVE SUBTEXT..."
                  className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[15px] font-medium text-slate-600 dark:text-slate-300 h-40 resize-none focus:outline-none focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm leading-relaxed" 
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "বাটন টেক্সট" : "ACTION TRIGGER"}</label>
                  <input 
                    type="text" 
                    value={data.button_text} 
                    onChange={(e) => onChange({...data, button_text: e.target.value})} 
                    className="w-full px-6 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-black uppercase tracking-widest text-amber-600 focus:outline-none shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-xl p-10 shadow-inner">
                <ImageUpload 
                  label={bn ? "সিটিএ ব্যাকগ্রাউন্ড ইমেজ" : "ACTION BACKDROP"}
                  value={data.image_url} 
                  onChange={(url) => onChange({...data, image_url: url})} 
                />
                
                <div className="mt-12 p-8 bg-amber-500/5 rounded-xl border border-amber-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-125 transition-transform duration-1000">
                     <Zap size={100} />
                  </div>
                  <div className="flex gap-5 relative">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
                      <Zap size={20} className="fill-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-[0.2em] mb-2">{bn ? "টিপস" : "PRO OPTIMIZATION"}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {bn ? "সিটিএ ব্যানারের জন্য পরিষ্কার এবং হাই-কোয়ালিটি ইমেজ ব্যবহার করুন যা টেক্সটের সাথে মানানসই হয়।" : "UTILIZE HIGH-CONTRAST IMAGERY WITH MINIMAL DETAIL TO ENSURE MAXIMUM LEGIBILITY OF YOUR CAMPAIGN HEADLINES."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuoteSettings({ data, onChange }: { data: any, onChange: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  
  return (
    <div className="space-y-12">
      <div className="px-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
           <Sparkles className="text-emerald-500" size={28} />
           {bn ? "ইসলামিক ভার্স সেটিংস" : "ISLAMIC QUOTE MASTER"}
        </h3>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {bn ? "আরবি আয়াত এবং অনুবাদ ম্যানেজ করুন" : "ORCHESTRATE THE SPIRITUAL ANCHOR OF YOUR HOMEPAGE"}
        </p>
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 lg:p-12 space-y-10">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "আরবি আয়াত" : "ARABIC SCRIPT (BISMILLAH/VERSE)"}</label>
            <input 
              value={data.arabic} 
              onChange={e => onChange({ ...data, arabic: e.target.value })}
              className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-2xl font-serif text-center text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/10"
              placeholder="﷽"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম (BN)" : "HEADLINE (BN)"}</label>
              <input 
                value={data.title_bn} 
                onChange={e => onChange({ ...data, title_bn: e.target.value })}
                className="w-full h-12 px-5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম (EN)" : "HEADLINE (EN)"}</label>
              <input 
                value={data.title_en} 
                onChange={e => onChange({ ...data, title_en: e.target.value })}
                className="w-full h-12 px-5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ভার্স টেক্সট (BN)" : "VERSE TRANSLATION (BN)"}</label>
            <textarea 
              value={data.text_bn} 
              onChange={e => onChange({ ...data, text_bn: e.target.value })}
              className="w-full h-32 px-5 py-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium resize-none outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ভার্স টেক্সট (EN)" : "VERSE TRANSLATION (EN)"}</label>
            <textarea 
              value={data.text_en} 
              onChange={e => onChange({ ...data, text_en: e.target.value })}
              className="w-full h-32 px-5 py-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium resize-none outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "রেফারেন্স (BN)" : "REFERENCE (BN)"}</label>
              <input 
                value={data.ref_bn} 
                onChange={e => onChange({ ...data, ref_bn: e.target.value })}
                className="w-full h-10 px-5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none"
                placeholder="সূরা মারইয়াম • আয়াত ৩১"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "রেফারেন্স (EN)" : "REFERENCE (EN)"}</label>
              <input 
                value={data.ref_en} 
                onChange={e => onChange({ ...data, ref_en: e.target.value })}
                className="w-full h-10 px-5 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none"
                placeholder="Surah Maryam • Verse 31"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionTextSettings({ data, onChange, title, icon: Icon }: { data: any, onChange: any, title: string, icon: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";

  return (
    <div className="space-y-8">
      <div className="px-2">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
           <Icon className="text-emerald-500" size={24} />
           {title}
        </h3>
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম (BN)" : "TITLE (BN)"}</label>
              <input 
                value={data.title_bn || ''} 
                onChange={e => onChange({ ...data, title_bn: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "শিরোনাম (EN)" : "TITLE (EN)"}</label>
              <input 
                value={data.title_en || ''} 
                onChange={e => onChange({ ...data, title_en: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
              />
            </div>
          </div>

          {(data.subtitle_en !== undefined || data.subtitle_bn !== undefined) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "উপ-শিরোনাম (BN)" : "SUBTITLE (BN)"}</label>
                <input 
                  value={data.subtitle_bn || ''} 
                  onChange={e => onChange({ ...data, subtitle_bn: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "উপ-শিরোনাম (EN)" : "SUBTITLE (EN)"}</label>
                <input 
                  value={data.subtitle_en || ''} 
                  onChange={e => onChange({ ...data, subtitle_en: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none"
                />
              </div>
            </div>
          )}

          {(data.btn_en !== undefined || data.btn_bn !== undefined) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "বাটন টেক্সট (BN)" : "BUTTON TEXT (BN)"}</label>
                <input 
                  value={data.btn_bn || ''} 
                  onChange={e => onChange({ ...data, btn_bn: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "বাটন টেক্সট (EN)" : "BUTTON TEXT (EN)"}</label>
                <input 
                  value={data.btn_en || ''} 
                  onChange={e => onChange({ ...data, btn_en: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductPicker({ selectedIds, onChange, title, icon: Icon }: { selectedIds: string[], onChange: (ids: string[]) => void, title: string, icon: any }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, name_bn, images, price')
      .eq('is_combo', false)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.name_bn?.includes(search)
  );

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="px-2">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
           <Icon className="text-emerald-500" size={24} />
           {title}
        </h3>
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={bn ? "পণ্য খুঁজুন..." : "Search products..."}
              className="w-full h-12 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Catalog...</span>
              </div>
            ) : filteredProducts.map(product => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`relative group p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    isSelected 
                    ? "bg-emerald-500/5 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-emerald-500/30"
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 relative">
                    <img 
                      src={product.images?.[0] || "/placeholder.png"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in-75">
                          <CheckCircle2 size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white line-clamp-1">
                      {bn ? product.name_bn || product.name : product.name}
                    </p>
                    <p className="text-[9px] font-black text-emerald-600 mt-0.5">৳{product.price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ value, onChange, label }: { value: string, onChange: (url: string) => void, label: string }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(bn ? "আপনার সেশন শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।" : "Session expired. Please log in again.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `design/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      onChange(publicUrl);
      toast.success(bn ? "ইমেজ আপলোড সফল হয়েছে" : "Image uploaded successfully");
    } catch (error: any) {
      console.error("Design upload error:", error);
      toast.error(bn ? `আপলোড ব্যর্থ হয়েছে: ${error.message}` : `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-8">
        <div className="relative group/img shrink-0">
          <div className="w-28 h-28 rounded-xl border-4 border-white dark:border-white/5 overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-2xl relative">
            {value ? (
              <img src={value} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-white/5">
                <ImageIcon size={32} />
              </div>
            )}
            {uploading && (
               <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
               </div>
            )}
          </div>
          {value && !uploading && (
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <Upload size={20} className="text-white" />
            </div>
          )}
        </div>

        <label className="flex-1 cursor-pointer">
          <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group/box">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                 <Loader2 className="animate-spin text-emerald-500" size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Syncing Asset...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3 group-hover/box:bg-emerald-500 group-hover/box:text-white transition-all shadow-sm">
                   <Upload size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/box:text-emerald-600 transition-colors">
                  {value ? (language === 'bn' ? "ব্যানার পরিবর্তন" : "REPLACE ASSET") : (language === 'bn' ? "আপলোড করুন" : "UPLOAD MASTER")}
                </span>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
