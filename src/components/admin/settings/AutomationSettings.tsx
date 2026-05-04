"use client";

import { Flame, Clock, Bell, ChevronRight, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";

interface Props { settings: any; integrations: any[]; onUpdate: (d: any) => void; }

export function AutomationSettings({ settings, integrations, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const inputCls = "w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const TAGS = ["{customer_name}", "{site_name}", "{checkout_url}", "{product_name}", "{discount_code}"];

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white shadow-lg shadow-rose-600/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-xl blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Flame size={24} /></div>
            <div>
              <h3 className="text-lg font-bold">{bn ? "কার্ট রিকভারি অটোমেশন" : "Cart Recovery Automation"}</h3>
              <p className="text-xs text-white/70 mt-0.5">{bn ? "অসম্পূর্ণ অর্ডার স্বয়ংক্রিয় ফলোআপ" : "Auto follow-up incomplete orders"}</p>
            </div>
          </div>
          <Switch checked={!!settings.enabled} onCheckedChange={(v) => upd("enabled", v)} className="data-[state=checked]:bg-white" />
        </div>
      </section>

      {/* Flow Visualization */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center"><Clock size={16} className="text-pink-600" /></div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "SMS ফ্লো" : "SMS Flow"}</h3>
        </div>

        <div className={`space-y-4 transition-all ${settings.enabled ? "" : "opacity-40 pointer-events-none"}`}>
          {/* Flow diagram */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[
              { label: bn ? "কার্ট ত্যাগ" : "Cart Abandoned", color: "bg-rose-100 text-rose-600 dark:bg-rose-500/10" },
              null,
              { label: `${settings.first_delay || 30} ${bn ? "মিনিট" : "min"}`, color: "bg-amber-100 text-gold dark:bg-gold/10" },
              null,
              { label: bn ? "১ম SMS" : "1st SMS", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10" },
              null,
              { label: `${settings.second_delay || 24} ${bn ? "ঘন্টা" : "hrs"}`, color: "bg-amber-100 text-gold dark:bg-gold/10" },
              null,
              { label: bn ? "২য় SMS" : "2nd SMS", color: "bg-emerald-100 text-primary dark:bg-primary/10" },
            ].map((item, i) =>
              item ? (
                <div key={i} className={`px-3 py-2 rounded-xl text-[10px] font-bold ${item.color}`}>{item.label}</div>
              ) : (
                <ArrowRight key={i} size={14} className="text-slate-300 flex-shrink-0" />
              )
            )}
          </div>

          {/* SMS Gateway */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 ml-1">{bn ? "SMS গেটওয়ে" : "SMS Gateway"}</label>
            <div className="relative">
              <select value={settings.provider_id || ""} onChange={e => upd("provider_id", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                <option value="">{bn ? "গেটওয়ে সিলেক্ট করুন" : "Select Gateway"}</option>
                {integrations.filter((i: any) => i.category === 'sms').map((i: any) => (
                  <option key={i.id} value={i.id}>{i.providerLabel}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Clock size={12} />{bn ? "১ম SMS (মিনিট)" : "1st SMS (minutes)"}</label>
              <input type="number" value={settings.first_delay || 30} onChange={e => upd("first_delay", Number(e.target.value))} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Bell size={12} />{bn ? "২য় SMS (ঘন্টা)" : "2nd SMS (hours)"}</label>
              <input type="number" value={settings.second_delay || 24} onChange={e => upd("second_delay", Number(e.target.value))} className={inputCls} />
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className={`bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm transition-all ${settings.enabled ? "" : "opacity-40 pointer-events-none"}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><MessageSquare size={16} className="text-blue-600" /></div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "মেসেজ টেমপ্লেট" : "Message Templates"}</h3>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">{bn ? "১ম SMS টেমপ্লেট" : "1st SMS Template"}</label>
            <textarea rows={3} value={settings.first_template || ""} onChange={e => upd("first_template", e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">{bn ? "২য় SMS টেমপ্লেট" : "2nd SMS Template"}</label>
            <textarea rows={3} value={settings.second_template || ""} onChange={e => upd("second_template", e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-semibold text-slate-500 border border-slate-200 dark:border-white/10">{tag}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
