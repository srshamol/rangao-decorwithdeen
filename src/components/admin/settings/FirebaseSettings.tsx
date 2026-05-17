"use client";

import { Database, Key, Globe, Code2, MessageSquare, Smartphone, Info, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";

interface Props {
  settings: any;
  onUpdate: (data: any) => void;
}

export function FirebaseSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 shadow-sm";

  const fields = [
    { id: "api_key", label: "API Key", icon: Key, mono: true },
    { id: "auth_domain", label: "Auth Domain", icon: Globe, mono: false },
    { id: "project_id", label: "Project ID", icon: Code2, mono: false },
    { id: "storage_bucket", label: "Storage Bucket", icon: Database, mono: false },
    { id: "messaging_sender_id", label: "Messaging Sender ID", icon: MessageSquare, mono: true },
    { id: "app_id", label: "App ID", icon: Smartphone, mono: true },
  ];

  return (
    <div className="space-y-12">
      {/* Alert Banner - Elite Guard */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 bg-slate-950 dark:bg-orange-500 rounded-xl text-white flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden group shadow-2xl shadow-orange-500/20"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-3xl flex items-center justify-center text-orange-400 shrink-0 border border-white/10 group-hover:rotate-12 transition-transform">
          <Database size={40} />
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-black uppercase tracking-tighter mb-2">
            {bn ? "Firebase ক্লাউড ইনফ্রাস্ট্রাকচার" : "Firebase Cloud Infrastructure"}
          </h4>
          <p className="text-sm text-white/70 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
            {bn ? "Firebase কনসোল থেকে আপনার SDK কনফিগারেশন কপি করুন। এটি রিয়েল-টাইম ডাটা এবং অথেন্টিকেশন ম্যানেজ করে।" 
               : "Synchronize your application with Google Firebase services. Provide valid SDK credentials to enable real-time signals and auth protocols."}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md">
           <div className="w-2 h-2 bg-orange-400 rounded-xl animate-pulse" />
           Cloud Sync Active
        </div>
      </motion.div>

      {/* SDK Config Grid Elite */}
      <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 space-y-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
            <Code2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {bn ? "SDK এনভায়রনমেন্ট" : "SDK Environment"}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Core infrastructure parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {fields.map(field => (
            <div key={field.id} className="space-y-4 group">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2 group-focus-within:text-orange-500 transition-colors">
                <field.icon size={14} /> {field.label}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings[field.id] || ""}
                  onChange={e => upd(field.id, e.target.value)}
                  placeholder={`Enter ${field.label}`}
                  className={`${inputCls} ${field.mono ? "font-mono text-xs lowercase" : ""}`}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-focus-within:text-orange-500 group-focus-within:bg-orange-500/10 transition-all">
                   <ShieldCheck size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
             <ShieldCheck size={14} className="text-emerald-500" /> Secure Cloud Infrastructure Protocol Active
           </p>
        </div>
      </section>
    </div>
  );
}
