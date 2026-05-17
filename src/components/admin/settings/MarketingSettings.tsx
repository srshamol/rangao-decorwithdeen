"use client";

import { 
  Megaphone, Users, Plus, Trash2, Send, Clock, BarChart3, 
  Target, Zap, MessageCircle, Phone, Filter, Tag, Globe, 
  Hash, ShieldCheck, ChevronRight, Edit, Check, CheckCircle2, AlertTriangle, Search, Activity, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { toast } from "sonner";

const SEGMENTS = [
  { id: "vip", label: "VIP Customers", labelBn: "ভিআইপি কাস্টমার", count: 156 },
  { id: "repeat", label: "Repeat Buyers", labelBn: "রিপিট কাস্টমার", count: 482 },
  { id: "churn", label: "At Risk (30d)", labelBn: "ঝুঁকিপূর্ণ (৩০ দিন)", count: 94 },
];

const TAGS = ["{name}", "{order_id}", "{product}", "{price}"];

interface Props {
  data: any;
  integrations: any[];
  onUpdate: (data: any) => void;
}

export function MarketingSettings({ data, integrations, onUpdate }: Props) {
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const [tab, setTab] = useState<"campaigns" | "audience" | "templates" | "analytics">("campaigns");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [editTpl, setEditTpl] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    name: "",
    type: "sms",
    audience: "all",
    message: "",
    schedule: "now"
  });

  const campaigns = data.campaigns || [];
  const templates = data.templates || [];

  const addCampaign = () => {
    if (!draft.name || !draft.message) return toast.error("Please fill all fields");
    const newCampaign = {
      ...draft,
      id: Math.random().toString(36).substr(2, 9),
      status: "scheduled",
      created: new Date().toISOString()
    };
    onUpdate({ ...data, campaigns: [newCampaign, ...campaigns] });
    setShowWizard(false);
    setWizardStep(0);
    setDraft({ name: "", type: "sms", audience: "all", message: "", schedule: "now" });
    toast.success("Campaign initialized successfully");
  };

  const deleteCampaign = (id: string) => onUpdate({ ...data, campaigns: campaigns.filter((c: any) => c.id !== id) });

  const addTemplate = () => {
    const newTpl = { id: Math.random().toString(36).substr(2, 9), name: "New Template", message: "", type: "sms" };
    onUpdate({ ...data, templates: [newTpl, ...templates] });
    setEditTpl(newTpl.id);
  };

  const updateTemplate = (id: string, field: string, value: any) => {
    onUpdate({ ...data, templates: templates.map((t: any) => t.id === id ? { ...t, [field]: value } : t) });
  };

  const deleteTemplate = (id: string) => onUpdate({ ...data, templates: templates.filter((t: any) => t.id !== id) });

  const smsLen = draft.message?.length || 0;
  const isUnicode = /[^\u0000-\u007f]/.test(draft.message || "");
  const limit = isUnicode ? 70 : 160;
  const smsParts = Math.ceil(smsLen / limit) || 1;

  const inputCls = "w-full h-16 px-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="space-y-12">
      {/* Elite Control Panel Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex p-2 bg-slate-100/80 dark:bg-white/[0.03] rounded-xl border border-slate-200/50 dark:border-white/5 w-fit shadow-inner backdrop-blur-xl">
          {[
            { id: "campaigns", label: t("campaigns"), icon: Megaphone },
            { id: "audience", label: t("audience_hub"), icon: Users },
            { id: "templates", label: t("studio"), icon: Tag },
            { id: "analytics", label: t("intelligence"), icon: BarChart3 }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as any); setShowWizard(false); }}
              className={`flex items-center gap-4 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                tab === t.id 
                ? "bg-white dark:bg-white/10 text-emerald-600 shadow-2xl border border-emerald-500/10" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <t.icon size={16} />
              <span className="hidden md:block">{t.label}</span>
            </button>
          ))}
        </div>
        
        {tab === "campaigns" && !showWizard && (
          <button 
            onClick={() => setShowWizard(true)}
            className="h-16 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} /> {t("launch_campaign")}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + (showWizard ? "-wizard" : "")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {/* CAMPAIGNS HUB */}
          {tab === "campaigns" && (
            <div className="space-y-12">
              <AnimatePresence>
                {showWizard && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-2xl space-y-12 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-24 opacity-[0.02] -rotate-12 pointer-events-none">
                       <Megaphone size={400} />
                    </div>

                    {/* Elite Wizard Stepper */}
                    <div className="flex items-center gap-6 max-w-3xl mx-auto relative z-10">
                      {[t("audience"), t("message"), t("preview"), t("publish")].map((s, i) => (
                        <div key={i} className="flex items-center gap-6 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[12px] font-black transition-all ${
                            i <= wizardStep ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                          }`}>
                             {i < wizardStep ? <Check size={20}/> : i+1}
                          </div>
                          <span className={`text-[11px] font-black tracking-widest hidden lg:block ${i <= wizardStep ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{s}</span>
                          {i < 3 && <div className={`flex-1 h-1 rounded-xl ${i < wizardStep ? "bg-emerald-500" : "bg-slate-100 dark:bg-white/5"}`}/>}
                        </div>
                      ))}
                    </div>

                    <div className="max-w-4xl mx-auto relative z-10">
                      {wizardStep === 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("campaign_identity")}</label>
                            <input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder={t("campaign_title_placeholder")} className={inputCls}/>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[{id:"sms",label:t("sms_protocol"),icon:Phone, color: "blue"},{id:"whatsapp",label:t("whatsapp_engine"),icon:MessageCircle, color: "emerald"}].map(t=>(
                              <button 
                                key={t.id} 
                                onClick={()=>setDraft({...draft,type:t.id})} 
                                className={`p-10 rounded-xl border-2 text-left transition-all relative group ${
                                  draft.type===t.id ? `bg-${t.color}-500/5 border-${t.color}-500 shadow-2xl` : `bg-slate-50 dark:bg-white/[0.02] border-transparent hover:border-slate-200 dark:hover:border-white/10`
                                }`}
                              >
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                                  draft.type===t.id ? `bg-${t.color}-500 text-white shadow-xl` : `bg-white dark:bg-white/5 text-slate-400 shadow-inner`
                                }`}>
                                   <t.icon size={28} />
                                </div>
                                <span className={`text-[12px] font-black mt-8 block uppercase tracking-[0.2em] ${draft.type===t.id?"text-slate-900 dark:text-white":"text-slate-400"}`}>{t.label}</span>
                                {draft.type===t.id && <div className="absolute top-8 right-8 w-4 h-4 rounded-xl bg-emerald-500 animate-pulse" />}
                              </button>
                            ))}
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("target_segment")}</label>
                            <div className="relative">
                              <select 
                                value={draft.audience} 
                                onChange={e=>setDraft({...draft,audience:e.target.value})} 
                                className={`${inputCls} appearance-none cursor-pointer pr-16`}
                              >
                                <option value="all">{t("broadcast_all")}</option>
                                {SEGMENTS.map(s=><option key={s.id} value={s.id}>{(bn?s.labelBn:s.label).toUpperCase()} ({s.count} MEMBERS)</option>)}
                              </select>
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl">
                                 <Users size={20} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{t("creative_copy")}</label>
                               <div className="flex items-center gap-6">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{smsLen} / 160 · {smsParts} SEGMENTS</span>
                                  {isUnicode && <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase rounded-xl">UNICODE</span>}
                               </div>
                            </div>
                            <textarea 
                              rows={6} 
                              value={draft.message} 
                              onChange={e=>setDraft({...draft,message:e.target.value})} 
                              placeholder={t("compose_msg_placeholder")} 
                              className="w-full px-8 py-8 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl text-[16px] font-medium resize-none outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
                            />
                          </div>
                          <div className="space-y-6 p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">{t("dynamic_tokens")}</p>
                             <div className="flex flex-wrap gap-4">
                               {TAGS.map(tag=>(
                                 <button 
                                   key={tag} 
                                   onClick={()=>setDraft({...draft,message:(draft.message||"")+tag})} 
                                   className="h-12 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                                 >
                                   {tag}
                                 </button>
                               ))}
                             </div>
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                          <div className="max-w-md mx-auto">
                            {draft.type === "whatsapp" ? (
                              <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl p-8 shadow-2xl relative overflow-hidden border-[8px] border-slate-900 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                   <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg"><Users size={24} /></div>
                                   <div>
                                      <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none">Global Broadcast</p>
                                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Status: Ready</p>
                                   </div>
                                </div>
                                <div className="bg-white dark:bg-[#1f2c34] rounded-xl p-6 shadow-xl relative">
                                  <p className="text-[14px] text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">{draft.message || "Message draft empty..."}</p>
                                  <div className="flex items-center justify-end gap-2 mt-4">
                                     <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">12:00 PM</span>
                                     <CheckCircle2 size={12} className="text-blue-500" />
                                  </div>
                                  <div className="absolute -left-2 top-6 w-5 h-5 bg-white dark:bg-[#1f2c34] rotate-45 rounded-xl" />
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-10 border-[8px] border-slate-900 dark:border-white/10 shadow-2xl">
                                 <div className="space-y-6">
                                    <div className="w-16 h-1.5 rounded-xl bg-slate-300 dark:bg-white/10 mx-auto mb-10" />
                                    <div className="bg-white dark:bg-white/5 rounded-xl p-8 shadow-xl border border-slate-200 dark:border-white/5 relative">
                                       <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Phone size={20} /></div>
                                       <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 ml-6">Secure Message</p>
                                       <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed font-bold">{draft.message || "Draft content..."}</p>
                                    </div>
                                 </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-center gap-8">
                            {[{id:"now",label:t("dispatch_now"), icon: Send},{id:"later",label:t("schedule"), icon: Clock}].map(s=>(
                              <button 
                                key={s.id} 
                                onClick={()=>setDraft({...draft,schedule:s.id})} 
                                className={`flex items-center gap-4 h-16 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                                  draft.schedule===s.id ? "bg-slate-950 dark:bg-white text-white dark:text-slate-900 border-slate-950 dark:border-white shadow-2xl scale-105" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:border-emerald-500/30"
                                }`}
                              >
                                <s.icon size={18} />
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-10">
                          <div className="w-32 h-32 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto shadow-[0_32px_64px_-12px_rgba(16,185,129,0.5)] animate-pulse">
                             <Send size={56} className="text-white"/>
                          </div>
                          <div className="space-y-3">
                             <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t("ready_dispatch")}</h4>
                             <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em]">{draft.name} · PROTOCOL: {t(draft.type + "_protocol").toUpperCase()}</p>
                          </div>
                          <div className="max-w-md mx-auto grid grid-cols-2 gap-6 p-10 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                             <div className="text-left space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Reach</p>
                                <p className="text-xl font-black text-emerald-600">1,240 HEADS</p>
                             </div>
                             <div className="text-right space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Load</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">EST. ৳450.00</p>
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-12 border-t border-slate-100 dark:border-white/5 relative z-10">
                      <button 
                        onClick={()=>{if(wizardStep>0)setWizardStep(wizardStep-1);else setShowWizard(false)}} 
                        className="h-16 px-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        {wizardStep===0?t("abort_wizard"):t("go_back")}
                      </button>
                      <button 
                        onClick={()=>{if(wizardStep<3)setWizardStep(wizardStep+1);else addCampaign()}} 
                        className="h-16 px-16 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95"
                      >
                        {wizardStep===3?t("launch_engine"):t("continue")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campaign Feed Elite */}
              <div className="grid grid-cols-1 gap-8">
                {campaigns.map((c: any, idx: number) => (
                  <motion.div 
                    key={c.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10 group hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5"
                  >
                    <div className="flex items-center gap-10">
                      <div className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6 ${
                        c.type==="whatsapp" ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-blue-500/20"
                      }`}>
                        {c.type==="whatsapp" ? <MessageCircle size={32}/> : <Phone size={32}/>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-6">
                           <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{c.name}</h4>
                           <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                             c.status==="sent" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse"
                           }`}>{c.status}</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{c.type.toUpperCase()} SIGNAL</span>
                           <div className="h-1.5 w-1.5 rounded-xl bg-slate-200 dark:bg-white/10" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">REACH: {c.audience}</span>
                           <div className="h-1.5 w-1.5 rounded-xl bg-slate-200 dark:bg-white/10" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(c.created).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-16 ml-auto">
                       <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivered</p>
                          <p className="text-2xl font-black text-emerald-600 tracking-tighter">88.5%</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI Index</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">12.4x</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <button className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all shadow-inner">
                             <BarChart3 size={20} />
                          </button>
                          <button onClick={()=>deleteCampaign(c.id)} className="w-14 h-14 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-inner">
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIENCE HUB ELITE */}
          {tab === "audience" && (
            <div className="space-y-12">
              <section className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm space-y-12">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Filter size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t("audience_engine")}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">{t("targeting_params")}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[
                    {label:t("purchase_category"), icon: Tag},
                    {label:t("order_volume"), icon: Hash},
                    {label:t("total_revenue"), icon: BarChart3},
                    {label:t("last_activity"), icon: Clock},
                    {label:t("geo_location"), icon: Globe},
                    {label:t("success_index"), icon: ShieldCheck},
                  ].map((f,i)=>(
                    <div key={i} className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-3">
                        <f.icon size={14} className="text-indigo-500" />
                        {f.label}
                      </label>
                      <div className="relative group">
                        <input type="text" className={inputCls} placeholder="ANY VALUE" />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                           <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-8">
                   <button className="h-16 px-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95">
                      {t("generate_segment")}
                   </button>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {SEGMENTS.map((s, idx)=>(
                  <motion.div 
                    key={s.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -12 }}
                    className="p-12 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-10 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                       <Users size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{t("customer_segment")}</p>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{bn?s.labelBn:s.label}</h4>
                    <div className="mt-12 flex items-baseline gap-4">
                       <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{s.count}</p>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("target_cluster")}</p>
                    </div>
                    <div className="mt-8 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden">
                       <motion.div initial={{width: 0}} animate={{width: "70%"}} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* STUDIO TEMPLATES ELITE */}
          {tab === "templates" && (
            <div className="space-y-12">
              <div className="flex justify-between items-center px-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t("content_studio")}</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">{templates.length} {t("active_templates")}</p>
                </div>
                <button 
                  onClick={addTemplate} 
                  className="h-16 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                >
                  <Plus size={20}/> {t("init_template")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {templates.map((t: any, idx: number)=>(
                  <motion.div 
                    key={t.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 shadow-sm group hover:border-emerald-500/30 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-10 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-xl ${
                          t.type==="whatsapp" ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
                        }`}>
                           {t.type==="whatsapp" ? <MessageCircle size={28} /> : <Phone size={28} />}
                        </div>
                        {editTpl===t.id ? (
                           <input 
                             value={t.name} 
                             onChange={e=>updateTemplate(t.id,"name",e.target.value)} 
                             className="h-12 px-6 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-black uppercase outline-none focus:ring-4 focus:ring-emerald-500/10"
                           />
                        ) : (
                           <div>
                              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.type.toUpperCase()} ENGINE</p>
                           </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={()=>setEditTpl(editTpl===t.id?null:t.id)} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-emerald-500 rounded-xl transition-all shadow-inner"><Edit size={18}/></button>
                        <button onClick={()=>{setDraft({...draft,message:t.message});setTab("campaigns");setShowWizard(true);setWizardStep(1)}} className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-inner"><Send size={18}/></button>
                        <button onClick={()=>deleteTemplate(t.id)} className="w-12 h-12 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-inner"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    {editTpl===t.id ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 relative z-10">
                        <div className="relative group">
                          <select 
                            value={t.type} 
                            onChange={e=>updateTemplate(t.id,"type",e.target.value)} 
                            className="w-full h-14 px-6 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase outline-none appearance-none cursor-pointer"
                          >
                             <option value="sms">SMS PROTOCOL</option>
                             <option value="whatsapp">WHATSAPP PROTOCOL</option>
                          </select>
                          <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <textarea 
                          rows={4} 
                          value={t.message} 
                          onChange={e=>updateTemplate(t.id,"message",e.target.value)} 
                          className="w-full px-8 py-6 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-medium resize-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                        />
                        <div className="flex flex-wrap gap-3">
                           {TAGS.map(tag=><button key={tag} onClick={()=>updateTemplate(t.id,"message",(t.message||"")+tag)} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm">{tag}</button>)}
                        </div>
                      </div>
                    ) : (
                       <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 relative z-10">
                          <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">"{t.message || "No content configured."}"</p>
                       </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* INTELLIGENCE ANALYTICS ELITE */}
          {tab === "analytics" && (
            <div className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {[
                  {label:bn?"পাঠানো":"DISPATCHED",val:"1,240",color:"text-blue-600",bg:"bg-blue-500/5", icon: Send},
                  {label:bn?"ডেলিভার্ড":"CONFIRMED",val:"1,180",color:"text-emerald-500",bg:"bg-emerald-500/5", icon: CheckCircle2},
                  {label:bn?"ব্যর্থ":"CRITICAL",val:"60",color:"text-rose-500",bg:"bg-rose-500/5", icon: AlertTriangle},
                  {label:bn?"ক্লিক রেট":"CTR INDEX",val:"18.5%",color:"text-purple-500",bg:"bg-purple-500/5", icon: Activity},
                  {label:bn?"কনভার্শন":"ROI UNIT",val:"4.2%",color:"text-amber-500",bg:"bg-amber-500/5", icon: Zap},
                ].map((s,i)=>(
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-10 rounded-xl border border-slate-200/80 dark:border-white/5 ${s.bg} relative overflow-hidden group hover:scale-105 transition-all shadow-sm`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-150 group-hover:rotate-12 transition-transform">
                       <s.icon size={80} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{s.label}</p>
                    <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <section className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-12 lg:p-16 shadow-sm">
                   <div className="flex items-center justify-between mb-12">
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Delivery Health Index</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Real-time Signal Monitoring</p>
                      </div>
                      <div className="px-6 py-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">OPTIMIZED STATUS</div>
                   </div>
                   <div className="space-y-10">
                     {[
                       {label:"DELIVERED SUCCESS",pct:95,color:"bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"},
                       {label:"RETRY QUEUE",pct:2,color:"bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"},
                       {label:"FAIL LOGS",pct:3,color:"bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"}
                     ].map((r,i)=>(
                       <div key={i} className="space-y-4">
                         <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em]">
                            <span className="text-slate-400">{r.label}</span>
                            <span className="text-slate-900 dark:text-white">{r.pct}%</span>
                         </div>
                         <div className="w-full h-6 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden p-1.5 border border-slate-200 dark:border-white/10 shadow-inner">
                            <motion.div 
                              initial={{width:0}} 
                              animate={{width:`${r.pct}%`}} 
                              transition={{duration:2, ease: "circOut", delay: i*0.2}} 
                              className={`h-full rounded-xl ${r.color}`}
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                </section>

                <div className="space-y-10">
                   <div className="p-12 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                      <div className="absolute bottom-0 right-0 p-16 opacity-10 group-hover:scale-125 transition-transform">
                         <Zap size={160} />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60 mb-3">Attributed Revenue</p>
                      <h4 className="text-4xl font-black tracking-tighter">৳1,45,280.00</h4>
                      <div className="mt-12 pt-10 border-t border-white/10 dark:border-slate-100 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Conversion Lift</span>
                         <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">+12% vs LY</span>
                      </div>
                   </div>
                   <div className="p-12 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl shadow-sm group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                         <MessageCircle size={100} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Top Performing Node</p>
                      <div className="flex items-center gap-6 relative z-10">
                         <div className="w-20 h-20 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]">
                            <MessageCircle size={40} />
                         </div>
                         <div>
                            <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">WhatsApp</h5>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-1">32.4% CTR</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
