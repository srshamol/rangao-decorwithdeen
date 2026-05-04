"use client";
import { useState } from "react";
import { Smartphone, Lock, ShieldCheck, Zap, Fingerprint, Check, ChevronRight, ChevronDown, Type, Info, MessageSquare, Key, Send, Clock, Hash, Plus, Trash2, Wallet } from "lucide-react";
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

  const inputCls = "w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const smsGateways = integrations.filter(i => i.category === 'sms');

  // SMS Gateway management
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

  return (
    <div className="space-y-6">
      {/* Sub-section toggle */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
        {[
          { id: "otp" as const, label: bn ? "OTP যাচাইকরণ" : "OTP Verification", icon: Lock },
          { id: "gateway" as const, label: bn ? "SMS গেটওয়ে" : "SMS Gateways", icon: MessageSquare, count: smsGateways.length },
        ].map(t => (
          <button key={t.id} onClick={() => setSection(t.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${section === t.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
            <t.icon size={14} /> {t.label} {t.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-xl text-[9px] font-bold ${section === t.id ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-white/10 text-slate-500"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {section === "otp" && (
            <div className="space-y-6">
              {/* OTP Mode Selection */}
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center"><Lock size={16} className="text-gold" /></div>
                  <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "ভেরিফিকেশন মোড" : "Verification Mode"}</h3><p className="text-xs text-slate-400">{bn ? "OTP যাচাইকরণ কনফিগার করুন" : "Configure OTP verification"}</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "disabled", label: bn ? "বন্ধ" : "Disabled", desc: bn ? "কোনো যাচাই নেই" : "No verification", icon: Zap },
                    { id: "all", label: bn ? "সবসময়" : "Always On", desc: bn ? "সব অর্ডারে যাচাই" : "Verify all orders", icon: ShieldCheck },
                    { id: "conditional", label: bn ? "শর্তসাপেক্ষ" : "Conditional", desc: bn ? "হিস্টোরি ভিত্তিক" : "History based", icon: Fingerprint }
                  ].map(mode => (
                    <button key={mode.id} onClick={() => upd("mode", mode.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${settings.mode === mode.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:border-slate-200 hover:shadow-md"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <mode.icon size={16} className={settings.mode === mode.id ? "text-white/80" : "text-slate-400"} />
                        <span className="text-sm font-semibold">{mode.label}</span>
                        {settings.mode === mode.id && <Check size={14} className="ml-auto" />}
                      </div>
                      <p className={`text-[11px] ${settings.mode === mode.id ? "text-white/70" : "text-slate-400"}`}>{mode.desc}</p>
                    </button>
                  ))}
                </div>
                {settings.mode === "conditional" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-amber-50 dark:bg-gold/5 border border-amber-200 dark:border-gold/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold text-amber-700 dark:text-amber-400">{bn ? "সাকসেস থ্রেশহোল্ড (%)" : "Success Threshold (%)"}</label>
                      <span className="text-lg font-bold text-gold">{settings.threshold || 50}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={settings.threshold || 50} onChange={e => upd("threshold", Number(e.target.value))} className="w-full h-2 bg-amber-200 dark:bg-gold/20 rounded-xl appearance-none cursor-pointer accent-gold" />
                    <p className="text-[11px] text-gold/70 mt-2">{bn ? "সাকসেস রেট এই থ্রেশহোল্ডের নিচে গেলে OTP সক্রিয় হবে" : "OTP activates when success rate falls below threshold"}</p>
                  </motion.div>
                )}
              </section>

              {/* SMS Template */}
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center"><MessageSquare size={16} className="text-primary" /></div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "SMS টেমপ্লেট" : "SMS Template"}</h3>
                </div>
                <div className="space-y-4">
                  <textarea rows={4} value={settings.template || ""} onChange={e => upd("template", e.target.value)} placeholder={bn ? "আপনার OTP কোড: {otp}..." : "Your OTP code is {otp}..."} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  <div className="flex flex-wrap gap-2">
                    {["{otp}", "{expiry}", "{site_name}"].map(tag => (
                      <button key={tag} onClick={() => upd("template", (settings.template || "") + " " + tag)} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-semibold text-slate-500 border border-slate-200 dark:border-white/10 hover:text-primary hover:border-primary/30 hover:scale-105 active:scale-95 transition-all">{tag}</button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 ml-1">{bn ? "SMS গেটওয়ে" : "SMS Gateway"}</label>
                    <div className="relative">
                      <select value={settings.provider_id || ""} onChange={e => upd("provider_id", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                        <option value="">{bn ? "গেটওয়ে সিলেক্ট করুন" : "Select Gateway"}</option>
                        {smsGateways.map((i: any) => (<option key={i.id} value={i.id}>{i.providerLabel}</option>))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {smsGateways.length === 0 && <p className="text-[11px] text-gold font-medium ml-1">⚠ {bn ? "SMS গেটওয়ে ট্যাবে প্রথমে গেটওয়ে যোগ করুন" : "Add a gateway in the SMS Gateways tab first"}</p>}
                  </div>
                </div>
              </section>

              {/* OTP Popup UI */}
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><Smartphone size={16} className="text-indigo-600" /></div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "OTP পপআপ UI" : "OTP Popup UI"}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { field: "heading", label: bn ? "হেডিং" : "Heading", icon: Type },
                    { field: "subheading", label: bn ? "সাবহেডিং" : "Subheading", icon: Info },
                    { field: "button", label: bn ? "বাটন টেক্সট" : "Button Text", icon: Zap },
                  ].map(f => (
                    <div key={f.field} className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><f.icon size={12} />{f.label}</label>
                      <input type="text" value={settings.popup?.[f.field] || ""} onChange={e => updPopup(f.field, e.target.value)} className={inputCls} />
                    </div>
                  ))}
                </div>
                {/* Live Preview */}
                <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                  <p className="text-[10px] font-medium text-slate-400 mb-3 uppercase tracking-wider">{bn ? "প্রিভিউ" : "Preview"}</p>
                  <div className="max-w-xs mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto"><Lock size={20} className="text-primary"/></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{settings.popup?.heading || (bn ? "নম্বর যাচাই করুন" : "Verify Number")}</h4>
                    <p className="text-[11px] text-slate-400">{settings.popup?.subheading || (bn ? "আপনার ফোনে কোড পাঠানো হয়েছে" : "Code sent to your phone")}</p>
                    <div className="flex gap-2 justify-center">{[1,2,3,4].map(i=><div key={i} className="w-10 h-12 rounded-xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-lg font-bold text-primary">•</div>)}</div>
                    <button className="w-full py-3 bg-primary text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20">{settings.popup?.button || (bn ? "যাচাই করুন" : "Verify")}</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SMS GATEWAY TAB */}
          {section === "gateway" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{smsGateways.length} {bn ? "টি গেটওয়ে কনফিগার করা" : "gateways configured"}</p>
                <div className="relative">
                  <button onClick={() => setShowProviders(!showProviders)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus size={14} /> {bn ? "গেটওয়ে যোগ" : "Add Gateway"}
                  </button>
                  {showProviders && (
                    <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                      {SMS_PROVIDERS.map(p => (
                        <button key={p.id} onClick={() => addGateway(p.id)} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">{p.label}</button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {smsGateways.map((gw, idx) => (
                <motion.div key={gw.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{gw.providerLabel?.slice(0, 2)}</div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{gw.providerLabel}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5"><div className={`w-1.5 h-1.5 rounded-xl ${gw.isActive ? "bg-primary" : "bg-slate-300"}`} /><span className="text-[10px] font-medium text-slate-400">{gw.isActive ? (bn ? "সক্রিয়" : "Active") : (bn ? "নিষ্ক্রিয়" : "Inactive")}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toast.success(bn ? "টেস্ট পালস পাঠানো হয়েছে" : "Test pulse sent")} className="px-3 py-2 bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 rounded-xl hover:text-primary transition-all border border-slate-200 dark:border-white/10 hover:scale-105 active:scale-95"><Send size={12} className="inline mr-1" />{bn ? "টেস্ট" : "Test"}</button>
                      <button onClick={() => toast.info(bn ? "ব্যালেন্স: ৳250" : "Balance: ৳250")} className="px-3 py-2 bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 rounded-xl hover:text-primary transition-all border border-slate-200 dark:border-white/10 hover:scale-105 active:scale-95"><Wallet size={12} className="inline mr-1" />{bn ? "ব্যালেন্স" : "Balance"}</button>
                      <Switch checked={gw.isActive} onCheckedChange={(v) => toggleActive(gw.id, v)} />
                      <button onClick={() => removeGateway(gw.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { f: "api_key", l: "API Key", icon: Key, pw: true },
                      { f: "sender_id", l: bn ? "সেন্ডার ID" : "Sender ID", icon: Send, pw: false },
                      { f: "otp_length", l: bn ? "OTP দৈর্ঘ্য" : "OTP Length", icon: Hash, pw: false },
                      { f: "otp_expiry", l: bn ? "মেয়াদ (মি.)" : "Expiry (min)", icon: Clock, pw: false },
                    ].map(field => (
                      <div key={field.f} className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1"><field.icon size={10} />{field.l}</label>
                        <input type={field.pw ? "password" : field.f.includes("length") || field.f.includes("expiry") ? "number" : "text"} value={gw.config?.[field.f] || ""} onChange={e => updateConfig(gw.id, field.f, e.target.value)} placeholder="..." className="w-full h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {smsGateways.length === 0 && (
                <div className="py-16 bg-slate-50 dark:bg-white/[0.01] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center">
                  <MessageSquare size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400">{bn ? "কোনো SMS গেটওয়ে কনফিগার করা হয়নি" : "No SMS gateways configured"}</p>
                  <p className="text-xs text-slate-300 mt-1">{bn ? "উপরে 'গেটওয়ে যোগ' বাটনে ক্লিক করুন" : "Click 'Add Gateway' above"}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
