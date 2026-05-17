"use client";

import { useState } from "react";
import { MessageSquare, Plus, Trash2, Key, Send, Clock, Hash, Zap, CheckCircle2, AlertCircle, Wallet, RefreshCcw, ShieldCheck, ChevronDown, Activity, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

const SMS_PROVIDERS = [
  { id: "bulksmsbd", label: "BulkSMSBD", region: "Local" },
  { id: "ssl", label: "SSL Wireless", region: "Local" },
  { id: "mim", label: "MiM SMS", region: "Local" },
  { id: "twilio", label: "Twilio", region: "Global" },
];

interface Props {
  integrations: any[];
  onUpdate: (data: any[]) => void;
}

export function SMSGatewaySettings({ integrations, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [showProviders, setShowProviders] = useState(false);

  const smsGateways = integrations.filter(i => i.category === 'sms');

  const addGateway = (providerId: string) => {
    const provider = SMS_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;
    onUpdate([...integrations, {
      id: Math.random().toString(36).substr(2, 9),
      category: "sms", providerId, providerLabel: provider.label,
      config: { api_key: "", sender_id: "", otp_length: 4, otp_expiry: 5 },
      isActive: true
    }]);
    setShowProviders(false);
  };

  const removeGateway = (id: string) => onUpdate(integrations.filter(i => i.id !== id));
  const updateConfig = (id: string, field: string, value: any) => {
    onUpdate(integrations.map(i => i.id === id ? { ...i, config: { ...i.config, [field]: value } } : i));
  };
  const toggleActive = (id: string, val: boolean) => {
    onUpdate(integrations.map(i => i.id === id ? { ...i, isActive: val } : i));
  };

  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Registry Control Bar Elite */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-950 dark:bg-indigo-600 rounded-xl p-12 lg:p-16 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-indigo-200 shadow-2xl group-hover:rotate-12 transition-transform">
            <Cpu size={48} />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">{bn ? "গেটওয়ে রেজিস্ট্রি" : "Gateway Registry"}</h3>
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.4em] mt-1">
               {smsGateways.length} {bn ? "টি সক্রিয় রুট পাওয়া গেছে" : "active neural pipelines"}
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => setShowProviders(!showProviders)} 
            className="h-16 px-12 bg-white text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus size={20} /> {bn ? "নতুন কানেকশন" : "Initialize Link"}
          </button>
          
          <AnimatePresence>
            {showProviders && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-6 w-80 bg-slate-900 dark:bg-white border border-white/10 dark:border-slate-200 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-20 overflow-hidden py-6"
              >
                <div className="px-8 pb-4 mb-4 border-b border-white/5 dark:border-slate-100">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Protocols</p>
                </div>
                {SMS_PROVIDERS.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addGateway(p.id)} 
                    className="w-full text-left px-8 py-5 flex items-center justify-between group/item hover:bg-white/5 dark:hover:bg-slate-50 transition-all"
                  >
                    <div>
                       <p className="text-[12px] font-black uppercase tracking-tight text-white dark:text-slate-900 group-hover/item:text-indigo-400">{p.label}</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{p.region} Engine</p>
                    </div>
                    <ChevronDown size={14} className="-rotate-90 text-slate-600 opacity-0 group-hover/item:opacity-100 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gateway Grid Elite */}
      <div className="grid grid-cols-1 gap-12">
        {smsGateways.map((gateway, idx) => (
          <motion.div 
            key={gateway.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform">
                <MessageSquare size={200} />
             </div>

             <div className="flex flex-col lg:flex-row gap-20 relative z-10">
                <div className="lg:w-1/3 space-y-12">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform">
                         <Zap size={40} />
                      </div>
                      <div>
                         <h4 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{gateway.providerLabel}</h4>
                         <div className="flex items-center gap-3 mt-2">
                            <div className={`w-2 h-2 rounded-xl ${gateway.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{gateway.isActive ? "Pipeline Secure" : "Link Severed"}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Master Switch</span>
                         <Switch 
                            checked={gateway.isActive} 
                            onCheckedChange={v => toggleActive(gateway.id, v)}
                            className="data-[state=checked]:bg-indigo-600"
                         />
                      </div>
                      <button 
                        onClick={() => removeGateway(gateway.id)}
                        className="w-full h-16 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                      >
                         <Trash2 size={18} /> Purge Connection
                      </button>
                   </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-10 p-12 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Secure API Key</label>
                      <div className="relative">
                         <input 
                            type="password" 
                            value={gateway.config.api_key || ""} 
                            onChange={e => updateConfig(gateway.id, "api_key", e.target.value)}
                            className={inputCls}
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            <Key size={18} />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Dispatch ID / Mask</label>
                      <div className="relative">
                         <input 
                            type="text" 
                            value={gateway.config.sender_id || ""} 
                            onChange={e => updateConfig(gateway.id, "sender_id", e.target.value)}
                            className={inputCls}
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            <Hash size={18} />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Signal Length</label>
                      <select 
                         value={gateway.config.otp_length || 4} 
                         onChange={e => updateConfig(gateway.id, "otp_length", Number(e.target.value))} 
                         className={inputCls}
                      >
                         {[4,6,8].map(l => <option key={l} value={l}>{l} Digits</option>)}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">TTL (Minutes)</label>
                      <div className="relative">
                         <input 
                            type="number" 
                            value={gateway.config.otp_expiry || 5} 
                            onChange={e => updateConfig(gateway.id, "otp_expiry", Number(e.target.value))} 
                            className={inputCls}
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            <Clock size={18} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}

        {smsGateways.length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="py-32 bg-slate-50 dark:bg-white/[0.01] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center"
           >
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-700">
                 <ShieldAlert size={48} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">No Active Pipelines</h4>
              <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
                 Configure an SMS gateway to enable automated order verification and customer engagement signals.
              </p>
           </motion.div>
        )}
      </div>
    </div>
  );
}
