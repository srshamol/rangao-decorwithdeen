"use client";

import { useState } from "react";
import { Building2, Globe, Phone, Mail, Facebook, Instagram, Music2, Upload, Loader2, MapPin, MessageCircle, Info, Monitor, Smartphone, Palette, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSettings } from "@/types/admin";
import { BrandingSettings } from "./BrandingSettings";

interface Props {
  settings: any;
  brandingSettings: any;
  onUpdate: (data: Partial<AdminSettings>) => void;
  onBrandingUpdate: (field: string, value: any) => void;
}

const VisibilityToggles = ({ field, settings, onUpdate }: { field: string, settings: AdminSettings, onUpdate: (data: Partial<AdminSettings>) => void }) => {
  const visibility = settings.visibility?.[field] || { desktop: true, mobile: true };
  
  const toggle = (device: 'desktop' | 'mobile') => {
    const currentVisibility = settings.visibility || {};
    const newVisibility = { 
      ...currentVisibility, 
      [field]: { 
        ...(currentVisibility[field] || { desktop: true, mobile: true }), 
        [device]: !visibility[device] 
      } 
    };
    onUpdate({ visibility: newVisibility });
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/10">
      <button 
        onClick={() => toggle('desktop')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${visibility.desktop ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <Monitor size={12} strokeWidth={2.5} />
      </button>
      <button 
        onClick={() => toggle('mobile')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${visibility.mobile ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <Smartphone size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const FieldInput = ({ label, desc = "", icon: Icon, field, settings, onUpdate, type = "text", placeholder = "", showVisibility = false }: {
  label: string;
  desc?: string;
  icon?: any;
  field: keyof AdminSettings;
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
  type?: string;
  placeholder?: string;
  showVisibility?: boolean;
}) => (
  <div className="space-y-2 group/field">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-slate-400 group-focus-within/field:text-primary transition-colors" />}
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-focus-within/field:text-primary transition-colors">{label}</label>
      </div>
      {showVisibility && <VisibilityToggles field={field as string} settings={settings} onUpdate={onUpdate} />}
    </div>
    <div className="relative">
      <input 
        type={type}
        placeholder={placeholder}
        value={settings[field] as string || ""}
        onChange={(e) => onUpdate({ [field]: e.target.value })}
        className="w-full h-11 px-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-sm"
      />
    </div>
    {desc && <p className="text-[9px] text-slate-400 font-medium ml-1 uppercase">{desc}</p>}
  </div>
);

export function GeneralSettings({ settings, onUpdate, brandingSettings, onBrandingUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'branding' | 'contact'>('basic');
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof AdminSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field as string);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `store-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onUpdate({ [field]: publicUrl });
      toast.success(bn ? "ছবি আপলোড সফল হয়েছে" : "Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Sub-navigation for Identity */}
      <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 max-w-xl shadow-inner">
        {[
          { id: 'basic', label: bn ? 'বেসিক' : 'Identity', icon: Building2 },
          { id: 'branding', label: bn ? 'ব্র্যান্ডিং' : 'Branding', icon: Palette },
          { id: 'contact', label: bn ? 'কন্টাক্ট' : 'Contacts', icon: Phone }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'basic' && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Visual Identity Section */}
            <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "logo", label: bn ? "স্টোর লোগো" : "Store Logo", desc: bn ? "হেডারে প্রদর্শনের জন্য" : "Primary brand mark" },
                    { key: "favicon", label: bn ? "ফেভিকন" : "Favicon", desc: bn ? "ব্রাউজার ট্যাবে প্রদর্শনের জন্য" : "Browser tab icon" }
                  ].map((asset) => (
                    <div key={asset.key} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">{asset.label}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase">{asset.desc}</p>
                        </div>
                        <VisibilityToggles field={asset.key} settings={settings} onUpdate={onUpdate} />
                      </div>

                      <div className="relative h-32 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 flex flex-col items-center justify-center gap-3 group transition-all hover:border-primary/20">
                        {settings[asset.key] ? (
                          <div className="flex flex-col items-center gap-3">
                            <img src={settings[asset.key]} alt={asset.key} className="h-14 object-contain group-hover:scale-110 transition-transform" />
                            <label className="cursor-pointer">
                              <span className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                Replace
                              </span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, asset.key as any)} />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                             <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                               <Upload size={20} />
                             </div>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Upload {asset.label}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, asset.key as any)} />
                          </label>
                        )}
                        {uploading === asset.key && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center rounded-xl z-10 backdrop-blur-sm">
                            <Loader2 size={20} className="animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldInput label={bn ? "কোম্পানির নাম" : "Store Name"} field="store_name" icon={Building2} settings={settings} onUpdate={onUpdate} showVisibility placeholder="e.g. Rangao Decor" />
                  <FieldInput label={bn ? "ট্যাগলাইন" : "Tagline"} field="store_tagline" icon={Info} settings={settings} onUpdate={onUpdate} showVisibility placeholder="e.g. Elevate Your Space" />
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeSubTab === 'branding' && (
          <motion.div
            key="branding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BrandingSettings 
              settings={brandingSettings} 
              onUpdate={onBrandingUpdate} 
            />
          </motion.div>
        )}

        {activeSubTab === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FieldInput label={bn ? "ফোন নম্বর" : "Phone Number"} field="phone" icon={Phone} settings={settings} onUpdate={onUpdate} showVisibility placeholder="+880 1XXX XXXXXX" />
                 <FieldInput label={bn ? "হোয়াটসঅ্যাপ" : "WhatsApp"} field="whatsapp" icon={MessageCircle} settings={settings} onUpdate={onUpdate} showVisibility placeholder="+880 1XXX XXXXXX" />
                 <FieldInput label={bn ? "ইমেইল এড্রেস" : "Email Address"} field="email" icon={Mail} settings={settings} onUpdate={onUpdate} showVisibility placeholder="hello@rangao.com" />
                 <FieldInput label={bn ? "অফিস ঠিকানা" : "Office Address"} field="address" icon={MapPin} settings={settings} onUpdate={onUpdate} showVisibility placeholder="Dhaka, Bangladesh" />
               </div>
               
               <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                     <Globe size={14} />
                   </div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Social Architecture</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <FieldInput label="Facebook" field="facebook_url" icon={Facebook} settings={settings} onUpdate={onUpdate} showVisibility placeholder="facebook.com/yourpage" />
                   <FieldInput label="Instagram" field="instagram_id" icon={Instagram} settings={settings} onUpdate={onUpdate} showVisibility placeholder="@yourusername" />
                   <FieldInput label="TikTok" field="tiktok_id" icon={Music2} settings={settings} onUpdate={onUpdate} showVisibility placeholder="@yourtiktok" />
                 </div>
               </div>
             </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
