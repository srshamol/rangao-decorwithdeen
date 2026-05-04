"use client";

import { Bell, Mail, MessageSquare, AlertTriangle, Settings2, Plus, X, Phone, ShieldCheck, Inbox, ArrowRight } from "lucide-react";
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
  const { t, language } = useLanguage();
  const bn = language === 'bn';
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [activeCategory, setActiveCategory] = useState<"admin" | "customer">("admin");

  const update = (field: keyof AdminSettings, value: any) => onUpdate({ [field]: value });

  const toggleCard = (label: string, desc: string, field: keyof AdminSettings) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-slate-200 dark:hover:border-white/10 transition-all">
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
      <Switch checked={!!settings[field]} onCheckedChange={(v) => update(field, v)} />
    </div>
  );

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

  const inputCls = "w-full h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium";
  const labelCls = "text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1 mb-2 block";

  const customerEvents = [
    { id: "order_placed", label: bn ? "অর্ডার প্লেসড" : "Order Placed", desc: bn ? "অর্ডার করার সাথে সাথে" : "Right after order placement" },
    { id: "order_confirmed", label: bn ? "অর্ডার কনফার্ম" : "Order Confirmed", desc: bn ? "অর্ডার ভেরিফাই করার পর" : "After order verification" },
    { id: "order_shipped", label: bn ? "অর্ডার শিপড" : "Order Shipped", desc: bn ? "কুরিয়ারে হ্যান্ডওভার করলে" : "Handover to courier" },
    { id: "out_for_delivery", label: bn ? "আউট ফর ডেলিভারি" : "Out for Delivery", desc: bn ? "ডেলিভারি রাইডার কল করলে" : "When out with rider" },
    { id: "order_delivered", label: bn ? "ডেলিভারি সাকসেস" : "Delivered", desc: bn ? "পণ্য বুঝে পাওয়ার পর" : "After successful delivery" },
    { id: "order_cancelled", label: bn ? "অর্ডার বাতিল" : "Cancelled", desc: bn ? "অর্ডারটি ক্যানসেল করলে" : "When order is cancelled" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl w-fit border border-slate-200 dark:border-white/5 shadow-sm">
          <button
            onClick={() => setActiveCategory("admin")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === "admin" ? "bg-white dark:bg-slate-800 text-primary shadow-sm shadow-primary/5" : "text-slate-500 hover:text-slate-700"}`}
          >
            {bn ? "অ্যাডমিন নোটিফিকেশন" : "Admin Alerts"}
          </button>
          <button
            onClick={() => setActiveCategory("customer")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === "customer" ? "bg-white dark:bg-slate-800 text-primary shadow-sm shadow-primary/5" : "text-slate-500 hover:text-slate-700"}`}
          >
            {bn ? "কাস্টমার নোটিফিকেশন" : "Customer Alerts"}
          </button>
        </div>

        <Link 
          href="/admin/notifications"
          className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm "
        >
          <Inbox size={14} />
          {bn ? "সব নোটিফিকেশন দেখুন" : "View All Notifications"}
          <ArrowRight size={14} />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {activeCategory === "admin" ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* New Order Alerts */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {bn ? "নতুন অর্ডার অ্যালার্ট" : "New Order Alerts"}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">{bn ? "নতুন অর্ডার আসলে অ্যাডমিনদের যেভাবে জানানো হবে" : "How admins are notified of new incoming orders"}</p>
                  </div>
                </div>
                <Switch 
                  checked={!!settings.order_notifications?.enabled} 
                  onCheckedChange={(v) => upd("order_notifications", "enabled", v)} 
                />
              </div>

              {settings.order_notifications?.enabled && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Admin Emails */}
                    <div className="space-y-4">
                      <label className={labelCls}>{bn ? "অ্যাডমিন ইমেইল লিস্ট" : "Admin Email Registry"}</label>
                      <div className="flex gap-2">
                        <input 
                          type="email" 
                          placeholder="admin@example.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className={inputCls}
                          onKeyDown={(e) => e.key === 'Enter' && addAdminContact("order_notifications", "admin_emails", newEmail, setNewEmail)}
                        />
                        <button 
                          onClick={() => addAdminContact("order_notifications", "admin_emails", newEmail, setNewEmail)}
                          className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.order_notifications?.admin_emails?.map((email: string) => (
                          <div key={email} className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-3 group transition-all hover:border-primary/30">
                            <Mail size={12} className="text-slate-400" />
                            {email}
                            <button onClick={() => removeAdminContact("order_notifications", "admin_emails", email)} className="text-slate-400 hover:text-rose-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Phones */}
                    <div className="space-y-4">
                      <label className={labelCls}>{bn ? "অ্যাডমিন ফোন লিস্ট (SMS)" : "Admin SMS Registry"}</label>
                      <div className="flex gap-2">
                        <input 
                          type="tel" 
                          placeholder="017XXXXXXXX"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className={inputCls}
                          onKeyDown={(e) => e.key === 'Enter' && addAdminContact("order_notifications", "admin_phones", newPhone, setNewPhone)}
                        />
                        <button 
                          onClick={() => addAdminContact("order_notifications", "admin_phones", newPhone, setNewPhone)}
                          className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.order_notifications?.admin_phones?.map((phone: string) => (
                          <div key={phone} className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-3 group transition-all hover:border-primary/30">
                            <Phone size={12} className="text-slate-400" />
                            {phone}
                            <button onClick={() => removeAdminContact("order_notifications", "admin_phones", phone)} className="text-slate-400 hover:text-rose-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-[2rem] flex flex-wrap gap-10">
                    {[
                      { id: "email", label: bn ? "ইমেইল অ্যালার্ট" : "Email Alert", icon: Mail },
                      { id: "sms", label: bn ? "এসএমএস অ্যালার্ট" : "SMS Alert", icon: MessageSquare }
                    ].map((channel) => {
                      const isChecked = settings.order_notifications?.channels?.includes(channel.id);
                      return (
                        <div key={channel.id} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                            <channel.icon size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{channel.label}</p>
                            <Switch 
                              className="mt-2 scale-90"
                              checked={isChecked}
                              onCheckedChange={(v) => {
                                const current = settings.order_notifications?.channels || [];
                                const next = v ? [...current, channel.id] : current.filter((c: string) => c !== channel.id);
                                upd("order_notifications", "channels", next);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center text-gold">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {bn ? "লো স্টক অ্যালার্ট" : "Low Stock Intel"}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">{bn ? "স্টক শেষ হওয়ার আগে স্মার্ট সতর্কবার্তা" : "Predictive alerts before inventory depletion"}</p>
                  </div>
                </div>
                <Switch 
                  checked={!!settings.low_stock_alerts?.enabled} 
                  onCheckedChange={(v) => upd("low_stock_alerts", "enabled", v)} 
                />
              </div>

              {settings.low_stock_alerts?.enabled && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 max-w-sm">
                    <label className={labelCls}>{bn ? "স্টক থ্রেশহোল্ড (সর্বনিম্ন পরিমাণ)" : "Stock Critical Threshold"}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={settings.low_stock_alerts?.threshold || 5}
                        onChange={(e) => upd("low_stock_alerts", "threshold", Number(e.target.value))}
                        className={inputCls}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{bn ? "ইউনিট" : "Units"}</div>
                    </div>
                    <p className="text-[10px] text-slate-400  mt-2">
                      * {bn ? "স্টক এই সংখ্যার নিচে নামলে আপনার ইমেইলে রিপোর্ট যাবে।" : "An automated report will be dispatched once stock falls below this level."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="customer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              {customerEvents.map((event) => {
                const config = (settings.customer_notifications?.[event.id] || {}) as any;
                return (
                  <div key={event.id} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="lg:w-1/3">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{event.label}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{event.desc}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 mt-8 p-6 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Phone size={14} className={config.sms ? "text-primary" : "text-slate-300"} />
                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">SMS Alert</span>
                              </div>
                              <Switch 
                                checked={!!config.sms}
                                onCheckedChange={(v) => updCustomer(event.id, "sms", v)}
                              />
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Mail size={14} className={config.email ? "text-primary" : "text-slate-300"} />
                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Email Alert</span>
                              </div>
                              <Switch 
                                checked={!!config.email}
                                onCheckedChange={(v) => updCustomer(event.id, "email", v)}
                              />
                           </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                           <label className={labelCls}>{bn ? "মেসেজ টেম্পলেট" : "Message Template"}</label>
                           <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <span>Variables: </span>
                              <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">{"{customer_name}"}</code>
                              <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">{"{order_id}"}</code>
                              {event.id === 'order_shipped' && <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">{"{tracking_id}"}</code>}
                           </div>
                        </div>
                        <textarea 
                          value={config.template || ""}
                          onChange={(e) => updCustomer(event.id, "template", e.target.value)}
                          className="w-full h-32 px-6 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner"
                          placeholder={bn ? "এখানে মেসেজ লিখুন..." : "Draft your message here..."}
                        />
                        <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400">
                           <div className="w-1.5 h-1.5 rounded-xl bg-primary" />
                           {(config.template?.length || 0)} {bn ? "অক্ষর" : "Characters"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logic Preview Card */}
      <div className="bg-slate-900 rounded-xl p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-xl blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-1000" />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-primary shadow-inner border border-white/10 rotate-3 group-hover:rotate-0 transition-transform">
            <Settings2 size={40} />
          </div>
          <div className="flex-1">
             <h4 className="text-xl font-black  tracking-tight mb-3">Notification Neural Engine <span className="text-primary text-xs ml-2 uppercase font-black tracking-widest not-">v3.0.1 PRO</span></h4>
             <p className="text-sm text-slate-400 leading-relaxed font-medium">
               {bn ? "নোটিফিকেশন ইঞ্জিন আপনার স্টোরের সব ডেটা রিয়েল-টাইমে প্রসেস করে। এটি আপনার অ্যাডমিন এবং কাস্টমারদের স্মার্ট অ্যালার্ট পাঠায় যাতে কোনো সেলস মিস না হয় এবং কাস্টমার সন্তুষ্টি সর্বোচ্চ থাকে।" 
                  : "Our optimized notification engine processes store events in real-time. It dispatches precise alerts to admins and tailored updates to customers, maximizing conversion rates and post-purchase satisfaction."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
