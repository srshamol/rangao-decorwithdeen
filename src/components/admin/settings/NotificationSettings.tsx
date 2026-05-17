"use client";

import { Bell, Mail, MessageSquare, AlertTriangle, Settings2, Plus, X, Phone, ShieldCheck, Inbox, ArrowRight, Zap, RefreshCw, BarChart3, Fingerprint, Trash2, Shield, Target, Clock, Globe, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { AdminSettings, CustomerNotification } from "@/types/admin";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function NotificationSettings({ settings, onUpdate }: Props) {
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [activeCategory, setActiveCategory] = useState<"admin" | "customer">("admin");

  const upd = (category: keyof AdminSettings, field: string, value: any) => {
    onUpdate({
      [category]: {
        ...(settings[category] as any),
        [field]: value
      }
    });
  };

  const addAdminContact = (category: keyof AdminSettings, field: string, value: string, setter: (v: string) => void) => {
    if (!value) return;
    const current = (settings[category] as any)[field] || [];
    if (!current.includes(value)) {
      upd(category, field, [...current, value]);
    }
    setter("");
  };

  const removeAdminContact = (category: keyof AdminSettings, field: string, value: string) => {
    const current = (settings[category] as any)[field] || [];
    upd(category, field, current.filter((v: string) => v !== value));
  };

  const updCustomer = (type: string, field: string, value: any) => {
    const currentNotifications = settings.customer_notifications || {};
    const currentConfig = currentNotifications[type] || {
      sms: false,
      email: false,
      template: ""
    } as CustomerNotification;

    onUpdate({
      customer_notifications: {
        ...currentNotifications,
        [type]: {
          ...currentConfig,
          [field]: value
        }
      }
    });
  };

  const customerEvents = [
    { id: "order_placed", label: t("order_placed"), desc: t("order_placed_desc") },
    { id: "order_confirmed", label: t("order_confirmed"), desc: t("order_confirmed_desc") },
    { id: "order_shipped", label: t("order_shipped"), desc: t("order_shipped_desc") },
    { id: "out_for_delivery", label: t("out_for_delivery"), desc: t("out_for_delivery_desc") },
    { id: "order_delivered", label: t("delivered"), desc: t("delivered_desc") },
    { id: "order_cancelled", label: t("cancelled"), desc: t("cancelled_desc") },
  ];

  const inputCls = "w-full min-h-[3.5rem] px-[1.5%] sm:px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[clamp(11px,2.5vw,13px)] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Premium Navigation Hub Elite */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex p-2 bg-slate-100/80 dark:bg-white/[0.03] rounded-xl border border-slate-200/50 dark:border-white/5 w-fit shadow-inner backdrop-blur-xl">
          {[
            { id: "admin", label: t("admin_command"), icon: ShieldCheck },
            { id: "customer", label: t("customer_suite"), icon: MessageSquare }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-4 px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                activeCategory === cat.id 
                ? "bg-white dark:bg-white/10 text-emerald-600 shadow-2xl border border-emerald-500/10" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <cat.icon size={16} className={activeCategory === cat.id ? "animate-pulse" : ""} />
              {cat.label}
              {activeCategory === cat.id && (
                <motion.div layoutId="activeTabGlow" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          ))}
        </div>
        
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
           <div className="w-2 h-2 rounded-xl bg-emerald-500 animate-ping" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Signal Relay Active</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {activeCategory === "admin" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Internal Dashboard Signals */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 lg:p-12 shadow-sm space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Bell size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("internal_signals")}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">{t("dashboard_telemetry")}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Inbox size={24} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("order_notifications")}</p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">{t("new_signal_alerts")}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={!!settings.admin_notifications?.enabled} 
                      onCheckedChange={v => upd("admin_notifications", "enabled", v)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("system_alerts")}</p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">{t("critical_engine_status")}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={!!settings.admin_notifications?.system_alerts} 
                      onCheckedChange={v => upd("admin_notifications", "system_alerts", v)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              </section>

              {/* External Relay (SMS/Email) */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 lg:p-12 shadow-sm space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Target size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("external_relay")}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">{t("multichannel_dispatch")}</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Mail size={18} className="text-blue-500" />
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t("email_distribution")}</span>
                         </div>
                         <Switch 
                            checked={!!settings.admin_notifications?.email_enabled} 
                            onCheckedChange={v => upd("admin_notifications", "email_enabled", v)}
                            className="data-[state=checked]:bg-emerald-600"
                         />
                      </div>
                      <div className="flex gap-3">
                         <input 
                            placeholder="admin@store.com" 
                            value={newEmail} 
                            onChange={e => setNewEmail(e.target.value)} 
                            className={inputCls}
                         />
                         <button 
                            onClick={() => addAdminContact("admin_notifications", "emails", newEmail, setNewEmail)}
                            className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                         >
                            <Plus size={24} />
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {settings.admin_notifications?.emails?.map((email: string) => (
                            <div key={email} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-3 group shadow-sm">
                               <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{email}</span>
                               <button onClick={() => removeAdminContact("admin_notifications", "emails", email)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                  <X size={14} />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Smartphone size={18} className="text-emerald-500" />
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t("sms_dispatch")}</span>
                         </div>
                         <Switch 
                            checked={!!settings.admin_notifications?.sms_enabled} 
                            onCheckedChange={v => upd("admin_notifications", "sms_enabled", v)}
                            className="data-[state=checked]:bg-emerald-600"
                         />
                      </div>
                      <div className="flex gap-3">
                         <input 
                            placeholder="+8801..." 
                            value={newPhone} 
                            onChange={e => setNewPhone(e.target.value)} 
                            className={inputCls}
                         />
                         <button 
                            onClick={() => addAdminContact("admin_notifications", "phones", newPhone, setNewPhone)}
                            className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                         >
                            <Plus size={24} />
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {settings.admin_notifications?.phones?.map((phone: string) => (
                            <div key={phone} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-3 group shadow-sm">
                               <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{phone}</span>
                               <button onClick={() => removeAdminContact("admin_notifications", "phones", phone)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                  <X size={14} />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Customer {t("engagement_suite")} Elite */}
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm">
                 <div className="flex items-center gap-8 mb-16">
                    <div className="w-20 h-20 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                       <MessageSquare size={40} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t("engagement_suite")}</h3>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{t("communication_matrix")}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-10">
                    {customerEvents.map((event, idx) => {
                       const config = settings.customer_notifications?.[event.id] || { sms: false, email: false, template: "" };
                       return (
                          <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-10 group hover:shadow-2xl hover:shadow-emerald-500/5 transition-all"
                          >
                             <div className="flex flex-col lg:flex-row gap-12">
                                <div className="lg:w-1/3 space-y-4">
                                   <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white shadow-xl group-hover:rotate-6 transition-transform">
                                      <Zap size={28} />
                                   </div>
                                   <div>
                                      <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{event.label}</h4>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{event.desc}</p>
                                   </div>
                                </div>

                                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                      <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10">
                                         <div className="flex items-center gap-4">
                                            <Smartphone size={18} className="text-emerald-500" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{t("sms_alert")}</span>
                                         </div>
                                         <Switch 
                                            checked={!!config.sms} 
                                            onCheckedChange={v => updCustomer(event.id, "sms", v)}
                                            className="data-[state=checked]:bg-emerald-600"
                                         />
                                      </div>
                                      <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10">
                                         <div className="flex items-center gap-4">
                                            <Mail size={18} className="text-blue-500" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{t("email_relay")}</span>
                                         </div>
                                         <Switch 
                                            checked={!!config.email} 
                                            onCheckedChange={v => updCustomer(event.id, "email", v)}
                                            className="data-[state=checked]:bg-emerald-600"
                                         />
                                      </div>
                                   </div>
                                   <div className="space-y-4">
                                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("dispatch_template")}</label>
                                      <textarea 
                                         rows={3}
                                         value={config.template || ""}
                                         onChange={e => updCustomer(event.id, "template", e.target.value)}
                                         placeholder={t("message_content_placeholder")}
                                         className={`${inputCls} h-32 py-5 resize-none font-bold`}
                                      />
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                       );
                    })}
                 </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
