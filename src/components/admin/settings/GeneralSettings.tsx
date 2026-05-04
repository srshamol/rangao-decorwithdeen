"use client";

import { useState } from "react";
import { Building2, Globe, Phone, Mail, Facebook, Instagram, Music2, Upload, Loader2, MapPin, MessageCircle, Image, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { AdminSettings } from "@/types/admin";
import { Switch } from "@/components/ui/switch";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

const FieldInput = ({ label, desc = "", icon: Icon, field, settings, onUpdate, type = "text", placeholder = "" }: {
  label: string;
  desc?: string;
  icon?: any;
  field: keyof AdminSettings;
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <div className="flex flex-col mb-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-400" />}
        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{label}</span>
      </div>
      {desc && <span className="text-[10px] text-slate-500 font-medium mt-0.5">{desc}</span>}
    </div>
    <input 
      type={type}
      placeholder={placeholder}
      value={settings[field] as string || ""}
      onChange={(e) => onUpdate({ [field]: e.target.value })}
      className="w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
    />
  </div>
);

export function GeneralSettings({ settings, onUpdate }: Props) {
  const { t, language } = useLanguage();
  const bn = language === 'bn';
  const [uploading, setUploading] = useState<string | null>(null);

  const update = (field: keyof AdminSettings, value: any) => onUpdate({ [field]: value });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof AdminSettings) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(field as string);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(t("session_expired"));
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
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

      update(field, publicUrl);
      toast.success(`${field} ${t("upload_success")}`);
    } catch (error: any) {
      console.error("Upload error details:", error);
      if (error.message?.includes("exp")) {
        toast.error(t("session_expired"));
      } else {
        toast.error(`${t("upload_failed")}: ${error.message}`);
      }
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo & Favicon Upload */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center">
            <Image size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("visual_identity")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("upload_logo_favicon")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: "logo", label: t("logo"), desc: t("logo_desc") },
            { key: "favicon", label: t("favicon"), desc: t("favicon_desc") }
          ].map((asset) => (
            <div key={asset.key} className="p-5 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{asset.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{asset.desc}</p>
                </div>
                {settings[asset.key] && (
                  <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-800 p-2">
                    <img src={settings[asset.key]} alt={asset.key} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <label className="flex flex-col items-center justify-center h-32 bg-white dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                {uploading === asset.key ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-xs font-medium text-primary animate-pulse">
                      {t("uploading")}
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-slate-300 mb-2" />
                    <span className="text-xs font-medium text-slate-400">
                      {t("click_to_upload")}
                    </span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, asset.key)} />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Visibility Settings */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center">
            <Globe size={16} className="text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {bn ? "ডিসপ্লে সেটিংস" : "Display Settings"}
            </h3>
            <p className="text-xs text-slate-400">
              {bn ? "স্টোরের বিভিন্ন এলিমেন্ট এর দৃশ্যমানতা নিয়ন্ত্রণ করুন" : "Control visibility of various store elements"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: bn ? "লোগো দেখান" : "Show Logo", field: "show_logo" as const, desc: bn ? "হেডারে লোগো প্রদর্শন" : "Display logo in header" },
            { label: bn ? "স্টোর নাম দেখান" : "Show Name", field: "show_name" as const, desc: bn ? "হেডারে নাম প্রদর্শন" : "Display name in header" },
            { label: bn ? "ট্যাগলাইন দেখান" : "Show Tagline", field: "show_tagline" as const, desc: bn ? "হেডারে ট্যাগলাইন প্রদর্শন" : "Display tagline in header" },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-slate-200 dark:hover:border-white/10 transition-all">
              <div>
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
              </div>
              <Switch checked={!!settings[item.field]} onCheckedChange={(v) => update(item.field, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Company Information */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Building2 size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("company_info")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("basic_business_info")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldInput
            label={t("company_name")}
            field="store_name"
            icon={Building2}
            placeholder="e.g. Rangao"
            settings={settings} onUpdate={onUpdate}
          />
          <FieldInput
            label={t("tagline")}
            field="store_tagline"
            icon={Info}
            placeholder="e.g. Simply Beautiful"
            settings={settings} onUpdate={onUpdate}
          />
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Phone size={16} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("contact_info")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("customer_contact_channels")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldInput label={t("phone")} field="phone" icon={Phone} placeholder="01XXXXXXXXX" settings={settings} onUpdate={onUpdate} />
          <FieldInput label={t("whatsapp")} field="whatsapp" icon={MessageCircle} placeholder="8801XXXXXXXXX" settings={settings} onUpdate={onUpdate} />
          <FieldInput label={t("email")} field="email" icon={Mail} placeholder="info@rangao.com" type="email" settings={settings} onUpdate={onUpdate} />
          <FieldInput label={t("address")} field="address" icon={MapPin} placeholder="Dhaka, Bangladesh" settings={settings} onUpdate={onUpdate} />
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
            <Globe size={16} className="text-pink-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("social_media")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("social_media_links")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldInput label={t("facebook_page")} field="facebook_url" icon={Facebook} placeholder="https://facebook.com/..." settings={settings} onUpdate={onUpdate} />
          <FieldInput label={t("instagram")} field="instagram_id" icon={Instagram} placeholder="@username" settings={settings} onUpdate={onUpdate} />
          <FieldInput label={t("tiktok")} field="tiktok_id" icon={Music2} placeholder="@username" settings={settings} onUpdate={onUpdate} />
        </div>
      </section>
    </div>
  );
}
