"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Trash2, Pencil, Search, RefreshCw, 
  Tag, Percent, DollarSign, Calendar, Users, 
  Check, X, Copy, Zap, ArrowRight, ShieldCheck, 
  Timer, AlertTriangle, Sparkles, Loader2,
  Ticket, LayoutGrid, ListFilter, MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

function AdminCouponsContent() {
  const { language } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "0",
    max_discount: "",
    expires_at: "",
    usage_limit: "",
    is_active: true
  });

  const loadCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load promotion registry");
    else setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCoupons(); }, []);

  const filtered = useMemo(() => {
    let result = coupons;
    if (searchQuery.trim()) {
      result = result.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [coupons, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: coupons.length,
      active: coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > now)).length,
      expired: coupons.filter(c => c.expires_at && new Date(c.expires_at) < now).length
    };
  }, [coupons]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`, {
      icon: <Copy size={14} className="text-primary" />
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount),
      max_discount: c.max_discount ? String(c.max_discount) : "",
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : "",
      usage_limit: c.usage_limit ? String(c.usage_limit) : "",
      is_active: c.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently deactivate and purge this coupon node?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) {
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Coupon node purged");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("coupons").update({ is_active: !currentStatus }).eq("id", id);
    if (!error) {
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      is_active: form.is_active
    };

    let error;
    if (editing) {
      const res = await supabase.from("coupons").update(data).eq("id", editing);
      error = res.error;
    } else {
      const res = await supabase.from("coupons").insert(data);
      error = res.error;
    }

    if (error) {
      toast.error("Registry failure: " + error.message);
    } else {
      toast.success("Promotion synchronization successful");
      setShowForm(false);
      loadCoupons();
    }
    setSaving(false);
  };

  if (loading && coupons.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Promotion Ledger...</p>
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
              <h1 className="text-2xl font-bold tracking-tight">Campaign Command 🎫</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                {coupons.length} Active Codes
              </div>
            </div>
            <p className="text-sm text-white/70">Orchestrate promotional incentives and track conversion velocity.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={loadCoupons} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
             <button 
               onClick={() => { setEditing(null); setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", max_discount: "", expires_at: "", usage_limit: "", is_active: true }); setShowForm(true); }}
               className="px-6 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg"
             >
               <Plus size={14} /> Create Coupon
             </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Campaigns", value: stats.active, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { label: "Expired Nodes", value: stats.expired, icon: Timer, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Total Registry", value: stats.total, icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Station */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative group flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by code nomenclature..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div className="flex items-center gap-2 px-4">
             <div className="w-2 h-2 bg-primary rounded-xl animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All campaign nodes active in real-time</span>
          </div>
      </div>

      {/* Coupons Ledger */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Magnitude</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Min Order</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Saturation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Expiry</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">State</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-400 text-xs uppercase tracking-widest">No active promotion nodes found</td></tr>
              ) : (
                filtered.map((c) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isNearExpiry = c.expires_at && !isExpired && (new Date(c.expires_at).getTime() - new Date().getTime()) < 86400000 * 3;
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                               {c.code[0]}
                            </div>
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest">{c.code}</span>
                                  <button onClick={() => handleCopy(c.code)} className="w-6 h-6 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all">
                                     {copiedCode === c.code ? <Check size={12} className="text-primary" /> : <Copy size={12} className="text-slate-300" />}
                                  </button>
                               </div>
                               <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{c.discount_type.replace('_', ' ')}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className="text-xs font-black text-slate-900 dark:text-white">
                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `৳${Number(c.discount_value).toLocaleString()}`}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className="text-[10px] font-bold text-slate-400">৳{Number(c.min_order_amount).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{c.used_count} <span className="text-slate-400 font-bold">/ {c.usage_limit || '∞'}</span></span>
                            <div className="w-16 h-1 bg-slate-100 dark:bg-white/5 rounded-xl mt-1.5 overflow-hidden">
                               <div 
                                 className="h-full bg-primary transition-all duration-1000" 
                                 style={{ width: c.usage_limit ? `${(c.used_count / c.usage_limit) * 100}%` : '20%' }} 
                               />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold ${isExpired ? 'text-rose-500' : (isNearExpiry ? 'text-gold animate-pulse' : 'text-slate-500')}`}>
                               {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Infinite'}
                            </span>
                            {isExpired && <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Deactivated</span>}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <button 
                           onClick={() => handleToggleStatus(c.id, c.is_active)}
                           className={`w-10 h-5 rounded-xl relative transition-all duration-300 ${c.is_active && !isExpired ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-xl transition-all duration-300 ${c.is_active && !isExpired ? 'left-6' : 'left-1'}`} />
                         </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(c)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all"><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Deployment Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] p-0 rounded-xl border-none overflow-hidden bg-white dark:bg-slate-950 shadow-2xl">
          <VisuallyHidden><DialogTitle>Promotion Calibration</DialogTitle></VisuallyHidden>
          
          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                   <Sparkles size={24} />
                </div>
                <div>
                   <h2 className="text-lg font-bold uppercase tracking-tighter">{editing ? 'Edit Campaign Node' : 'Deploy Promotion Node'}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configure tactical customer incentives</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Code</label>
                <input 
                  value={form.code} 
                  onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} 
                  required 
                  className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-lg font-black tracking-[0.2em] outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner placeholder:opacity-30" 
                  placeholder="e.g. RAMADAN25" 
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Magnitude</label>
                   <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex bg-slate-100 dark:bg-white/10 rounded-xl p-1 gap-1">
                         <button type="button" onClick={() => setForm({...form, discount_type: 'percentage'})} className={`p-2 rounded-xl transition-all ${form.discount_type === 'percentage' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-400'}`}><Percent size={14}/></button>
                         <button type="button" onClick={() => setForm({...form, discount_type: 'fixed'})} className={`p-2 rounded-xl transition-all ${form.discount_type === 'fixed' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-400'}`}><DollarSign size={14}/></button>
                      </div>
                      <input 
                        type="number" 
                        value={form.discount_value} 
                        onChange={(e) => setForm({...form, discount_value: e.target.value})} 
                        required 
                        className="w-full h-14 pl-6 pr-20 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-base font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                        placeholder="0" 
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Order Threshold</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input 
                        type="number" 
                        value={form.min_order_amount} 
                        onChange={(e) => setForm({...form, min_order_amount: e.target.value})} 
                        className="w-full h-14 pl-10 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                        placeholder="0" 
                      />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Expiry</label>
                   <div className="relative">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="date" 
                        value={form.expires_at} 
                        onChange={(e) => setForm({...form, expires_at: e.target.value})} 
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usage Saturation Limit</label>
                   <div className="relative">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={form.usage_limit} 
                        onChange={(e) => setForm({...form, usage_limit: e.target.value})} 
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                        placeholder="∞" 
                      />
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                <input 
                  type="checkbox" 
                  id="is_active_form" 
                  checked={form.is_active} 
                  onChange={(e) => setForm({...form, is_active: e.target.checked})} 
                  className="w-6 h-6 rounded-xl accent-primary" 
                />
                <label htmlFor="is_active_form" className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer">Active Lifecycle Status</label>
             </div>

             <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">Abort</button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-[2] h-14 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                   {saving ? <Loader2 className="animate-spin" size={16} /> : (editing ? 'Update Node' : 'Deploy Node')}
                </button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCoupons() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <AdminCouponsContent />
    </Suspense>
  );
}
