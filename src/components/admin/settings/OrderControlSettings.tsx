"use client";

import { ShieldAlert, Clock, Monitor, Phone, Wifi, AlertTriangle, Link, Percent } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings } from "@/types/admin";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function OrderControlSettings({ settings, onUpdate }: Props) {
  const { t } = useLanguage();
  const upd = (f: keyof AdminSettings, v: any) => onUpdate({ [f]: v });

  const inputCls = "w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  const ToggleRow = ({ label, desc, field, risk }: { label: string; desc: string; field: keyof AdminSettings; risk?: "safe"|"warn"|"risk" }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-slate-200 dark:hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        {risk && (
          <div className={`w-2 h-2 rounded-xl shrink-0 ${risk === 'safe' ? 'bg-primary' : risk === 'warn' ? 'bg-gold' : 'bg-rose-500'}`} />
        )}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <Switch checked={!!settings[field]} onCheckedChange={(v) => upd(field, v)} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10 rounded-xl flex items-start gap-3">
        <AlertTriangle size={18} className="text-rose-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{t("fraud_prevention_system")}</p>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">{t("fraud_prevention_desc")}</p>
        </div>
      </div>

      {/* Success Rate Filter */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center">
            <ShieldAlert size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("success_rate_filters")}</h3>
        </div>
        <div className="space-y-3">
          <ToggleRow label={t("delivery_success_filter")} desc={t("verify_courier_history")} field="success_filter_enabled" risk="safe" />
          {settings.success_filter_enabled && (
            <div className="ml-5 pl-4 border-l-2 border-emerald-200 dark:border-primary/20 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 ml-1">{t("min_success_rate")}</label>
                <div className="relative">
                  <input type="number" value={settings.success_threshold || 50} onChange={e => upd("success_threshold", Number(e.target.value))} className={inputCls} />
                  <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 ml-1">{t("low_success_redirect_url")}</label>
                <div className="relative">
                  <input type="text" value={settings.low_success_redirect || ""} onChange={e => upd("low_success_redirect", e.target.value)} placeholder="https://..." className={inputCls} />
                  <Link size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Blocking Filters */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center">
            <AlertTriangle size={16} className="text-gold" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("blocking_filters")}</h3>
        </div>
        <div className="space-y-3">
          <ToggleRow label={t("block_zero_history")} desc={t("only_known_numbers")} field="filter_zero_history" risk="warn" />
          <ToggleRow label={t("rapid_submission_filter")} desc={t("prevent_rapid_orders")} field="filter_rapid_submissions" risk="warn" />
          {settings.filter_rapid_submissions && (
            <div className="ml-5 pl-4 border-l-2 border-amber-200 dark:border-gold/20">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 ml-1">{t("min_interval_seconds")}</label>
                <div className="relative">
                  <input type="number" value={settings.min_submission_time || 30} onChange={e => upd("min_submission_time", Number(e.target.value))} className={inputCls} />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rate Limits */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <Monitor size={16} className="text-rose-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("frequency_limits")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "device", label: t("device_limit"), desc: t("browser_instance"), icon: Monitor },
            { id: "number", label: t("number_limit"), desc: t("phone_identifier"), icon: Phone },
            { id: "ip", label: t("ip_limit"), desc: t("network_address"), icon: Wifi },
          ].map(limit => (
            <div key={limit.id} className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <limit.icon size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{limit.label}</p>
                    <p className="text-[10px] text-slate-400">{limit.desc}</p>
                  </div>
                </div>
                <Switch checked={!!settings[`${limit.id}_limit_enabled`]} onCheckedChange={(v) => upd(`${limit.id}_limit_enabled`, v)} />
              </div>
              {settings[`${limit.id}_limit_enabled`] && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 ml-1">{t("block_duration_hrs")}</label>
                  <input type="number" value={settings[`${limit.id}_block_hours`] || 24} onChange={e => upd(`${limit.id}_block_hours`, Number(e.target.value))} className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
