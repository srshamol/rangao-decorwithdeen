"use client";

import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { 
  Star, Trash2, Plus, X, Search, Filter, 
  CheckCircle2, XCircle, MessageSquare, User, 
  Calendar, RefreshCw, LayoutGrid, Eye,
  Activity, Award, Heart, ShieldAlert, Zap,
  Loader2, ArrowRight, MessageCircle, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

interface ReviewForm {
  customer_name: string;
  rating: string;
  comment: string;
  image_url: string;
  product_id: string;
}

const emptyForm: ReviewForm = { customer_name: "", rating: "5", comment: "", image_url: "", product_id: "" };

function AdminReviewsContent() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      supabase.from("reviews").select("*, products(name, name_bn)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, name_bn"),
    ]);
    setReviews(r.data || []);
    setProducts(p.data || []);
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      customer_name: form.customer_name,
      rating: Number(form.rating),
      comment: form.comment || null,
      image_url: form.image_url || null,
      product_id: form.product_id || null,
    });
    
    if (error) {
      toast.error("Failed to inject feedback node");
    } else {
      toast.success("Feedback synthesized successfully");
      setForm(emptyForm);
      setShowForm(false);
      loadReviews();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে এই রিভিউটি মুছে ফেলতে চান?" : "Purge this feedback record?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Failed to purge record");
    else {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Record purged from ledger");
    }
  };

  const stats = useMemo(() => {
    const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";
    const fiveStar = reviews.filter(r => r.rating === 5).length;
    const pending = 0; // Assuming we add a status field later, for now 0
    return { avg, fiveStar, total: reviews.length, pending };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(r => 
      r.customer_name?.toLowerCase().includes(q) || 
      r.comment?.toLowerCase().includes(q) ||
      r.products?.name?.toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  if (loading && reviews.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Feedback Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner - Signature Style */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Reputation Hub ⭐</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Live Sentiment Engine
              </div>
            </div>
            <p className="text-sm text-white/70">Moderate public feedback, analyze sentiment yield, and boost credibility.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={loadReviews} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
             <button 
               onClick={() => { setShowForm(true); setForm(emptyForm); }}
               className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
             >
                <Plus size={14}/> Inject Feedback
             </button>
          </div>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Average Yield", value: stats.avg, icon: Award, color: "text-gold", bg: "bg-gold/10", suffix: "/ 5.0" },
          { label: "Total Feedback", value: stats.total, icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Loyalist Nodes", value: stats.fiveStar, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Trust Index", value: "Optimal", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                 <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                 {stat.suffix && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{stat.suffix}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Density Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-3 shadow-sm flex items-center gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by customer name, product, or keyword..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-12 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                  />
               </div>
               <div className="flex items-center gap-2 px-4 border-l border-slate-100 dark:border-white/5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-xl animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredReviews.length} Records Found</span>
               </div>
            </div>

            <div className="mt-6 space-y-4">
               {filteredReviews.length === 0 ? (
                 <div className="py-20 text-center bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero feedback signals detected in the ledger</p>
                 </div>
               ) : (
                 filteredReviews.map((r) => (
                   <motion.div 
                     key={r.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                   >
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                         <div className="flex gap-6 flex-1">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl font-black text-slate-900 dark:text-white shadow-inner border border-slate-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                               {r.customer_name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 space-y-3">
                               <div className="flex items-center gap-4 flex-wrap">
                                  <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter uppercase">{r.customer_name}</h4>
                                  <div className="flex items-center gap-1 px-2.5 py-1 bg-gold/5 rounded-xl border border-gold/10">
                                     {Array.from({ length: 5 }, (_, i) => (
                                       <Star key={i} size={10} className={`${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-white/5"}`} />
                                     ))}
                                  </div>
                                  {r.products && (
                                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl uppercase tracking-widest border border-primary/20">
                                       {language === 'bn' ? r.products.name_bn || r.products.name : r.products.name}
                                    </span>
                                  )}
                               </div>
                               <p className="text-sm font-bold text-slate-600 dark:text-white/50 leading-relaxed truncate-3-lines">"{r.comment || "No commentary provided."}"</p>
                               <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(r.created_at).toLocaleDateString("en-GB")}</span>
                                  <span className="flex items-center gap-1.5"><ShieldAlert size={12}/> Verified Purchase</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 self-center md:self-start">
                            {r.image_url && (
                               <div className="relative group/img">
                                  <img src={r.image_url} alt="" className="w-20 h-20 rounded-xl object-cover shadow-lg border border-slate-200 dark:border-white/10 group-hover/img:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white"><Eye size={16}/></div>
                               </div>
                            )}
                            <button onClick={() => handleDelete(r.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-500/20">
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </div>
                   </motion.div>
                 ))
               )}
            </div>
         </div>

         {/* Sentiment Distribution */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
               <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Sentiment Density</h3>
               <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                     const count = reviews.filter(r => r.rating === star).length;
                     const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                     return (
                        <div key={star} className="space-y-1.5">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Star size={10} className="fill-amber-400 text-amber-400"/> {star} Star Yield</span>
                              <span className="text-slate-400">{count} Signals</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className={`h-full ${star >= 4 ? 'bg-primary' : (star === 3 ? 'bg-gold' : 'bg-rose-500')}`} 
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            <div className="bg-slate-900 dark:bg-black rounded-xl p-6 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-xl blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center gap-3 relative z-10 mb-6">
                  <Zap size={18} className="text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Publicity Protocol</h3>
               </div>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed mb-6">
                  Reviews are synchronized across the storefront to build conversion momentum. Ensure consistent moderation of high-yield signals.
               </p>
               <button className="w-full h-12 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                  Storefront View
               </button>
            </div>
         </div>
      </div>

      {/* Signal Injection Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-slate-950/60 z-[100] backdrop-blur-md" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white dark:bg-slate-950 z-[110] shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/5"
            >
               <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plus size={20} /></div>
                    <div>
                      <h2 className="text-lg font-bold">Signal Injection</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Synthesize Public Feedback</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Identity</label>
                         <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Enter name..." />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sentiment Scale</label>
                         <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Stars Yield</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Association</label>
                      <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                         <option value="">Select Target Product</option>
                         {products.map(p => <option key={p.id} value={p.id}>{language === 'bn' ? p.name_bn || p.name : p.name}</option>)}
                      </select>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commentary Matrix</label>
                      <textarea rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="w-full p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Synthesize customer commentary..." />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset visualization (URL)</label>
                      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="https://external-resource.png" />
                   </div>

                   <div className="pt-8 sticky bottom-0 bg-white dark:bg-slate-950 pb-4">
                      <button type="submit" disabled={saving} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                         {saving ? "Processing Signal..." : "Inject Feedback Node"}
                      </button>
                   </div>
                </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminReviews() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Reputation Ledger...</p></div>}>
      <AdminReviewsContent />
    </Suspense>
  );
}
