"use client";

import { ShieldAlert, Clock, Monitor, Phone, Wifi, AlertTriangle, Link, Percent } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings } from "@/types/admin";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function OrderControlSettings({ settings, onUpdate }: Props) {
  const { t, language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: keyof AdminSettings, v: any) => onUpdate({ [f]: v });

  const inputCls = "w-full min-h-[3.5rem] px-[1.5%] sm:px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[clamp(11px,2.5vw,13px)] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  const ToggleRow = ({ label, desc, field, risk, icon: Icon }: { label: string; desc: string; field: keyof AdminSettings; risk?: "safe"|"warn"|"risk"; icon?: any }) => (
    <div className="flex items-center justify-between p-[2%] sm:p-8 bg-white dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
      <div className="flex items-center gap-[1.5%] sm:gap-6">
        <div className={`w-[2.5rem] h-[2.5rem] sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all shadow-inner ${
          risk === 'safe' ? 'bg-emerald-500/10 text-emerald-600' : 
          risk === 'warn' ? 'bg-amber-500/10 text-amber-600' : 
          risk === 'risk' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-400'
        }`}>
          {Icon ? <Icon size={20} /> : <div className="w-2 h-2 rounded-xl bg-current" />}
        </div>
        <div>
          <p className="text-[clamp(12px,2.5vw,14px)] font-black text-slate-900 dark:text-white uppercase tracking-tight">{label}</p>
          <p className="text-[clamp(9px,2vw,11px)] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">{desc}</p>
        </div>
      </div>
      <Switch checked={!!settings[field]} onCheckedChange={(v) => upd(field, v)} className="data-[state=checked]:bg-emerald-600" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Alert Banner - Elite Guard */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 bg-slate-950 dark:bg-rose-500 rounded-xl text-white flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden group shadow-2xl shadow-rose-500/20"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-3xl flex items-center justify-center text-rose-400 shrink-0 border border-white/10 group-hover:rotate-12 transition-transform">
          <ShieldAlert size={40} />
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-black uppercase tracking-tighter mb-2">
            {t("fraud_prevention_system")}
          </h4>
          <p className="text-sm text-white/70 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
            {t("fraud_prevention_desc")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md">
           <div className="w-2 h-2 bg-rose-400 rounded-xl animate-pulse" />
           Shield Active
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Success Rate Config */}
        <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t("success_rate_filters")}
            </h3>
          </div>
          
          <div className="space-y-6">
            <ToggleRow 
              label={t("delivery_success_filter")} 
              desc={t("verify_courier_history")} 
              field="success_filter_enabled" 
              risk="safe"
              icon={ShieldAlert}
            />
            <AnimatePresence>
              {settings.success_filter_enabled && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("min_success_rate")}</label>
                    <div className="relative">
                      <input type="number" value={settings.success_threshold || 50} onChange={e => upd("success_threshold", Number(e.target.value))} className={inputCls} />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                        <Percent size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <ToggleRow label={t("auto_confirmation")} desc={t("auto_confirmation_desc")} field="auto_confirm_high_success" risk="safe" icon={Wifi} />
          </div>
        </section>

        {/* Operational Security */}
        <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
              <Monitor size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t("operational_security")}
            </h3>
          </div>

          <div className="space-y-6">
            <ToggleRow label={t("block_vpx_users")} desc={t("vpx_desc")} field="block_vpn" risk="risk" icon={ShieldAlert} />
            <ToggleRow label={t("block_duplicate_orders")} desc={t("duplicate_desc")} field="block_duplicates" risk="warn" icon={Monitor} />
            <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("duplicate_window_minutes")}</label>
              <div className="relative">
                <input type="number" value={settings.duplicate_window || 60} onChange={e => upd("duplicate_window", Number(e.target.value))} className={inputCls} />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Clock size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* External Links Control */}
        <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 shadow-sm space-y-8 lg:col-span-2">
           <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
              <Link size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t("external_links_tracking")}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("tracking_page_url")}</label>
              <input type="text" placeholder="https://..." value={settings.tracking_page_url || ""} onChange={e => upd("tracking_page_url", e.target.value)} className={inputCls} />
            </div>
            <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("terms_conditions_url")}</label>
              <input type="text" placeholder="https://..." value={settings.terms_url || ""} onChange={e => upd("terms_url", e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
