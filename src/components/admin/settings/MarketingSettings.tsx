"use client";
import { useState } from "react";
import { Megaphone, Users, FileText, BarChart3, Plus, Trash2, Send, MessageCircle, Phone, Filter, Tag, ChevronRight, Check, Clock, Eye, Edit, Hash, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

interface Props { data: any; integrations: any[]; onUpdate: (d: any) => void; }

const TAGS = ["{customer_name}","{product_name}","{category_name}","{discount_code}","{site_name}","{checkout_url}"];
const SEGMENTS = [
  { id: "high_value", label: "High Value", labelBn: "হাই ভ্যালু", count: 45 },
  { id: "repeat", label: "Repeat Buyers", labelBn: "রিপিট বায়ার", count: 120 },
  { id: "inactive", label: "Inactive", labelBn: "নিষ্ক্রিয়", count: 340 },
];

export function MarketingSettings({ data, integrations, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [tab, setTab] = useState("campaigns");
  const [wizardStep, setWizardStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [draft, setDraft] = useState<any>({ name: "", type: "sms", audience: "all", schedule: "now", message: "" });
  const [editTpl, setEditTpl] = useState<string|null>(null);

  const campaigns = data.campaigns || [];
  const templates = data.templates || [];
  const tabs = [
    { id: "campaigns", label: bn ? "ক্যাম্পেইন" : "Campaigns", icon: Megaphone },
    { id: "audience", label: bn ? "অডিয়েন্স" : "Audience", icon: Users },
    { id: "templates", label: bn ? "টেমপ্লেট" : "Templates", icon: FileText },
    { id: "analytics", label: bn ? "অ্যানালিটিক্স" : "Analytics", icon: BarChart3 },
  ];

  const inputCls = "w-full h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const smsLen = (draft.message || "").length;
  const smsParts = Math.ceil(smsLen / 160) || 1;
  const isUnicode = /[^\x00-\x7F]/.test(draft.message || "");

  const addCampaign = () => {
    const c = { ...draft, id: "c" + Date.now(), status: "draft", created: new Date().toISOString(), stats: { sent: 0, delivered: 0, failed: 0, clicked: 0 } };
    onUpdate({ campaigns: [...campaigns, c] });
    setShowWizard(false); setWizardStep(0); setDraft({ name: "", type: "sms", audience: "all", schedule: "now", message: "" });
    toast.success(bn ? "ক্যাম্পেইন তৈরি হয়েছে" : "Campaign created");
  };

  const deleteCampaign = (id: string) => onUpdate({ campaigns: campaigns.filter((c: any) => c.id !== id) });
  const addTemplate = () => {
    const t = { id: "t" + Date.now(), name: bn ? "নতুন টেমপ্লেট" : "New Template", type: "sms", message: "" };
    onUpdate({ templates: [...templates, t] }); setEditTpl(t.id);
  };
  const updateTemplate = (id: string, f: string, v: string) => onUpdate({ templates: templates.map((t: any) => t.id === id ? { ...t, [f]: v } : t) });
  const deleteTemplate = (id: string) => onUpdate({ templates: templates.filter((t: any) => t.id !== id) });

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* CAMPAIGNS */}
          {tab === "campaigns" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{campaigns.length} {bn ? "টি ক্যাম্পেইন" : "campaigns"}</p>
                <button onClick={() => { setShowWizard(true); setWizardStep(0); }} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90"><Plus size={14} />{bn ? "নতুন ক্যাম্পেইন" : "New Campaign"}</button>
              </div>

              {/* Wizard */}
              {showWizard && (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5">
                  {/* Steps indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    {[bn?"অডিয়েন্স":"Audience", bn?"মেসেজ":"Message", bn?"প্রিভিউ":"Preview", bn?"পাঠান":"Send"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold ${i <= wizardStep ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>{i < wizardStep ? <Check size={12}/> : i+1}</div>
                        <span className={`text-[11px] font-medium ${i <= wizardStep ? "text-slate-700 dark:text-white" : "text-slate-400"}`}>{s}</span>
                        {i < 3 && <div className={`flex-1 h-px ${i < wizardStep ? "bg-primary" : "bg-slate-200 dark:bg-white/10"}`}/>}
                      </div>
                    ))}
                  </div>

                  {wizardStep === 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-xs font-medium text-slate-500">{bn?"ক্যাম্পেইন নাম":"Campaign Name"}</label><input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder={bn?"ক্যাম্পেইনের নাম দিন":"Enter campaign name"} className={inputCls}/></div>
                      <div className="grid grid-cols-2 gap-3">
                        {[{id:"sms",label:"SMS",icon:Phone},{id:"whatsapp",label:"WhatsApp",icon:MessageCircle}].map(t=>(
                          <button key={t.id} onClick={()=>setDraft({...draft,type:t.id})} className={`p-4 rounded-xl border text-left ${draft.type===t.id?"bg-primary text-white border-primary":"bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5"}`}>
                            <t.icon size={16} className={draft.type===t.id?"text-white/80":"text-slate-400"}/><span className="text-xs font-semibold mt-1 block">{t.label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2"><label className="text-xs font-medium text-slate-500">{bn?"অডিয়েন্স":"Audience"}</label>
                        <select value={draft.audience} onChange={e=>setDraft({...draft,audience:e.target.value})} className={inputCls+" appearance-none cursor-pointer"}>
                          <option value="all">{bn?"সব কাস্টমার":"All Customers"} (1,240)</option>
                          {SEGMENTS.map(s=><option key={s.id} value={s.id}>{bn?s.labelBn:s.label} ({s.count})</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-xs font-medium text-slate-500">{bn?"মেসেজ":"Message"}</label>
                        <textarea rows={5} value={draft.message} onChange={e=>setDraft({...draft,message:e.target.value})} placeholder={bn?"আপনার মেসেজ লিখুন...":"Write your message..."} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"/>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TAGS.map(tag=><button key={tag} onClick={()=>setDraft({...draft,message:(draft.message||"")+tag})} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-semibold text-slate-500 hover:text-primary border border-slate-200 dark:border-white/10">{tag}</button>)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>{smsLen} {bn?"অক্ষর":"chars"} · {smsParts} {bn?"পার্ট":"part(s)"}</span>
                        {isUnicode && <span className="text-gold font-medium">⚠ Unicode ({bn?"বাংলা":"Bangla"})</span>}
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      {draft.type === "whatsapp" ? (
                        <div className="max-w-xs mx-auto bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl p-4 shadow-inner">
                          <div className="bg-white dark:bg-[#1f2c34] rounded-xl p-3 shadow-sm"><p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{draft.message || (bn?"মেসেজ প্রিভিউ":"Message preview")}</p><p className="text-[9px] text-slate-400 text-right mt-1">12:00 PM ✓✓</p></div>
                        </div>
                      ) : (
                        <div className="max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border"><p className="text-[10px] font-medium text-slate-500 mb-2">SMS Preview</p><p className="text-xs text-slate-700 dark:text-slate-200">{draft.message || "..."}</p></div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {[{id:"now",label:bn?"এখনই":"Send Now"},{id:"later",label:bn?"পরে":"Schedule"}].map(s=>(
                          <button key={s.id} onClick={()=>setDraft({...draft,schedule:s.id})} className={`p-3 rounded-xl border text-xs font-semibold ${draft.schedule===s.id?"bg-primary text-white border-primary":"bg-slate-50 border-slate-100 dark:border-white/5"}`}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center mx-auto"><Send size={24} className="text-primary"/></div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-white">{bn?"ক্যাম্পেইন পাঠানোর জন্য প্রস্তুত":"Ready to send"}</p>
                      <p className="text-xs text-slate-400">{draft.name} · {draft.type.toUpperCase()}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button onClick={()=>{if(wizardStep>0)setWizardStep(wizardStep-1);else setShowWizard(false)}} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600">{wizardStep===0?(bn?"বাতিল":"Cancel"):(bn?"পিছনে":"Back")}</button>
                    <button onClick={()=>{if(wizardStep<3)setWizardStep(wizardStep+1);else addCampaign()}} className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90">
                      {wizardStep===3?(bn?"পাঠান":"Send Campaign"):(bn?"পরবর্তী":"Next")}
                    </button>
                  </div>
                </div>
              )}

              {/* Campaign list */}
              {campaigns.map((c: any) => (
                <div key={c.id} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.type==="whatsapp"?"bg-emerald-50 dark:bg-primary/10 text-primary":"bg-blue-50 dark:bg-blue-500/10 text-blue-600"}`}>
                      {c.type==="whatsapp"?<MessageCircle size={18}/>:<Phone size={18}/>}
                    </div>
                    <div><p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p><p className="text-[11px] text-slate-400">{c.type.toUpperCase()} · {c.audience}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-xl text-[10px] font-bold ${c.status==="sent"?"bg-emerald-50 text-primary":"bg-amber-50 text-gold"}`}>{c.status}</span>
                    <button onClick={()=>deleteCampaign(c.id)} className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-xl"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
              {campaigns.length===0&&!showWizard&&<div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl"><Megaphone size={32} className="mx-auto text-slate-200 mb-2"/><p className="text-xs text-slate-400">{bn?"কোনো ক্যাম্পেইন নেই":"No campaigns yet"}</p></div>}
            </div>
          )}

          {/* AUDIENCE */}
          {tab === "audience" && (
            <div className="space-y-4">
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5"><div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><Filter size={16} className="text-purple-600"/></div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn?"অডিয়েন্স বিল্ডার":"Audience Builder"}</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {label:bn?"ক্যাটাগরি কিনেছে":"Category Purchased",type:"select"},
                    {label:bn?"অর্ডার সংখ্যা":"Order Count",type:"number"},
                    {label:bn?"মোট খরচ":"Total Spend",type:"number"},
                    {label:bn?"শেষ অর্ডার":"Last Order",type:"date"},
                    {label:bn?"লোকেশন":"Location",type:"text"},
                    {label:bn?"সাকসেস রেট":"Success Rate",type:"number"},
                  ].map((f,i)=>(
                    <div key={i} className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</span>
                      <input type={f.type} className="w-24 h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-primary/20" placeholder="..." />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{bn?"প্রি-বিল্ট সেগমেন্ট":"Pre-built Segments"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SEGMENTS.map(s=>(
                    <div key={s.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">{bn?s.labelBn:s.label}</p>
                      <p className="text-xl font-bold text-primary mt-1">{s.count}</p>
                      <p className="text-[10px] text-slate-400">{bn?"জন কাস্টমার":"customers"}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TEMPLATES */}
          {tab === "templates" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{templates.length} {bn?"টি টেমপ্লেট":"templates"}</p>
                <button onClick={addTemplate} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20"><Plus size={14}/>{bn?"নতুন":"New Template"}</button>
              </div>
              {templates.map((t: any)=>(
                <div key={t.id} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.type==="whatsapp"?"bg-emerald-50 text-primary":"bg-blue-50 text-blue-600"}`}>{t.type.toUpperCase()}</span>
                      {editTpl===t.id ? <input value={t.name} onChange={e=>updateTemplate(t.id,"name",e.target.value)} className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"/> : <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={()=>setEditTpl(editTpl===t.id?null:t.id)} className="p-1.5 hover:bg-slate-50 text-slate-400 rounded-xl"><Edit size={14}/></button>
                      <button onClick={()=>{setDraft({...draft,message:t.message});setTab("campaigns");setShowWizard(true);setWizardStep(1)}} className="p-1.5 hover:bg-primary/10 text-primary rounded-xl"><Send size={14}/></button>
                      <button onClick={()=>deleteTemplate(t.id)} className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-xl"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  {editTpl===t.id ? (
                    <div className="space-y-2">
                      <select value={t.type} onChange={e=>updateTemplate(t.id,"type",e.target.value)} className="h-9 px-2 bg-slate-50 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none"><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select>
                      <textarea rows={4} value={t.message} onChange={e=>updateTemplate(t.id,"message",e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs resize-none outline-none focus:ring-2 focus:ring-primary/20"/>
                      <div className="flex flex-wrap gap-1">{TAGS.map(tag=><button key={tag} onClick={()=>updateTemplate(t.id,"message",(t.message||"")+tag)} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-semibold text-slate-500 hover:text-primary">{tag}</button>)}</div>
                    </div>
                  ) : <p className="text-xs text-slate-500 line-clamp-2">{t.message}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  {label:bn?"পাঠানো":"Sent",val:"1,240",color:"text-blue-600",bg:"bg-blue-50 dark:bg-blue-500/10"},
                  {label:bn?"ডেলিভার্ড":"Delivered",val:"1,180",color:"text-primary",bg:"bg-emerald-50 dark:bg-primary/10"},
                  {label:bn?"ব্যর্থ":"Failed",val:"60",color:"text-rose-600",bg:"bg-rose-50 dark:bg-rose-500/10"},
                  {label:bn?"ক্লিক":"Click Rate",val:"18.5%",color:"text-purple-600",bg:"bg-purple-50 dark:bg-purple-500/10"},
                  {label:bn?"কনভার্শন":"Conversion",val:"4.2%",color:"text-gold",bg:"bg-amber-50 dark:bg-gold/10"},
                ].map((s,i)=>(
                  <div key={i} className={`p-4 rounded-xl border border-slate-200/80 dark:border-white/5 ${s.bg}`}>
                    <p className="text-[10px] font-medium text-slate-500">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color} mt-1`}>{s.val}</p>
                  </div>
                ))}
              </div>
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{bn?"ডেলিভারি রেট":"Delivery Rate"}</h3>
                <div className="space-y-3">
                  {[{label:bn?"ডেলিভার্ড":"Delivered",pct:95,color:"bg-primary"},{label:bn?"পেন্ডিং":"Pending",pct:2,color:"bg-gold"},{label:bn?"ব্যর্থ":"Failed",pct:3,color:"bg-rose-500"}].map((r,i)=>(
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{r.label}</span><span className="font-semibold text-slate-700 dark:text-white">{r.pct}%</span></div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${r.pct}%`}} transition={{duration:1,delay:i*0.2}} className={`h-full rounded-xl ${r.color}`}/></div>
                    </div>
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
