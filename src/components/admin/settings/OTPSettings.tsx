"use client";

import { useState } from "react";
import { Smartphone, Lock, ShieldCheck, Zap, Fingerprint, Check, ChevronRight, ChevronDown, Type, Info, MessageSquare, Key, Send, Clock, Hash, Plus, Trash2, Wallet, RefreshCcw, Shield, ShieldAlert, Target, Bell, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

const SMS_PROVIDERS = [
  { id: "bulksmsbd", label: "BulkSMSBD" },
  { id: "ssl", label: "SSL Wireless" },
  { id: "mim", label: "MiM SMS" },
  { id: "twilio", label: "Twilio" },
];

interface Props {
  settings: any;
  integrations: any[];
  onUpdate: (data: any) => void;
  onUpdateIntegrations?: (data: any[]) => void;
}

export function OTPSettings({ settings, integrations, onUpdate, onUpdateIntegrations }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const upd = (f: string, v: any) => onUpdate({ [f]: v });
  const updPopup = (f: string, v: any) => onUpdate({ popup: { ...settings.popup, [f]: v } });
  const [section, setSection] = useState<"otp"|"gateway">("otp");
  const [showProviders, setShowProviders] = useState(false);

  const smsGateways = integrations.filter(i => i.category === 'sms');

  const addGateway = (providerId: string) => {
    const provider = SMS_PROVIDERS.find(p => p.id === providerId);
    if (!provider || !onUpdateIntegrations) return;
    onUpdateIntegrations([...integrations, {
      id: Math.random().toString(36).substr(2, 9), category: "sms", providerId,
      providerLabel: provider.label, config: { api_key: "", sender_id: "", otp_length: 4, otp_expiry: 5 }, isActive: true
    }]);
    setShowProviders(false);
  };

  const removeGateway = (id: string) => onUpdateIntegrations?.(integrations.filter(i => i.id !== id));
  const updateConfig = (id: string, f: string, v: any) => onUpdateIntegrations?.(integrations.map(i => i.id === id ? { ...i, config: { ...i.config, [f]: v } } : i));
  const toggleActive = (id: string, v: boolean) => onUpdateIntegrations?.(integrations.map(i => i.id === id ? { ...i, isActive: v } : i));

  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Elite Tab Switcher */}
      <div className="flex p-2 bg-slate-100/50 dark:bg-white/[0.03] rounded-xl border border-slate-200/50 dark:border-white/5 w-fit shadow-inner backdrop-blur-xl">
        {[
          { id: "otp" as const, label: bn ? "ভেরিফিকেশন স্টুডিও" : "Verification Studio", icon: Shield },
          { id: "gateway" as const, label: bn ? "SMS গেটওয়ে" : "SMS Hub", icon: MessageSquare, count: smsGateways.length },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setSection(t.id)} 
            className={`flex items-center gap-4 px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
              section === t.id 
              ? "bg-white dark:bg-white/10 text-emerald-600 shadow-2xl border border-emerald-500/10" 
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <t.icon size={16} /> 
            {t.label} 
            {t.count !== undefined && <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[9px] font-black ml-2 shadow-lg shadow-emerald-500/20">{t.count}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={section} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }} 
          className="space-y-12"
        >
          {section === "otp" && (
            <div className="space-y-12">
              {/* OTP Mode Selection Elite */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-xl blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center gap-8 mb-16 relative z-10">
                  <div className="w-20 h-20 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner group">
                    <Lock size={40} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {bn ? "ভেরিফিকেশন প্রোটোকল" : "Verification Protocol"}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{bn ? "অর্ডার অথেনটিকেশন লেভেল সেট করুন" : "Order Authentication Framework"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {[
                    { id: "disabled", label: bn ? "বন্ধ" : "Disabled", desc: bn ? "কোনো যাচাই করা হবে না" : "No verification layer", icon: Zap, color: "slate" },
                    { id: "all", label: bn ? "সর্বোচ্চ সুরক্ষা" : "High Security", desc: bn ? "সব অর্ডারে OTP যাচাই" : "Mandatory for all hits", icon: ShieldCheck, color: "emerald" },
                    { id: "conditional", label: bn ? "স্মার্ট ফিল্টার" : "Smart Filter", desc: bn ? "সাকসেস রেট ভিত্তিক" : "Adaptive risk scanning", icon: Fingerprint, color: "amber" }
                  ].map(mode => (
                    <button 
                      key={mode.id}
                      onClick={() => upd("otp_mode", mode.id)}
                      className={`p-10 rounded-xl border transition-all text-left group relative overflow-hidden ${
                        settings.otp_mode === mode.id 
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-2xl scale-105" 
                        : "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 hover:border-emerald-500/30"
                      }`}
                    >
                      {settings.otp_mode === mode.id && (
                        <div className="absolute top-0 right-0 p-8 text-emerald-500 animate-pulse">
                           <ShieldCheck size={40} />
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 shadow-inner ${
                        settings.otp_mode === mode.id ? "bg-white/10 text-white dark:bg-slate-900/10 dark:text-slate-900" : `bg-${mode.color}-500/10 text-${mode.color}-500`
                      }`}>
                        <mode.icon size={28} />
                      </div>
                      <h4 className={`text-xl font-black uppercase tracking-tight mb-2 ${settings.otp_mode === mode.id ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"}`}>
                        {mode.label}
                      </h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${settings.otp_mode === mode.id ? "text-white/60 dark:text-slate-950/60" : "text-slate-400"}`}>
                        {mode.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Conditional Threshold Elite */}
              <AnimatePresence>
                {settings.otp_mode === 'conditional' && (
                  <motion.section 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm"
                  >
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                          <Target size={40} />
                       </div>
                       <div className="flex-1 space-y-6">
                          <div>
                             <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{bn ? "শর্তাধীন ফিল্টার" : "Conditional Threshold"}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Adaptive Security Trigger</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Minimum Success Rate</label>
                                <div className="relative">
                                   <input 
                                      type="number" 
                                      value={settings.otp_threshold || 50} 
                                      onChange={e => upd("otp_threshold", Number(e.target.value))}
                                      className={inputCls}
                                   />
                                   <div className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black">
                                      {settings.otp_threshold}%
                                   </div>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">OTP will be mandatory for users with delivery success rate below this threshold.</p>
                             </div>
                             <div className="flex flex-col justify-center gap-6 p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                   <div className="space-y-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">First Order Advance</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Require payment for 0 history</p>
                                   </div>
                                   <Switch 
                                      checked={settings.first_order_advance !== false} 
                                      onCheckedChange={v => upd("first_order_advance", v)}
                                      className="data-[state=checked]:bg-emerald-600"
                                   />
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-white/5" />
                                <div className="flex items-center justify-between">
                                   <div className="space-y-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">OTP for Low Score</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Trigger OTP for risky users</p>
                                   </div>
                                   <Switch 
                                      checked={settings.otp_low_score !== false} 
                                      onCheckedChange={v => upd("otp_low_score", v)}
                                      className="data-[state=checked]:bg-amber-600"
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 dark:border-white/5 pt-10">
                              <div className="space-y-4">
                                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">OTP Retry Limit</label>
                                 <input 
                                    type="number" 
                                    value={settings.otp_retry_limit || 3} 
                                    onChange={e => upd("otp_retry_limit", Number(e.target.value))}
                                    className={inputCls}
                                 />
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Order will be placed as 'On Hold' after this many failed attempts.</p>
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Manual Review Note Template</label>
                                 <input 
                                    type="text" 
                                    value={settings.hold_note_template || "Failed OTP verification – requires manual review"} 
                                    onChange={e => upd("hold_note_template", e.target.value)}
                                    className={inputCls}
                                 />
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Default note added to orders that fail verification.</p>
                              </div>
                           </div>

                           {/* Added Elite Settings based on new requirements */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 dark:border-white/5 pt-10">
                              <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                   <div className="space-y-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Hold on OTP Failure</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Auto block orders failing verification</p>
                                   </div>
                                   <Switch 
                                      checked={settings.hold_on_failure !== false} 
                                      onCheckedChange={v => upd("hold_on_failure", v)}
                                      className="data-[state=checked]:bg-amber-600"
                                   />
                                </div>
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                   <div className="space-y-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Auto Block COD Risk</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Disable COD for blacklisted users</p>
                                   </div>
                                   <Switch 
                                      checked={settings.auto_block_cod !== false} 
                                      onCheckedChange={v => upd("auto_block_cod", v)}
                                      className="data-[state=checked]:bg-rose-600"
                                   />
                                </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">OTP Delivery Channels</label>
                                    <div className="flex gap-4">
                                       {['SMS', 'WhatsApp', 'Both'].map(channel => (
                                          <button
                                             key={channel}
                                             onClick={() => upd("otp_channel", channel)}
                                             className={`flex-1 h-14 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                (settings.otp_channel || 'SMS') === channel 
                                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" 
                                                : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200"
                                             }`}
                                          >
                                             {channel}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                   <div className="space-y-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Auto Resend OTP</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Trigger auto-resend on timeout</p>
                                   </div>
                                   <Switch 
                                      checked={!!settings.auto_resend} 
                                      onCheckedChange={v => upd("auto_resend", v)}
                                      className="data-[state=checked]:bg-emerald-600"
                                   />
                                </div>
                              </div>
                           </div>

                           {/* Notification & Tab Settings */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 dark:border-white/5 pt-10">
                              <div className="p-8 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10 space-y-6">
                                 <div className="flex items-center gap-4 mb-2">
                                    <Bell size={20} className="text-indigo-600" />
                                    <h5 className="text-[11px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Admin Alerts</h5>
                                 </div>
                                 <div className="space-y-4">
                                    {[
                                       { id: 'notify_dashboard', label: 'Dashboard Alerts' },
                                       { id: 'notify_sms', label: 'SMS Notification' },
                                       { id: 'notify_email', label: 'Email Notification' }
                                    ].map(n => (
                                       <div key={n.id} className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{n.label}</span>
                                          <Switch 
                                             checked={!!settings[n.id]} 
                                             onCheckedChange={v => upd(n.id, v)}
                                             className="data-[state=checked]:bg-indigo-600"
                                          />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="p-8 bg-slate-900 text-white rounded-xl shadow-2xl space-y-6">
                                 <div className="flex items-center gap-4 mb-2">
                                    <ShieldAlert size={20} className="text-amber-400" />
                                    <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Interface Logic</h5>
                                 </div>
                                 <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/5">
                                    <div className="space-y-1">
                                       <p className="text-[11px] font-black text-white uppercase tracking-tight">Enable Risk Orders Tab</p>
                                       <p className="text-[9px] font-medium text-white/50 uppercase tracking-widest">Show dedicated triage view</p>
                                    </div>
                                    <Switch 
                                       checked={settings.show_risk_tab !== false} 
                                       onCheckedChange={v => upd("show_risk_tab", v)}
                                       className="data-[state=checked]:bg-emerald-500"
                                    />
                                 </div>
                                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                    Risk Orders tab allows rapid manual verification of orders that triggered security flags or failed OTP.
                                 </p>
                              </div>
                           </div>
                       </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Popup Experience Hub */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm">
                 <div className="flex items-center gap-8 mb-12">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                       <Smartphone size={28} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">UX Interface Design</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Verification Modal Configuration</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Modal Heading</label>
                       <input type="text" value={settings.popup?.title || ""} onChange={e => updPopup("title", e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Action CTA</label>
                       <input type="text" value={settings.popup?.button || ""} onChange={e => updPopup("button", e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">OTP Placeholder</label>
                       <input type="text" value={settings.popup?.placeholder || ""} onChange={e => updPopup("placeholder", e.target.value)} className={inputCls} />
                    </div>
                 </div>
              </section>
            </div>
          )}

          {section === "gateway" && (
            <div className="space-y-10">
              {/* SMS Gateway Hub Elite */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                          <MessageSquare size={40} />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">SMS Dispatch Hub</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Neural Messaging Infrastructure</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => setShowProviders(!showProviders)}
                       className="h-16 px-10 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                    >
                       <Plus size={18} /> Connect Provider
                    </button>
                 </div>

                 <AnimatePresence>
                    {showProviders && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 mb-12"
                      >
                         {SMS_PROVIDERS.map(p => (
                            <button 
                               key={p.id} 
                               onClick={() => addGateway(p.id)}
                               className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-left hover:border-emerald-500 hover:scale-105 transition-all shadow-sm group"
                            >
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-emerald-500">{p.label}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connect API</p>
                            </button>
                         ))}
                      </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="grid grid-cols-1 gap-10">
                    {smsGateways.map((g: any) => (
                       <motion.div 
                         key={g.id} 
                         layout 
                         className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-12 group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all"
                       >
                          <div className="flex flex-col lg:flex-row gap-16">
                             <div className="lg:w-1/3 space-y-10">
                                <div className="flex items-center gap-6">
                                   <div className="w-16 h-16 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                      <Zap size={32} />
                                   </div>
                                   <div>
                                      <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{g.providerLabel}</h4>
                                      <div className="flex items-center gap-3 mt-2">
                                         <span className={`w-2 h-2 rounded-xl ${g.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{g.isActive ? "Online" : "Standby"}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10">
                                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                                      <Switch 
                                         checked={g.isActive} 
                                         onCheckedChange={v => toggleActive(g.id, v)}
                                         className="data-[state=checked]:bg-emerald-600"
                                      />
                                   </div>
                                   <button 
                                      onClick={() => removeGateway(g.id)}
                                      className="w-full h-16 flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                   >
                                      <Trash2 size={18} /> Disconnect Engine
                                   </button>
                                </div>
                             </div>

                             <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/10">
                                <div className="space-y-4">
                                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">API Key</label>
                                   <div className="relative">
                                      <input 
                                         type="password" 
                                         value={g.config.api_key || ""} 
                                         onChange={e => updateConfig(g.id, "api_key", e.target.value)}
                                         className={inputCls}
                                      />
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                                         <Key size={18} />
                                      </div>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Sender ID / From</label>
                                   <div className="relative">
                                      <input 
                                         type="text" 
                                         value={g.config.sender_id || ""} 
                                         onChange={e => updateConfig(g.id, "sender_id", e.target.value)}
                                         className={inputCls}
                                      />
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                                         <Hash size={18} />
                                      </div>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">OTP Length</label>
                                   <select value={g.config.otp_length || 4} onChange={e => updateConfig(g.id, "otp_length", Number(e.target.value))} className={inputCls}>
                                      {[4,6,8].map(l => <option key={l} value={l}>{l} Digits</option>)}
                                   </select>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Expiry (Minutes)</label>
                                   <input type="number" value={g.config.otp_expiry || 5} onChange={e => updateConfig(g.id, "otp_expiry", Number(e.target.value))} className={inputCls} />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
