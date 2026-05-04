"use client";

import { BarChart3, Fingerprint, Key, Code2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";

interface Props {
  settings: any;
  onUpdate: (data: any) => void;
}

export function FacebookCAPISettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const inputCls = "w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-xl blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{bn ? "Meta Conversions API" : "Meta Conversions API"}</h3>
              <p className="text-xs text-white/70 mt-0.5">{bn ? "সার্ভার-সাইড ট্র্যাকিং" : "Server-side event tracking"}</p>
            </div>
          </div>
          <Switch checked={!!settings.enabled} onCheckedChange={(v) => upd("enabled", v)} className="data-[state=checked]:bg-white" />
        </div>
      </section>

      {/* Strict Tracking */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Switch checked={!!settings.strict_tracking} onCheckedChange={(v) => upd("strict_tracking", v)} className="mt-1" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "স্ট্রিক্ট ট্র্যাকিং" : "Strict Tracking"}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {bn ? "সক্রিয়: শুধুমাত্র নিশ্চিত অর্ডারে ইভেন্ট পাঠাবে। নিষ্ক্রিয়: চেকআউট শুরুতেই ইভেন্ট পাঠাবে।"
                : "Enabled: Only fire events on confirmed orders. Disabled: Fire events at checkout initiation."}
            </p>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className={`bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm transition-all duration-300 ${settings.enabled ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><Key size={16} className="text-blue-600" /></div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "ক্রেডেনশিয়াল" : "Credentials"}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Fingerprint size={12} /> Pixel ID</label>
            <input type="text" value={settings.pixel_id || ""} onChange={e => upd("pixel_id", e.target.value)} placeholder="e.g. 1234567890" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Key size={12} /> Access Token</label>
            <textarea rows={3} value={settings.access_token || ""} onChange={e => upd("access_token", e.target.value)} placeholder="EAAG..." className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Code2 size={12} /> Test Event Code</label>
            <input type="text" value={settings.test_code || ""} onChange={e => upd("test_code", e.target.value)} placeholder="TEST12345" className={inputCls} />
          </div>
        </div>
      </section>
    </div>
  );
}
