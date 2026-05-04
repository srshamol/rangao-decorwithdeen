"use client";

import { Database, Key, Globe, Code2, MessageSquare, Smartphone, Info } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Props {
  settings: any;
  onUpdate: (data: any) => void;
}

export function FirebaseSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const inputCls = "w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  const fields = [
    { id: "api_key", label: "API Key", icon: Key, mono: true },
    { id: "auth_domain", label: "Auth Domain", icon: Globe, mono: false },
    { id: "project_id", label: "Project ID", icon: Code2, mono: false },
    { id: "storage_bucket", label: "Storage Bucket", icon: Database, mono: false },
    { id: "messaging_sender_id", label: "Messaging Sender ID", icon: MessageSquare, mono: true },
    { id: "app_id", label: "App ID", icon: Smartphone, mono: true },
  ];

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/10 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{bn ? "Firebase কনফিগারেশন" : "Firebase Configuration"}</p>
          <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">{bn ? "Firebase কনসোল থেকে আপনার SDK কনফিগারেশন কপি করুন।" : "Copy your SDK configuration from the Firebase Console."}</p>
        </div>
      </div>

      {/* Fields */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center"><Database size={16} className="text-orange-600" /></div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "SDK কনফিগারেশন" : "SDK Configuration"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(field => (
            <div key={field.id} className="space-y-2 group">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1 group-focus-within:text-primary transition-colors">
                <field.icon size={12} className="text-slate-400" /> {field.label}
              </label>
              <input
                type="text"
                value={settings[field.id] || ""}
                onChange={e => upd(field.id, e.target.value)}
                placeholder={`Enter ${field.label}`}
                className={`${inputCls} ${field.mono ? "font-mono text-xs" : ""}`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
