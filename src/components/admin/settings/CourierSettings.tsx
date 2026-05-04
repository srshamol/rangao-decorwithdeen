"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Key, Globe, CheckCircle2, Star, Package, ShieldCheck, Clock, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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

interface Props {
  settings: any;
  onUpdate: (data: any) => void;
}

export function CourierSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
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

  const inputCls = "w-full h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all";

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
    <div className="space-y-6">
      {/* Default Courier */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><Star size={16} className="text-indigo-600" /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "ডিফল্ট কুরিয়ার" : "Default Courier"}</h3>
            <p className="text-xs text-slate-400">{bn ? "প্রাথমিক শিপিং পার্টনার" : "Primary shipping partner"}</p>
          </div>
        </div>
        <select value={settings.default_courier || ""} onChange={e => upd("default_courier", e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
          <option value="">{bn ? "সিলেক্ট করুন" : "Select"}</option>
          {couriers.filter((c: any) => c.isActive).map((c: any) => (
            <option key={c.id} value={c.providerId}>{c.label}</option>
          ))}
        </select>
      </section>

      {/* Add Courier */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{bn ? "কুরিয়ার সার্ভিস" : "Courier Services"} ({couriers.length})</p>
        <div className="relative">
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={14} /> {bn ? "কুরিয়ার যোগ" : "Add Courier"}
          </button>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
              {COURIER_PROVIDERS.map(p => (
                <button key={p.id} onClick={() => addCourier(p.id)} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2">
                  <Truck size={14} className="text-slate-400" /> {p.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Courier Cards */}
      {couriers.map((courier: any, idx: number) => {
        const provider = COURIER_PROVIDERS.find(p => p.id === courier.providerId);
        return (
          <motion.div key={courier.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Truck size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{courier.label}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-xl ${courier.isActive ? "bg-primary" : "bg-slate-300"}`} />
                        <span className="text-[10px] font-medium text-slate-400">{courier.isActive ? (bn ? "সক্রিয়" : "Active") : (bn ? "নিষ্ক্রিয়" : "Inactive")}</span>
                      </div>
                      {courier.providerId === 'bd_courier' && (
                        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/10 pl-3">
                          <div className={`w-1.5 h-1.5 rounded-xl ${bdPlan ? "bg-emerald-500 animate-pulse" : (bdLoading ? "bg-amber-400 animate-bounce" : "bg-rose-500")}`} />
                          <span className={`text-[10px] font-bold ${bdPlan ? "text-emerald-500" : (bdLoading ? "text-amber-500" : "text-rose-500")}`}>
                            {bdLoading ? (bn ? "চেক করা হচ্ছে..." : "CHECKING...") : (bdPlan ? (bn ? "সংযুক্ত" : "CONNECTED") : (bn ? "বিচ্ছিন্ন" : "DISCONNECTED"))}
                          </span>
                        </div>
                      )}
                      {courier.isSandbox && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-gold/20 text-amber-700 dark:text-amber-400 text-[9px] font-bold rounded">SANDBOX</span>}
                      {settings.default_courier === courier.providerId && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded">{bn ? "ডিফল্ট" : "DEFAULT"}</span>}
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] font-medium text-slate-400">Sandbox</span>
                  <Switch checked={courier.isSandbox} onCheckedChange={(v) => updateCourier(courier.id, "isSandbox", v)} />
                </div>
                <Switch checked={courier.isActive} onCheckedChange={(v) => updateCourier(courier.id, "isActive", v)} />
                <button onClick={() => removeCourier(courier.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(provider?.fields || Object.keys(courier.credentials || {})).map((field: string) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1">
                    {field.includes("key") || field.includes("secret") ? <Key size={10} /> : <Globe size={10} />}
                    {fieldLabel(field)}
                  </label>
                  <input
                    type={field.includes("key") || field.includes("secret") ? "password" : "text"}
                    value={courier.credentials?.[field] || ""}
                    onChange={e => updateCredential(courier.id, field, e.target.value)}
                    placeholder={`Enter ${fieldLabel(field)}`}
                    className={inputCls}
                  />
                </div>
              ))}
              
              {courier.providerId === 'bd_courier' && bdPlan && (
                <div className="lg:col-span-2 p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck size={16} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Plan</p>
                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{bdPlan.plan_name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Remaining</p>
                         <p className="text-xs font-black text-primary">{bdPlan.remaining_paid_calls + bdPlan.remaining_free_calls}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Expires In</p>
                         <p className="text-xs font-black text-slate-900 dark:text-white">{bdPlan.days_remaining} Days</p>
                      </div>
                   </div>
                </div>
              )}
              {courier.providerId === 'bd_courier' && bdLoading && !bdPlan && (
                <div className="lg:col-span-2 p-4 flex items-center justify-center">
                   <Loader2 size={16} className="animate-spin text-primary mr-2" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checking plan status...</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {couriers.length === 0 && (
        <div className="py-16 bg-slate-50 dark:bg-white/[0.01] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center">
          <Package size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
          <p className="text-sm font-medium text-slate-400">{bn ? "কোনো কুরিয়ার কনফিগার করা হয়নি" : "No couriers configured"}</p>
        </div>
      )}
    </div>
  );
}
