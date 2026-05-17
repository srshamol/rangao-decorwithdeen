"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  X, Users, MessageSquare, Calendar, ShieldCheck, 
  ChevronRight, ChevronLeft, Upload, Plus, Trash2,
  Ticket, Info, AlertTriangle, Send, Rocket,
  Phone, CheckCircle2, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

interface SMSCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  audienceCounts?: {
    all: number;
    pending: number;
    delivered: number;
    cancelled: number;
    inactive: number;
  };
}

export default function SMSCampaignModal({ isOpen, onClose, audienceCounts }: SMSCampaignModalProps) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [step, setStep] = useState(1);
  
  // Step 1: Audience State
  const [segment, setSegment] = useState("all");
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [filters, setFilters] = useState([{ type: "orders", op: ">=", value: "1" }]);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  
  // Step 2: Message State
  const [message, setMessage] = useState("");
  const [useCoupon, setUseCoupon] = useState(false);
  const [couponType, setCouponType] = useState("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("7");
  
  // Step 3: Schedule State
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const charCount = message.length;
  const smsCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153); // Standard multi-part SMS logic
  
  const insertTag = (tag: string) => {
    setMessage(prev => prev + `[{${tag}}]`);
  };

  const renderedPreview = useMemo(() => {
    if (!message) return "";
    return message
      .replace(/\[\{নাম\}\]/g, "রাহাত খান")
      .replace(/\[\{শহর\}\]/g, "ঢাকা")
      .replace(/\[\{সর্বশেষ_পণ্য\}\]/g, "জায়নামাজ")
      .replace(/\[\{কুপন_কোড\}\]/g, "RAMADAN20");
  }, [message]);

  const steps = [
    { id: 1, title: bn ? "টার্গেট" : "Audience", icon: Users },
    { id: 2, title: bn ? "বার্তা" : "Message", icon: MessageSquare },
    { id: 3, title: bn ? "শিডিউল" : "Schedule", icon: Calendar },
    { id: 4, title: bn ? "নিশ্চিত" : "Confirm", icon: ShieldCheck },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-slate-900 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {bn ? "+ নতুন SMS ক্যাম্পেইন" : "+ New SMS Campaign"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Campaign Orchestration Engine</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="hidden md:flex items-center gap-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-slate-100 dark:bg-white/5 mx-2" />}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* STEP 1: AUDIENCE */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <section className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Users size={24}/>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {bn ? "টার্গেট অডিয়েন্স" : "Target Audience"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{bn ? "আপনার ক্যাম্পেইনের জন্য কাস্টমার সেগমেন্ট সিলেক্ট করুন" : "Select the customer segment for your broadcast"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: "all", label: bn ? "সব কাস্টমার" : "All Customers", count: audienceCounts?.all, color: "bg-blue-50 text-blue-600", icon: Users },
                      { id: "pending", label: bn ? "অর্ডার - নট ডেলিভারড" : "Ordered - Not Delivered", count: audienceCounts?.pending, color: "bg-amber-50 text-gold", icon: Info },
                      { id: "delivered", label: bn ? "ডেলিভারড কাস্টমার" : "Delivered Customers", count: audienceCounts?.delivered, color: "bg-emerald-50 text-primary", icon: CheckCircle2 },
                      { id: "cancelled", label: bn ? "ক্যান্সেলড কাস্টমার" : "Cancelled Orders", count: audienceCounts?.cancelled, color: "bg-rose-50 text-rose-600", icon: X },
                      { id: "inactive", label: bn ? "ইনএকটিভ (৩০+ দিন)" : "Inactive (30+ days)", count: audienceCounts?.inactive, color: "bg-slate-50 text-slate-600", icon: Calendar },
                      { id: "custom", label: bn ? "কাস্টম সেগমেন্ট" : "Custom Segment", count: null, color: "bg-purple-50 text-purple-600", icon: Plus },
                    ].map((opt) => (
                      <label key={opt.id} className={`relative flex flex-col p-6 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none ${segment === opt.id ? 'border-[#0a3622] bg-white' : 'border-slate-50 bg-white dark:bg-white/[0.02] hover:border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opt.color}`}>
                            <opt.icon size={22} />
                          </div>
                          <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${segment === opt.id ? 'border-[#0a3622]' : 'border-slate-200'}`}>
                            {segment === opt.id && <div className="w-3 h-3 bg-[#0a3622] rounded-xl" />}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{opt.label}</span>
                        {opt.count !== null && (
                          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{opt.count}</span>
                        )}
                        <input type="radio" name="segment" className="hidden" checked={segment === opt.id} onChange={() => { setSegment(opt.id); setShowFilterBuilder(opt.id === 'custom'); }} />
                      </label>
                    ))}
                  </div>
                </section>

                {showFilterBuilder && (
                  <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-50/50 dark:bg-white/[0.01] rounded-xl p-10 border border-slate-100 dark:border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Plus size={20}/></div>
                         <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Custom Filter Builder</h4>
                       </div>
                       <button className="px-5 py-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-all shadow-sm flex items-center gap-2">
                         <Plus size={14}/> {bn ? "ফিল্টার যোগ করুন" : "Add Filter"}
                       </button>
                    </div>
                    
                    <div className="space-y-4">
                       {/* Interactive Filter Rows */}
                       {[
                         { label: "অর্ডার সংখ্যা", op: "≥", val: "1", type: "number" },
                         { label: "মোট খরচ", op: "≥", val: "500", type: "currency" },
                         { label: "জেলা", type: "multiselect" },
                         { label: "শেষ অর্ডার", op: "Before", val: "2026-04-01", type: "date" }
                       ].map((row, i) => (
                         <div key={i} className="grid grid-cols-12 gap-4 items-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all group">
                            <div className="col-span-3 text-xs font-bold text-slate-500 pl-4">{row.label}</div>
                            
                            {row.type === 'multiselect' ? (
                              <div className="col-span-8 bg-white dark:bg-slate-900 rounded-xl h-14 border border-slate-100 dark:border-white/10 flex items-center px-5 shadow-sm group-hover:border-[#0a3622]/20 transition-all">
                                 <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {['ঢাকা', 'চট্টগ্রাম'].map(d => (
                                      <span key={d} className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-xl text-[10px] font-bold flex items-center gap-2">
                                        {d} <X size={12} className="cursor-pointer hover:text-rose-500" />
                                      </span>
                                    ))}
                                    <input type="text" placeholder="..." className="bg-transparent border-none outline-none text-xs font-bold w-20" />
                                 </div>
                              </div>
                            ) : (
                              <>
                                <select className="col-span-2 bg-white dark:bg-slate-900 rounded-xl h-14 border border-slate-100 dark:border-white/10 px-5 text-xs font-bold outline-none shadow-sm group-hover:border-[#0a3622]/20 transition-all">
                                   <option>{row.op || '≥'}</option>
                                   <option>{row.op === 'Before' ? 'After' : '≤'}</option>
                                </select>
                                <div className="col-span-6 relative">
                                   {row.type === 'currency' && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>}
                                   <input 
                                     type={row.type === 'currency' ? 'number' : row.type} 
                                     defaultValue={row.val}
                                     className={`w-full bg-white dark:bg-slate-900 rounded-xl h-14 border border-slate-100 dark:border-white/10 ${row.type === 'currency' ? 'pl-10' : 'px-5'} pr-5 text-xs font-bold outline-none shadow-sm group-hover:border-[#0a3622]/20 transition-all`} 
                                   />
                                </div>
                              </>
                            )}
                            <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.section>
                )}

                <section className="p-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/[0.01] text-center group hover:border-[#0a3622]/30 transition-all">
                   <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-2 transition-transform">
                      <Upload size={32} className="text-[#0a3622]" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{bn ? "কাস্টম নম্বর ইমপোর্ট" : "Custom Audience Import"}</h4>
                   <p className="text-xs text-slate-400 mb-8 max-w-sm mx-auto">{bn ? "আপনার নিজের CSV ফাইল আপলোড করুন (column: phone_number)" : "Upload your own CSV payload with verified phone tokens"}</p>
                   <button className="px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:border-[#0a3622] hover:text-[#0a3622] transition-all shadow-sm">Select CSV File</button>
                </section>
              </motion.div>
            )}

            {/* STEP 2: MESSAGE */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <section className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare size={24}/>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {bn ? "বার্তা ও পার্সোনালাইজেশন" : "Message & Personalization"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{bn ? "আপনার কাস্টমারদের জন্য আকর্ষণীয় বার্তা লিখুন" : "Draft a compelling broadcast message for your audience"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "টেমপ্লেট" : "Saved Templates"}</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {['Write New', 'Ramadan Offer', 'Abandoned Cart'].map((t, i) => (
                         <div key={i} className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${i === 0 ? 'border-[#0a3622] bg-[#0a3622]/5' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                            <p className="text-xs font-bold text-slate-800">{t}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{i === 0 ? 'Active Editor' : 'Click to Load'}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bn ? "বার্তা" : "Broadcast Signal"}</label>
                       <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-sm ${smsCount > 1 ? 'bg-amber-50 text-gold border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                          {charCount}/160 {bn ? "অক্ষর" : "Chars"} ({smsCount} {bn ? "টি SMS" : "SMS"})
                       </div>
                    </div>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      className="w-full p-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-base font-bold  outline-none focus:ring-8 focus:ring-[#0a3622]/5 transition-all resize-none shadow-inner no-scrollbar leading-relaxed"
                      placeholder={bn ? "এখানে আপনার বার্তা লিখুন..." : "Your signal payload here..."}
                    />
                    
                    <div className="flex flex-wrap gap-3">
                       {['নাম', 'শহর', 'সর্বশেষ_পণ্য', 'কুপন_কোড'].map(tag => (
                         <button key={tag} onClick={() => insertTag(tag)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-500 hover:border-[#0a3622] hover:text-[#0a3622] transition-all shadow-sm">
                            [{`{${tag}}`}]
                         </button>
                       ))}
                    </div>

                    {smsCount > 1 && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-5 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="text-xs font-bold">{bn ? `${smsCount}টি SMS হবে` : `Warning: ${smsCount} SMS units will be deducted per recipient.`}</p>
                      </motion.div>
                    )}
                  </div>
                </section>

                <section className="bg-white dark:bg-white/[0.02] rounded-xl p-10 border-2 border-emerald-100/50 dark:border-primary/10 shadow-xl shadow-primary/5 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center text-primary"><Ticket size={24}/></div>
                         <div>
                            <h4 className="text-lg font-bold">{bn ? "পার্সোনালাইজড কুপন" : "Auto-Coupon Generation"}</h4>
                            <p className="text-xs text-slate-400">{bn ? "প্রতিটি গ্রাহকের জন্য আলাদা কুপন কোড তৈরি করুন" : "Generate unique, trackable codes for every recipient"}</p>
                         </div>
                      </div>
                      <div onClick={() => setUseCoupon(!useCoupon)} className={`w-14 h-8 rounded-xl p-1.5 transition-all cursor-pointer ${useCoupon ? 'bg-[#0a3622]' : 'bg-slate-200'}`}>
                         <div className={`w-5 h-5 rounded-xl bg-white shadow-md transition-all ${useCoupon ? 'translate-x-6' : ''}`} />
                      </div>
                   </div>
                   
                   {useCoupon && (
                     <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "কুপন টাইপ" : "Logic"}</label>
                           <select className="w-full h-14 px-5 bg-slate-50 dark:bg-white/10 rounded-xl text-xs font-bold outline-none border border-slate-100">
                              <option>% Discount</option>
                              <option>Flat BDT Off</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "পরিমাণ" : "Value"}</label>
                           <input type="number" placeholder="10" className="w-full h-14 px-5 bg-slate-50 dark:bg-white/10 rounded-xl text-xs font-bold outline-none border border-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "মেয়াদ (দিন)" : "Expiry (Days)"}</label>
                           <input type="number" placeholder="7" className="w-full h-14 px-5 bg-slate-50 dark:bg-white/10 rounded-xl text-xs font-bold outline-none border border-slate-100" />
                        </div>
                     </motion.div>
                   )}
                </section>
              </motion.div>
            )}

            {/* STEP 3: SCHEDULE */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <section className="space-y-10">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center text-gold">
                        <Calendar size={24}/>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {bn ? "শিডিউল ও টাইমজোন" : "Schedule & Timezone"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{bn ? "বার্তাটি কখন পাঠানো হবে তা সিলেক্ট করুন" : "Define the exact moment for your broadcast to trigger"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { id: "now", label: bn ? "এখনই পাঠান" : "Instant Broadcast", desc: bn ? "অনুমোদনের পরপরই পাঠানো শুরু হবে" : "Execute immediately upon confirmation", icon: Send, color: "bg-emerald-50 text-primary" },
                      { id: "schedule", label: bn ? "শিডিউল করুন" : "Scheduled Trigger", desc: bn ? "ভবিষ্যতের কোনো সময়ের জন্য" : "Automated trigger at a future timestamp", icon: Calendar, color: "bg-blue-50 text-blue-600" },
                    ].map((opt) => (
                      <label key={opt.id} className={`flex flex-col p-8 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-xl ${scheduleType === opt.id ? 'border-[#0a3622] bg-white' : 'border-slate-50 bg-white dark:bg-white/[0.02] hover:border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                           <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${opt.color}`}>
                              <opt.icon size={28} />
                           </div>
                           <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${scheduleType === opt.id ? 'border-[#0a3622]' : 'border-slate-200'}`}>
                            {scheduleType === opt.id && <div className="w-3 h-3 bg-[#0a3622] rounded-xl" />}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white mb-1">{opt.label}</span>
                        <p className="text-xs font-medium text-slate-400">{opt.desc}</p>
                        <input type="radio" name="schedule" className="hidden" checked={scheduleType === opt.id} onChange={() => setScheduleType(opt.id)} />
                      </label>
                    ))}
                  </div>

                  {scheduleType === "schedule" && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 space-y-8 shadow-inner">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "তারিখ" : "Broadcast Date"}</label>
                             <input type="date" className="w-full h-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#0a3622]/5 transition-all shadow-sm" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "সময়" : "Trigger Time"}</label>
                             <input type="time" className="w-full h-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#0a3622]/5 transition-all shadow-sm" />
                          </div>
                       </div>
                       <div className="flex items-center gap-3 px-6 py-3 bg-[#0a3622]/5 rounded-xl text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] border border-[#0a3622]/10 w-fit mx-auto">
                          <Info size={16}/> Asia/Dhaka Standard Time (GMT+6)
                       </div>
                    </motion.div>
                  )}
                </section>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <section className="space-y-10 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-xl flex items-center justify-center text-primary mx-auto border-2 border-emerald-100 shadow-xl shadow-primary/10">
                    <ShieldCheck size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                      {bn ? "ফাইনাল রিভিউ ও লঞ্চ" : "Final Review & Launch"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">{bn ? "আপনার ক্যাম্পেইনের সকল প্যারামিটার চেক করুন এবং শুরু করুন" : "Verify all broadcast parameters. This action will trigger live billing units."}</p>
                  </div>

                  <div className="bg-[#0a3622] rounded-xl p-12 text-white text-left relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-xl blur-[100px] -mr-40 -mt-40" />
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-xl blur-[80px] -ml-32 -mb-32" />
                     
                     <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                           <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Campaign Manifest</h4>
                           <span className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest">v2.0 Orchestrator</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-12">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">রিসিভার (Target)</p>
                              <p className="text-3xl font-black  tracking-tighter">1,234 <span className="text-xs font-medium opacity-40 font-mono">PERSONS</span></p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">ইউনিট (SMS Units)</p>
                              <p className="text-3xl font-black  tracking-tighter">{(1234 * smsCount).toLocaleString()} <span className="text-xs font-medium opacity-40 font-mono">EST. ৳{(1234 * smsCount * 0.5).toFixed(2)}</span></p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">শিডিউল (Launch)</p>
                              <p className="text-3xl font-black  tracking-tighter text-emerald-400 uppercase">{scheduleType === 'now' ? 'Instant' : 'Deferred'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">গেটওয়ে (Node)</p>
                              <p className="text-3xl font-black  tracking-tighter uppercase">Infobip Prime</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-rose-50 rounded-xl border border-rose-100 text-rose-600 text-left">
                     <AlertTriangle size={24} className="shrink-0" />
                     <p className="text-xs font-bold leading-relaxed">{bn ? "অ্যাকশনটি অপরিবর্তনীয়। নিশ্চিত করার পর ক্যাম্পেইনটি গেটওয়েতে পাঠানো হবে এবং আপনার ব্যালেন্স থেকে চার্জ কাটা হবে।" : "This action is final. Approved campaigns are dispatched to the gateway nodes immediately and deducted from credits."}</p>
                  </div>
                </section>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar Preview Area */}
        <div className="hidden lg:flex w-[400px] border-l border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                {step === 1 ? <Users size={14}/> : <Phone size={14}/>} 
                {step === 1 ? (bn ? "অডিয়েন্স প্রিভিউ" : "Audience Preview") : (bn ? "SMS প্রিভিউ" : "SMS Preview")}
             </h4>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{bn ? "মোট রিসিভার" : "Total Receivers"}</p>
                   <p className="text-3xl font-black text-primary  tracking-tighter">1,234</p>
                </div>
                <div className="space-y-3">
                   {[
                     { label: bn ? "বৈধ নম্বর" : "Valid Tokens", val: "1,234", color: "text-primary" },
                     { label: bn ? "ডুপ্লিকেট বাদ" : "Duplicates Removed", val: "12", color: "text-gold" },
                     { label: bn ? "অপ্টি-আউট বাদ" : "Opt-out Filter", val: "5", color: "text-rose-500" }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.val}</span>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="relative mx-auto w-[240px] h-[480px] bg-slate-900 rounded-xl border-8 border-slate-800 shadow-2xl p-4 pt-12 overflow-hidden flex flex-col">
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-xl" />
                 
                 <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-xl bg-slate-300" />
                       <div className="h-2 w-12 bg-slate-300 rounded-xl" />
                    </div>
                    
                    <div className="self-start max-w-[85%] bg-white dark:bg-slate-900 rounded-xl rounded-xl p-3 shadow-sm border border-slate-200 dark:border-white/5">
                       <p className="text-[10px] font-medium leading-relaxed text-slate-600 dark:text-slate-300  whitespace-pre-wrap">
                          {renderedPreview || (bn ? "এখানে বার্তা প্রিভিউ হবে..." : "Message signal will preview here...")}
                       </p>
                    </div>
                 </div>

                 <div className="h-10 bg-slate-100/10 mt-auto rounded-xl flex items-center justify-center text-[8px] font-bold text-white/30 uppercase tracking-widest">
                    Messaging Interface
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="h-24 border-t border-slate-100 dark:border-white/5 px-8 flex items-center justify-between bg-white dark:bg-slate-900 relative z-10">
        <button 
          onClick={() => step > 1 && setStep(prev => prev - 1)}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${step === 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-slate-50 dark:bg-white/5 text-slate-600 hover:bg-slate-100'}`}
        >
          <ChevronLeft size={16} /> {bn ? "পিজনে" : "Back"}
        </button>

        {step < 4 ? (
          <button 
            onClick={() => setStep(prev => prev + 1)}
            className="flex items-center gap-2 px-8 py-3 bg-[#0a3622] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3622]/90 shadow-lg shadow-green-900/10 hover:-translate-y-1 transition-all"
          >
            {bn ? "পরবর্তী" : "Continue"} <ChevronRight size={16} />
          </button>
        ) : (
          <button 
            onClick={() => {
              toast.success(bn ? "ক্যাম্পেইন শুরু হয়েছে! 🚀" : "Campaign Initialized! 🚀");
              onClose();
            }}
            className="flex items-center gap-3 px-10 py-4 bg-[#0a3622] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Rocket size={18} /> {bn ? "ক্যাম্পেইন শুরু করুন" : "Initialize Signal"}
          </button>
        )}
      </div>
    </div>
  );
}
