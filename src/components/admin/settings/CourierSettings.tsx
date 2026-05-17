"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Key, Globe, CheckCircle2, Star, Package, ShieldCheck, Clock, Zap, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

const COURIER_PROVIDERS = [
  { id: "steadfast", label: "Steadfast Courier", fields: ["api_key", "secret_key", "base_url"] },
  { id: "redx", label: "RedX Courier", fields: ["api_key", "pickup_location_id"] },
  { id: "pathao", label: "Pathao Courier", fields: ["client_id", "client_secret", "base_url"] },
  { id: "carrybee", label: "Carrybee", fields: ["client_id", "client_secret", "store_id", "client_context", "base_url"] },
  { id: "bd_courier", label: "BD Courier (Fraud Check)", fields: ["api_key"] },
];

import { AdminSettings } from "@/types/admin";

interface Props {
  settings: Partial<AdminSettings>;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function CourierSettings({ settings, onUpdate }: Props) {
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const [showAdd, setShowAdd] = useState(false);
  const [bdPlan, setBdPlan] = useState<any>(null);
  const [bdLoading, setBdLoading] = useState(false);

  useEffect(() => {
    const bd = settings.couriers?.find((c: any) => c.providerId === 'bd_courier');
    if (bd) {
      const timer = setTimeout(() => {
        fetchBDPlan(bd.credentials?.api_key);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [settings.couriers]);

  const fetchBDPlan = async (key?: string) => {
    setBdLoading(true);
    try {
      const url = key ? `/api/admin/fraud-check/plan?key=${key}` : "/api/admin/fraud-check/plan";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBdPlan(data.data);
      } else {
        setBdPlan(null);
      }
    } catch (e) {
      setBdPlan(null);
    }
    setBdLoading(false);
  };

  const couriers = settings.couriers || [];
  const upd = (f: string, v: any) => onUpdate({ ...settings, [f]: v });

  const addCourier = (providerId: string) => {
    const provider = COURIER_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;
    const existing = couriers.find((c: any) => c.providerId === providerId);
    if (existing) { toast.error(bn ? "ইতিমধ্যে যোগ করা আছে" : "Already added"); return; }
    const newCourier = {
      id: Math.random().toString(36).substr(2, 9),
      providerId, label: provider.label,
      credentials: {} as any, isActive: true, isSandbox: false
    };
    provider.fields.forEach(f => { newCourier.credentials[f] = ""; });
    upd("couriers", [...couriers, newCourier]);
    setShowAdd(false);
  };

  const removeCourier = (id: string) => upd("couriers", couriers.filter((c: any) => c.id !== id));
  const updateCourier = (id: string, field: string, value: any) => {
    upd("couriers", couriers.map((c: any) => c.id === id ? { ...c, [field]: value } : c));
  };
  const updateCredential = (id: string, field: string, value: string) => {
    upd("couriers", couriers.map((c: any) => c.id === id ? { ...c, credentials: { ...c.credentials, [field]: value } } : c));
  };

  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  const fieldLabel = (f: string) => {
    const labels: Record<string, string> = {
      api_key: "API Key", secret_key: "Secret Key", base_url: "Base URL",
      client_id: "Client ID", client_secret: "Client Secret",
      store_id: "Store ID", client_context: "Client Context",
      pickup_location_id: "Pickup Location ID"
    };
    return labels[f] || f;
  };

  return (
    <div className="space-y-12">
      {/* Default Courier Section - Elite Hub */}
      <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 space-y-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t("logistics_hub")}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("logistics_desc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("default_courier")}</label>
            <select 
              value={settings.default_courier || "steadfast"} 
              onChange={e => upd("default_courier", e.target.value)} 
              className={inputCls}
            >
              {COURIER_PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("sandbox_mode")}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">{t("sandbox_desc")}</p>
              </div>
            </div>
            <Switch 
              checked={!!settings.steadfast_is_sandbox} 
              onCheckedChange={v => upd("steadfast_is_sandbox", v)}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Active Integrations Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t("active_integrations")}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("integrations_desc")}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="h-14 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-950/20"
            >
              <Plus size={18} /> {t("add_provider")}
            </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-100 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/5"
            >
              {COURIER_PROVIDERS.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addCourier(p.id)}
                  className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-left hover:border-emerald-500 hover:scale-105 transition-all shadow-sm group"
                >
                  <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-emerald-500">{p.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect API</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-8">
          {couriers.map((c: any) => (
            <motion.div 
              key={c.id} 
              layout 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="p-10 flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                      <Truck size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{c.label}</h4>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl">{t("secure_engine")}</span>
                        {c.isSandbox && <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-xl">{t("staging")}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <Switch 
                          checked={c.isActive} 
                          onCheckedChange={v => updateCourier(c.id, "isActive", v)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                     </div>
                     <button 
                        onClick={() => removeCourier(c.id)}
                        className="w-full h-14 flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                     >
                        <Trash2 size={16} /> {t("disconnect_engine")}
                     </button>
                  </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                   {Object.keys(c.credentials || {}).map(f => (
                     <div key={f} className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{fieldLabel(f)}</label>
                        <div className="relative">
                           <input 
                              type="password" 
                              value={c.credentials[f] || ""} 
                              onChange={e => updateCredential(c.id, f, e.target.value)}
                              className={inputCls}
                           />
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                              <Key size={16} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BD Courier Special Section */}
      {couriers.some((c: any) => c.providerId === 'bd_courier') && (
        <section className="bg-slate-950 dark:bg-white rounded-xl p-12 lg:p-16 text-white dark:text-slate-900 relative overflow-hidden shadow-2xl shadow-emerald-500/10 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform">
                  <ShieldCheck size={32} />
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{t("fraud_intelligence")}</h3>
                   <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em]">{t("bd_courier_integration")}</p>
                </div>
              </div>

              {bdLoading ? (
                <div className="flex items-center gap-4 text-[13px] font-black uppercase tracking-widest opacity-50">
                  <Loader2 size={18} className="animate-spin" /> {t("fetching_plan")}
                </div>
              ) : bdPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-white/5 dark:bg-slate-900/5 rounded-xl border border-white/10 dark:border-slate-900/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">{t("active_plan")}</p>
                    <p className="text-4xl font-black tracking-tighter mb-2">{bdPlan.plan_name}</p>
                    <p className="text-[12px] font-bold text-white/60 dark:text-slate-950/60 uppercase tracking-widest">{bdPlan.requests_left} {t("signals_remaining")}</p>
                  </div>
                  <div className="p-8 bg-white/5 dark:bg-slate-900/5 rounded-xl border border-white/10 dark:border-slate-900/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">{t("registry_usage")}</p>
                    <div className="flex items-end gap-3">
                      <p className="text-5xl font-black tracking-tighter leading-none">{bdPlan.total_requests}</p>
                      <p className="text-[14px] font-black uppercase tracking-widest mb-1">{t("total_hits")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-4 text-rose-400 text-[13px] font-black uppercase tracking-widest">
                  <Clock size={20} /> {t("invalid_key")}
                </div>
              )}
            </div>

            <div className="lg:w-1/3 p-10 bg-white/5 dark:bg-slate-900/5 rounded-xl border border-white/10 dark:border-slate-900/10 flex flex-col justify-between backdrop-blur-2xl">
               <div>
                  <h5 className="text-[14px] font-black uppercase tracking-tight mb-2">{t("neural_fraud")}</h5>
                  <p className="text-[11px] text-white/50 dark:text-slate-950/50 font-bold uppercase tracking-widest leading-relaxed">
                    {t("neural_desc")}
                  </p>
               </div>
               <a 
                 href="https://bdcourier.com/fraud-check" 
                 target="_blank" 
                 className="mt-10 h-16 w-full bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20"
               >
                  {t("upgrade_registry")} <ArrowRight size={18}/>
               </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
