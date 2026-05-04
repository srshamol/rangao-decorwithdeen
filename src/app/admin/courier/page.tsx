"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { 
  Truck, ExternalLink, Settings, CreditCard, Activity, CheckCircle2, 
  AlertTriangle, Save, Key, Loader2, RefreshCcw, RefreshCw, 
  ChevronRight, LayoutGrid, DollarSign, XCircle, ShieldCheck,
  Zap, Package, ShieldAlert, BarChart3, ArrowRight, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { CourierSettings } from "@/components/admin/settings/CourierSettings";

function CourierManagementContent() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"steadfast" | "redx" | "carrybee" | "intelligence" | "settings">("steadfast");
  const [plan, setPlan] = useState<any>(null);

  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("store_configs")
      .select("*")
      .eq("id", "courier_settings")
      .single();
    
    if (!error && data) {
      setSettings(data.value || {});
    }
    fetchPlan();
  };

  const fetchPlan = async () => {
    try {
      const res = await fetch("/api/admin/fraud-check/plan");
      const d = await res.json();
      if (d.success) setPlan(d.data);
    } catch (e) {}
  };

  const handleUpdateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    try {
      const { error } = await supabase
        .from("store_configs")
        .upsert({ id: "courier_settings", value: newSettings });
      
      if (error) throw error;
      toast.success("Carrier protocol updated");
    } catch (err: any) {
      toast.error("Protocol error: " + err.message);
    }
  };

  const [deliveryStats, setDeliveryStats] = useState({
    steadfast: { balance: 0, delivered: 0, returned: 0, pending: 0 },
    carrybee: { balance: 0, delivered: 0, returned: 0, pending: 0 },
    redx: { balance: 0, delivered: 0, returned: 0, pending: 0 },
    totalBalance: 0,
    successRate: 0,
    activeShipments: 0
  });

  const calculateStats = async () => {
    setLoading(true);
    const { data: orders } = await supabase.from("orders").select("status, admin_note");
    if (orders) {
      const stats = {
        steadfast: { balance: 0, delivered: 0, returned: 0, pending: 0 },
        carrybee: { balance: 0, delivered: 0, returned: 0, pending: 0 },
        redx: { balance: 0, delivered: 0, returned: 0, pending: 0 },
        totalBalance: 0,
        successRate: 0,
        activeShipments: 0
      };

      orders.forEach(o => {
        const note = (o.admin_note || "").toLowerCase();
        const isSteadfast = note.includes("steadfast");
        const isCarrybee = note.includes("carrybee");
        const isRedx = note.includes("redx");

        if (o.status === "shipped") stats.activeShipments++;
        
        if (isSteadfast) {
          if (o.status === "delivered") stats.steadfast.delivered++;
          if (o.status === "cancelled" || o.status === "courier_cancelled") stats.steadfast.returned++;
          if (o.status === "shipped") stats.steadfast.pending++;
        } else if (isCarrybee) {
          if (o.status === "delivered") stats.carrybee.delivered++;
          if (o.status === "cancelled" || o.status === "courier_cancelled") stats.carrybee.returned++;
          if (o.status === "shipped") stats.carrybee.pending++;
        } else if (isRedx) {
          if (o.status === "delivered") stats.redx.delivered++;
          if (o.status === "cancelled" || o.status === "courier_cancelled") stats.redx.returned++;
          if (o.status === "shipped") stats.redx.pending++;
        }
      });

      const totalDelivered = stats.steadfast.delivered + stats.carrybee.delivered + stats.redx.delivered;
      const totalReturned = stats.steadfast.returned + stats.carrybee.returned + stats.redx.returned;
      stats.successRate = totalDelivered > 0 ? Number((totalDelivered / (totalDelivered + totalReturned) * 100).toFixed(1)) : 0;

      setDeliveryStats(stats as any);
    }
    setLoading(false);
  };

  useEffect(() => { calculateStats(); }, []);

  const TABS = [
    { id: "steadfast", label: "Steadfast", icon: Package },
    { id: "redx", label: "RedX", icon: Zap },
    { id: "carrybee", label: "Carrybee", icon: Activity },
    { id: "intelligence", label: language === 'bn' ? "ইন্টেলিজেন্স" : "Intelligence", icon: ShieldCheck },
    { id: "settings", label: language === 'bn' ? "সেটিংস" : "Settings", icon: Settings }
  ];

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner - Signature Style */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Logistics Command 🚛</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Network Synchronized
              </div>
            </div>
            <p className="text-sm text-white/70">Orchestrate carrier integrations, monitor delivery yields, and manage protocols.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={calculateStats} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
             <button className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg">
                <ShieldAlert size={14}/> Protocol Hub
             </button>
          </div>
        </div>
      </div>

      {/* Logistics KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Delivery Success Yield", value: `${deliveryStats.successRate}%`, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
          { label: "Available Liquidity", value: `৳${deliveryStats.totalBalance.toLocaleString()}`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Operations", value: deliveryStats.activeShipments, icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Matrix */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-1 shadow-sm flex flex-wrap gap-1">
         {TABS.map((tab) => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
               ${activeTab === tab.id 
                 ? "bg-primary text-white shadow-lg shadow-primary/20" 
                 : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
               }`}
           >
             <tab.icon size={14} />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Main Content Node */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-10 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "steadfast" && (
            <motion.div key="steadfast" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-600/20">S</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Steadfast Courier</h3>
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-xl bg-primary animate-pulse" /> Active Node Integration
                    </div>
                  </div>
                </div>
                <a href="https://steadfast.com.bd/panel" target="_blank" className="flex items-center gap-2 px-5 h-11 bg-slate-50 dark:bg-white/5 text-[9px] font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                  Global Panel <ExternalLink size={12} />
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner group">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Delivered Assets</p>
                       <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{deliveryStats.steadfast.delivered}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Return Leakage</p>
                       <p className="text-3xl font-black text-rose-500 tracking-tighter">{deliveryStats.steadfast.returned}</p>
                    </div>
                 </div>

                 <div className="p-8 rounded-xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-xl blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10 space-y-4">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Liquid Settlement</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black tracking-tighter text-primary">৳{deliveryStats.steadfast.balance.toLocaleString()}</span>
                          <span className="text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Live</span>
                       </div>
                       <button className="flex items-center gap-2 text-[9px] font-black text-white/60 uppercase tracking-[0.2em] hover:text-white transition-all">
                          <RefreshCw size={10} /> Sync Ledger
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "carrybee" && (
            <motion.div key="carrybee" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/20">C</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Carrybee Logistics</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{settings.carrybee_client_id ? "Active Network Integration" : "Offline Integration"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Delivered Assets</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{deliveryStats.carrybee.delivered}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Return Leakage</p>
                    <p className="text-3xl font-black text-rose-500 tracking-tighter">{deliveryStats.carrybee.returned}</p>
                  </div>
                </div>

                <div className="p-8 rounded-xl bg-indigo-950 text-white shadow-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-xl blur-3xl -mr-16 -mt-16" />
                  <div className="relative z-10 space-y-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Liquid Settlement</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tighter text-indigo-400">৳{deliveryStats.carrybee.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "intelligence" && (
            <motion.div key="intelligence" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-2xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">BD Courier Intelligence</h3>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-xl bg-emerald-500 animate-pulse" /> Network Synchronized
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${plan?.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                      {plan?.status || 'Unknown'}
                   </div>
                </div>
              </div>

              {plan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="p-8 rounded-xl bg-slate-900 text-white relative overflow-hidden border border-white/5 shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-xl blur-3xl -mr-16 -mt-16" />
                      <div className="relative z-10 space-y-6">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Current Protocol</p>
                         <h4 className="text-3xl font-black tracking-tighter text-primary">{plan.plan_name}</h4>
                         <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            <div>
                               <p className="text-[8px] font-bold text-white/40 uppercase">Expires At</p>
                               <p className="text-xs font-bold">{plan.expires_at.split(' ')[0]}</p>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div>
                               <p className="text-[8px] font-bold text-white/40 uppercase">Days Left</p>
                               <p className="text-xs font-bold text-primary">{plan.days_remaining} Days</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-8 shadow-sm">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">API Capacity</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.api_calls}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Remaining</p>
                            <p className="text-xl font-black text-primary">{plan.remaining_paid_calls + plan.remaining_free_calls}</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${((plan.remaining_paid_calls + plan.remaining_free_calls) / plan.api_calls) * 100}%` }}
                               className="h-full bg-primary" 
                            />
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase text-center">Payload Threshold: {Math.round(((plan.remaining_paid_calls + plan.remaining_free_calls) / plan.api_calls) * 100)}% Available</p>
                      </div>
                   </div>

                   <div className="p-8 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col justify-between shadow-sm">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={16}/></div>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Advanced Fraud Scoring</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={16}/></div>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Carrier Network Sync</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={16}/></div>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Real-time Risk Metrics</p>
                         </div>
                      </div>
                      <button className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest mt-6 hover:opacity-90 transition-all shadow-lg">
                         Upgrade Plan
                      </button>
                   </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                   <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Intelligence Manifest...</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "redx" && (
            <motion.div key="redx" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-20 text-center">
               <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-6"><Zap size={32} /></div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">RedX Node Standby</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize API matrix in settings to activate node</p>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto py-4">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl"><Settings size={20} /></div>
                  <div>
                     <h3 className="text-lg font-bold">Protocol Settings</h3>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configure Logistics APIs & Manifests</p>
                  </div>
               </div>
               <div className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <CourierSettings settings={settings} onUpdate={handleUpdateSettings} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CourierManagement() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Logistics Array...</p></div>}>
      <CourierManagementContent />
    </Suspense>
  );
}
