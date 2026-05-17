"use client";

import { BarChart3, Fingerprint, Key, Code2, ShieldCheck, Zap, Globe, ShieldAlert, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";

import { AdminSettings } from "@/types/admin";

interface Props {
  settings: Partial<AdminSettings>;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function FacebookCAPISettings({ settings, onUpdate }: Props) {
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  
  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Premium Hero Banner - Elite Command */}
      <section className="relative overflow-hidden bg-slate-950 dark:bg-white rounded-xl p-12 lg:p-16 text-white dark:text-slate-950 shadow-2xl shadow-blue-500/10 group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-blue-500/10 rounded-xl blur-[150px] group-hover:bg-blue-500/20 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-start gap-8">
            <div className="w-20 h-20 rounded-xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
              <BarChart3 size={36} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">Authorized Engine</span>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl text-[10px] font-black tracking-widest backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-xl ${settings.enabled ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                    {settings.enabled ? t("active") : t("offline")}
                 </div>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">{t("meta_capi")}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest max-w-xl leading-relaxed">
                {t("meta_capi_desc")}
              </p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-xl flex flex-col gap-6 min-w-[240px] shadow-inner">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">{t("engine_control")}</p>
                <Switch 
                  checked={!!settings.enabled} 
                  onCheckedChange={(v) => upd("enabled", v)} 
                  className="data-[state=checked]:bg-blue-500" 
                />
             </div>
             <div className="h-px bg-white/10" />
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-400" /> AES-256 Encrypted
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Strict Tracking Config */}
        <div className="lg:col-span-1">
          <section className="h-full bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-slate-50 dark:bg-white/[0.02] rounded-xl blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex flex-col h-full relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="w-14 h-14 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-2xl group-hover:rotate-6 transition-transform">
                  <ShieldAlert size={28} />
                </div>
                <Switch 
                  checked={!!settings.strict_tracking} 
                  onCheckedChange={(v) => upd("strict_tracking", v)}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-3">
                {t("strict_validation")}
              </h4>
              <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-10 flex-1 opacity-70">
                {t("strict_validation_desc")}
              </p>
              <div className={`p-6 rounded-xl border transition-all ${settings.strict_tracking ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 shadow-inner" : "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 text-slate-400"}`}>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   {settings.strict_tracking ? <ShieldCheck size={16} /> : <Zap size={16} />}
                   {settings.strict_tracking ? t("high_precision") : t("low_latency")}
                 </p>
              </div>
            </div>
          </section>
        </div>

        {/* Credentials Form - Elite Layout */}
        <div className="lg:col-span-2">
          <section className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 shadow-sm transition-all duration-700 relative overflow-hidden ${settings.enabled ? "opacity-100" : "opacity-40 grayscale pointer-events-none"}`}>
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                   <Key size={28} />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{t("api_credentials")}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">{t("auth_protocols")}</p>
                 </div>
               </div>
               <a href="https://business.facebook.com/settings/pixels" target="_blank" className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                  Events Manager <ArrowUpRight size={14}/>
               </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Pixel ID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. 1234567890"
                      value={settings.pixel_id || ""} 
                      onChange={(e) => upd("pixel_id", e.target.value)}
                      className={inputCls}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                       <Fingerprint size={16} />
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Test Code</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="TEST12345"
                      value={settings.test_code || ""} 
                      onChange={(e) => upd("test_code", e.target.value)}
                      className={inputCls}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                       <Code2 size={16} />
                    </div>
                  </div>
               </div>

               <div className="md:col-span-2 space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Access Token</label>
                  <div className="relative">
                    <textarea 
                      placeholder="EAAB..."
                      rows={3}
                      value={settings.access_token || ""} 
                      onChange={(e) => upd("access_token", e.target.value)}
                      className={`${inputCls} h-32 py-5 resize-none font-mono leading-relaxed lowercase tracking-tight`}
                    />
                    <div className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                       <Key size={16} />
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-2">{t("token_expiry_hint")}</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
