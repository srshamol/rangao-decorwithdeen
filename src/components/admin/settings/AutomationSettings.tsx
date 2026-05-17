"use client";

import { Flame, Clock, Bell, ChevronRight, MessageSquare, ArrowRight, Zap, Smartphone, Mail, Trash2, ShieldCheck, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";

import { AdminSettings } from "@/types/admin";

interface Props { 
  settings: Partial<AdminSettings>; 
  integrations: any[]; 
  onUpdate: (d: Partial<AdminSettings>) => void; 
}

export function AutomationSettings({ settings, integrations, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const TAGS = ["{customer_name}", "{site_name}", "{checkout_url}", "{product_name}", "{discount_code}"];

  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Premium Hero Banner - Elite Automation Hub */}
      <section className="relative overflow-hidden bg-slate-950 dark:bg-white rounded-xl p-12 lg:p-16 text-white dark:text-slate-950 shadow-2xl shadow-rose-500/10 group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-rose-500/10 rounded-xl blur-[150px] group-hover:scale-110 transition-transform duration-[2000ms]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-start gap-8">
            <div className="w-20 h-20 rounded-xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
              <Flame size={40} className="text-rose-400 fill-rose-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20">Elite Neural Flow</span>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl text-[10px] font-black tracking-widest backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-xl ${settings.enabled ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                    {settings.enabled ? (bn ? "সক্রিয়" : "OPERATIONAL") : (bn ? "নিষ্ক্রিয়" : "PAUSED")}
                 </div>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">Cart Recovery <span className="text-rose-500">Studio</span></h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest max-w-xl leading-relaxed">
                {bn ? "অসম্পূর্ণ অর্ডারগুলো স্বয়ংক্রিয়ভাবে ফলো-আপ করে আপনার বিক্রয় বৃদ্ধি করুন।" 
                   : "Re-engage lost customers automatically and transform abandoned carts into completed high-value sales."}
              </p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-xl flex flex-col gap-6 min-w-[260px] shadow-inner">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">{bn ? "ফ্লো অটোমেশন" : "FLOW AUTOMATION"}</p>
                <Switch 
                  checked={!!settings.enabled} 
                  onCheckedChange={(v) => upd("enabled", v)} 
                  className="data-[state=checked]:bg-rose-500" 
                />
             </div>
             <div className="h-px bg-white/10" />
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-400" /> Active Tracking
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Visual Flow Architecture - Elite Visualization */}
        <section className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 shadow-sm transition-all duration-700 relative overflow-hidden ${settings.enabled ? "opacity-100" : "opacity-40 grayscale"}`}>
          <div className="flex items-center gap-6 mb-16">
            <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shadow-inner">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{bn ? "রিকভারি সিকোয়েন্স" : "Recovery Sequence"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Logical flow orchestration</p>
            </div>
          </div>

          <div className="space-y-16">
            {/* High-fidelity Timeline Elite */}
            <div className="relative flex items-center justify-between px-6">
               <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2 z-0 rounded-xl" />
               <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 -translate-y-1/2 z-0 rounded-xl transition-all duration-1000 shadow-lg shadow-rose-500/20" style={{ width: settings.enabled ? '100%' : '0%' }} />
               
               {[
                 { icon: Trash2, label: bn ? "ত্যাগ" : "Abandoned", color: "bg-rose-500" },
                 { icon: Clock, label: `${settings.first_delay || 30}m`, color: "bg-amber-500" },
                 { icon: Smartphone, label: bn ? "১ম SMS" : "1st SMS", color: "bg-blue-500" },
                 { icon: Clock, label: `${settings.second_delay || 24}h`, color: "bg-amber-500" },
                 { icon: Target, label: bn ? "২য় SMS" : "2nd SMS", color: "bg-emerald-500" }
               ].map((step, i) => (
                 <div key={i} className="relative z-10 flex flex-col items-center gap-4 group">
                   <div className={`w-14 h-14 rounded-xl ${step.color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <step.icon size={24} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-100 dark:border-white/5 whitespace-nowrap shadow-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{step.label}</span>
                 </div>
               ))}
            </div>

            {/* Config Grids Elite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{bn ? "SMS গেটওয়ে" : "Dispatch Gateway"}</label>
                <select 
                  value={settings.provider_id || ""} 
                  onChange={e => upd("provider_id", e.target.value)} 
                  className={inputCls}
                >
                  <option value="">{bn ? "সিলেক্ট গেটওয়ে" : "Select Gateway"}</option>
                  {integrations.filter(i => i.type === 'sms').map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{bn ? "ম্যাক্স অ্যাটেম্পট" : "Max Attempts"}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={settings.max_attempts || 2} 
                    onChange={e => upd("max_attempts", Number(e.target.value))} 
                    className={inputCls} 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                    <Target size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Template Studio - Elite Editor */}
        <section className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 shadow-sm transition-all duration-700 relative overflow-hidden ${settings.enabled ? "opacity-100" : "opacity-40 grayscale"}`}>
          <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
              <MessageSquare size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{bn ? "টেমপ্লেট স্টুডিও" : "Template Studio"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">High-conversion messaging</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-6">
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => upd("message_template", (settings.message_template || "") + " " + tag)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 hover:shadow-lg transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea 
                  rows={6} 
                  value={settings.message_template || ""} 
                  onChange={e => upd("message_template", e.target.value)}
                  placeholder={bn ? "এখানে মেসেজ লিখুন..." : "Enter your recovery message..."}
                  className={`${inputCls} h-48 py-6 resize-none font-bold leading-relaxed`}
                />
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                   {(settings.message_template || "").length} Characters
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-5 group hover:bg-emerald-500/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                     <Target size={20} />
                  </div>
                  <div>
                     <p className="text-[12px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Precision Targeting</p>
                     <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest">Active validation enabled</p>
                  </div>
               </div>
               <div className="flex-1 p-8 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-5 group hover:bg-blue-500/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                     <Target size={20} />
                  </div>
                  <div>
                     <p className="text-[12px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight">Conversion Focus</p>
                     <p className="text-[10px] text-blue-600/70 font-bold uppercase tracking-widest">Smart link wrapping</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
