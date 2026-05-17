"use client";

import { useState } from "react";
import { 
  Server, Plus, Trash2, ShieldCheck, Ticket, Smartphone, Globe, 
  Lock, Fingerprint, Key, Zap, ShieldAlert, Clock, MousePointer2,
  Bell, Mail, MessageSquare, Flame, Code2, Link, Database, Send, RefreshCw,
  ChevronRight, Type, Info, Check, Percent, Activity, Target, Cpu, Shield, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { Switch } from "@/components/ui/switch";

interface Props {
  integrations: any[];
  coupons: any[];
  blockedData: { 
    ips: { id: string; ip_address: string; reason?: string; created_at?: string }[]; 
    numbers: { id: string; phone_number: string; reason?: string; created_at?: string }[]; 
  };
  advancedSettings: any; // Keep as any for now as it's a large nested object
  onUpdateIntegrations: (data: any[]) => void;
  onUpdateAdvanced: (data: any) => void;
  onRefresh: () => void;
}

const COURIER_PROVIDERS = [
  { id: "redx", label: "RedX Courier", logo: "RX" },
  { id: "steadfast", label: "Steadfast", logo: "SF" },
  { id: "pathao", label: "Pathao", logo: "PH" },
  { id: "carrybee", label: "Carrybee", logo: "CB" },
];

const SMS_PROVIDERS = [
  { id: "bulksmsbd", label: "BulkSMSBD", logo: "BS" },
  { id: "ssl", label: "SSL Wireless", logo: "SSL" },
  { id: "mim", label: "MiM SMS", logo: "MIM" },
  { id: "twilio", label: "Twilio", logo: "TW" },
];

const FRAUD_PROVIDERS = [
  { id: "fraudchecker", label: "Fraudchecker API", logo: "FC" },
];

export function APISettings({ 
  integrations, coupons, blockedData, advancedSettings,
  onUpdateIntegrations, onUpdateAdvanced, onRefresh 
}: Props) {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState("order_logic");

  const addIntegration = (providerId: string, category: string) => {
    const provider = [...COURIER_PROVIDERS, ...SMS_PROVIDERS, ...FRAUD_PROVIDERS].find(p => p.id === providerId);
    if (!provider) return;

    onUpdateIntegrations([...integrations, {
      id: Math.random().toString(36).substr(2, 9),
      category,
      providerId,
      providerLabel: provider.label,
      config: {
        otp_length: 4,
        otp_expiry: 5
      },
      isActive: true
    }]);
  };

  const removeIntegration = (id: string) => {
    onUpdateIntegrations(integrations.filter(i => i.id !== id));
  };

  const updateConfig = (id: string, field: string, value: any) => {
    onUpdateIntegrations(integrations.map(i => i.id === id ? { ...i, config: { ...i.config, [field]: value } } : i));
  };

  const updateAdvanced = (section: string, field: string, value: any) => {
    onUpdateAdvanced({
      ...advancedSettings,
      [section]: {
        ...advancedSettings[section],
        [field]: value
      }
    });
  };

  const updateNestedAdvanced = (section: string, sub: string, field: string, value: any) => {
    onUpdateAdvanced({
      ...advancedSettings,
      [section]: {
        ...advancedSettings[section],
        [sub]: {
          ...advancedSettings[section][sub],
          [field]: value
        }
      }
    });
  };

  const SectionHeader = ({ icon: Icon, title, desc, colorClass }: any) => (
    <div className="flex items-center gap-8 mb-12">
      <div className={`w-20 h-20 rounded-xl ${colorClass} flex items-center justify-center shadow-2xl border border-white/10 group-hover:rotate-12 transition-transform`}>
        <Icon size={40} />
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{title}</h3>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-2">{desc}</p>
      </div>
    </div>
  );

  const inputCls = "w-full min-h-[3.5rem] px-[1.5%] sm:px-8 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[clamp(11px,2.5vw,13px)] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Module Selector - Elite Command Bar */}
      <div className="flex items-center gap-3 p-3 bg-slate-100/50 dark:bg-white/[0.03] rounded-xl border border-slate-200/50 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner backdrop-blur-2xl">
        {[
          { id: "order_logic", label: "Checkout Engine", icon: Zap },
          { id: "otp_config", label: "Auth Protocols", icon: ShieldCheck },
          { id: "coupons", label: "Voucher Core", icon: Ticket },
          { id: "security", label: "Sentinel (Blacklist)", icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-4 px-10 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeSubTab === tab.id 
              ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-105 border border-white/5" 
              : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon size={16} className={activeSubTab === tab.id ? "animate-pulse" : "opacity-40"} />
            {tab.label}
            {activeSubTab === tab.id && (
              <motion.div layoutId="tabGlow" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* 1. ORDER LOGIC ELITE */}
          {activeSubTab === "order_logic" && (
            <div className="space-y-12">
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/[0.02] rounded-xl blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <SectionHeader 
                  icon={ShieldAlert} 
                  title="Checkout Execution" 
                  desc="Filter and secure order signals"
                  colorClass="bg-rose-500/10 text-rose-500"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-10">
                    <div className="flex items-center justify-between p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner group/card hover:border-rose-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner group-hover/card:scale-110 transition-transform">
                          <Target size={28} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Success Filter</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Courier History Analysis</p>
                        </div>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.success_filter_enabled}
                        onCheckedChange={(v) => updateAdvanced("order", "success_filter_enabled", v)}
                        className="data-[state=checked]:bg-rose-600"
                      />
                    </div>

                    <div className={`space-y-10 transition-all duration-700 ${advancedSettings.order?.success_filter_enabled ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-4"}`}>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Minimum Success Threshold (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={advancedSettings.order?.success_threshold || 50}
                            onChange={(e) => updateAdvanced("order", "success_threshold", Number(e.target.value))}
                            className={inputCls}
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 px-4 py-2 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black">{advancedSettings.order?.success_threshold}%</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Interception Redirect URL</label>
                        <div className="relative">
                           <input 
                            type="text" 
                            placeholder="https://..."
                            value={advancedSettings.order?.low_success_redirect || ""}
                            onChange={(e) => updateAdvanced("order", "low_success_redirect", e.target.value)}
                            className={inputCls}
                          />
                          <Link size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                          <Shield size={28} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Block New Signs</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Mandatory verification for new hits</p>
                        </div>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.filter_zero_history}
                        onCheckedChange={(v) => updateAdvanced("order", "filter_zero_history", v)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Activity size={28} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Spam Interceptor</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Rate limiting order dispatch</p>
                        </div>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.filter_rapid_submissions}
                        onCheckedChange={(v) => updateAdvanced("order", "filter_rapid_submissions", v)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    {advancedSettings.order?.filter_rapid_submissions && (
                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Global Cooldown (Sec)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={advancedSettings.order?.min_submission_time || 30}
                            onChange={(e) => updateAdvanced("order", "min_submission_time", Number(e.target.value))}
                            className={inputCls}
                          />
                          <Clock size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-20 pt-20 border-t border-slate-100 dark:border-white/5 relative z-10">
                  <SectionHeader 
                    icon={Cpu} 
                    title="Node Frequency Limits" 
                    desc="Network layer protection matrix"
                    colorClass="bg-indigo-500/10 text-indigo-500"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                      { id: "device", label: "Device Link", sub: "Instance Token", icon: Smartphone },
                      { id: "number", label: "Signal Node", sub: "Msisdn ID", icon: Fingerprint },
                      { id: "ip", label: "Network Node", sub: "IP Protocol", icon: Globe }
                    ].map(limit => (
                      <div key={limit.id} className="p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-10 shadow-sm group/limit hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-500 shadow-inner group-hover/limit:rotate-6 transition-transform">
                                <limit.icon size={24} />
                             </div>
                             <div>
                                <p className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{limit.label}</p>
                                <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">{limit.sub}</p>
                             </div>
                          </div>
                          <Switch 
                            checked={advancedSettings.order?.[`${limit.id}_limit_enabled`]}
                            onCheckedChange={(v) => updateAdvanced("order", `${limit.id}_limit_enabled`, v)}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                        <div className={`space-y-4 transition-all duration-700 ${advancedSettings.order?.[`${limit.id}_limit_enabled`] ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Block Duration (Hrs)</label>
                          <input 
                            type="number" 
                            value={advancedSettings.order?.[`${limit.id}_block_hours`] || 24}
                            onChange={(e) => updateAdvanced("order", `${limit.id}_block_hours`, Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 7. COUPONS ELITE */}
          {activeSubTab === "coupons" && (
            <div className="space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/[0.03] rounded-xl blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                 <SectionHeader 
                    icon={Ticket} 
                    title="Commercial Incentives" 
                    desc="Manage global voucher architecture" 
                    colorClass="bg-purple-500/10 text-purple-500" 
                 />
                 <button onClick={async () => {
                   const code = prompt("Enter incentive code:");
                   if (!code) return;
                   const value = prompt("Enter magnitude:");
                   const type = confirm("Percentage (%) discount? (Cancel for Fixed)") ? "percentage" : "fixed";
                   await supabase.from("coupons").insert({ 
                     code: code.toUpperCase(), 
                     discount_amount: Number(value), 
                     discount_type: type,
                     is_active: true,
                     min_order_amount: 500
                   });
                   onRefresh();
                 }} className="h-20 px-16 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all relative z-10">
                   <Plus size={24} /> Create Core Node
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {coupons.map((c, idx) => (
                  <motion.div 
                    key={c.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-12 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl space-y-10 group shadow-sm hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/[0.02] rounded-xl blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Zap size={32} />
                      </div>
                      <button onClick={async () => {
                        if (confirm("Purge this commercial node?")) {
                          await supabase.from("coupons").delete().eq("id", c.id);
                          onRefresh();
                        }
                      }} className="w-14 h-14 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl flex items-center justify-center">
                         <Trash2 size={24} />
                      </button>
                    </div>

                    <div className="relative z-10">
                      <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{c.code}</p>
                      <p className="text-[11px] text-emerald-500 font-black uppercase mt-4 tracking-[0.4em] animate-pulse">
                         {c.discount_type === 'percentage' ? `${c.discount_amount}% Reduction` : `৳${c.discount_amount} Settlement`}
                      </p>
                    </div>

                    <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60 relative z-10">
                      <span className="flex items-center gap-3"><Database size={14} /> Min: ৳{c.min_order_amount}</span>
                      <span className={c.is_active ? "text-emerald-500" : "text-rose-500"}>{c.is_active ? "LIVE" : "VOIDED"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {coupons.length === 0 && (
                <div className="py-48 bg-slate-50 dark:bg-white/[0.01] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center gap-8 opacity-40">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                      <Ticket size={64} className="text-slate-300" />
                   </div>
                   <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.8em]">No Commercial Nodes Active</p>
                </div>
              )}
            </div>
          )}

          {/* 8. SECURITY ELITE */}
          {activeSubTab === "security" && (
            <div className="space-y-12">
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-950/[0.02] dark:bg-white/[0.02] rounded-xl blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <SectionHeader 
                   icon={Lock} 
                   title="Sentinel Blacklist" 
                   desc="Terminate hostile signal vectors" 
                   colorClass="bg-slate-950 dark:bg-white text-white dark:text-slate-950" 
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-12 relative z-10">
                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-6">
                      <div className="space-y-2">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Blocked Network Vectors (IP)</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-40">Total Lockdown: {blockedData.ips.length}</p>
                      </div>
                      <button onClick={async () => {
                        const ip = prompt("Identify Network Node (IP) for termination:");
                        if (!ip) return;
                        await supabase.from("blocked_ips").insert({ ip_address: ip, reason: "Manual Block" });
                        onRefresh();
                      }} className="h-14 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                         <Plus size={18} /> New Ban
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                      {blockedData.ips.map(item => (
                        <div key={item.id} className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                                 <Globe size={24} />
                              </div>
                              <div>
                                 <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{item.ip_address}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Restricted</p>
                              </div>
                           </div>
                           <button onClick={async () => {
                             if (confirm("Restore this network node?")) {
                               await supabase.from("blocked_ips").delete().eq("id", item.id);
                               onRefresh();
                             }
                           }} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                              <RefreshCw size={20} />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-6">
                      <div className="space-y-2">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Restricted Signal Nodes (Phone)</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-40">Total Lockdown: {blockedData.numbers.length}</p>
                      </div>
                      <button onClick={async () => {
                        const num = prompt("Identify Signal Node (Number) for termination:");
                        if (!num) return;
                        await supabase.from("blocked_numbers").insert({ phone_number: num, reason: "Manual Block" });
                        onRefresh();
                      }} className="h-14 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                         <Plus size={18} /> New Ban
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                      {blockedData.numbers.map(item => (
                        <div key={item.id} className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                                 <Smartphone size={24} />
                              </div>
                              <div>
                                 <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{item.phone_number}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Restricted</p>
                              </div>
                           </div>
                           <button onClick={async () => {
                             if (confirm("Restore this signal node?")) {
                               await supabase.from("blocked_numbers").delete().eq("id", item.id);
                               onRefresh();
                             }
                           }} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                              <RefreshCw size={20} />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-20 pt-16 border-t border-slate-100 dark:border-white/5 flex items-center justify-center relative z-10">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-4 animate-pulse">
                      <ShieldCheck size={18} className="text-emerald-500" /> Sentinel Security Protocol Active
                   </p>
                </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
