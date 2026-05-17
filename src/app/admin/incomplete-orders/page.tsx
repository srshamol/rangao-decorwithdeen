"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { 
  Search, RefreshCw, 
  Phone, Trash2, 
  Clock, User, ShoppingBag, X, 
  MapPin, Sparkles, 
  Calendar, ShieldAlert, Zap, 
  Activity, CheckCircle2, TrendingUp,
  ListFilter, ChevronLeft, ChevronRight, Send, Loader2,
  Mail, MousePointer2, AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLanguage } from "@/lib/language-context";

import { FraudChecker, FraudMiniScore } from "@/components/admin/FraudChecker";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  name: string;
  price: number;
  qty?: number;
  quantity?: number;
  image?: string;
}

interface AbandonedCart {
  id: string;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  items: CartItem[];
  total_amount: number;
  last_active: string;
  created_at: string;
  is_recovered: boolean;
  source_page: string | null;
}

function IncompleteOrdersContent() {
  const { t } = useLanguage();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysIncomplete: 0,
    totalIncomplete: 0,
    abandoned: 0,
    recovered: 0,
    recoveryRate: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const pageSize = 12;

  const fetchStats = async () => {
    const { data: allData } = await supabase.from("abandoned_carts").select("*");
    if (allData) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalAbandoned = allData.length;
      const recovered = allData.filter((c: AbandonedCart) => c.is_recovered).length;
      const totalIncomplete = allData.filter((c: AbandonedCart) => !c.is_recovered).length;
      const todaysIncomplete = allData.filter((c: AbandonedCart) => !c.is_recovered && new Date(c.created_at) >= today).length;
      const recoveryRate = totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0;
      
      setStats({
        todaysIncomplete,
        totalIncomplete,
        abandoned: totalAbandoned,
        recovered,
        recoveryRate
      });
    }
  };

  const fetchCarts = async () => {
    setLoading(true);
    let query = supabase
      .from("abandoned_carts")
      .select("*", { count: "exact" })
      .eq("is_recovered", false)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (searchTerm) {
      query = query.or(`phone.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const now = new Date();
    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte("created_at", today.toISOString());
    } else if (filter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      query = query.gte("created_at", sevenDaysAgo.toISOString());
    } else if (filter === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      query = query.gte("created_at", thirtyDaysAgo.toISOString());
    }

    const { data, count, error } = await query;
    if (error) {
      toast.error("Error fetching carts: " + error.message);
    } else {
      setCarts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCarts();
    fetchStats();
    
    // Real-time updates for abandoned carts
    const channel = supabase.channel('abandoned-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'abandoned_carts' }, () => {
        fetchCarts();
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [page, filter, searchTerm]);

  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    deliveryCharge: 80,
  });
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [fraudCheckPhone, setFraudCheckPhone] = useState("");

  const openFraudCheck = (phone: string) => {
    setFraudCheckPhone(phone);
    setIsFraudModalOpen(true);
  };

  const recoverCart = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setRecoveryForm({
      name: cart.customer_name || "",
      phone: cart.phone || "",
      email: cart.email || "",
      address: cart.address || "",
      district: "",
      deliveryCharge: cart.total_amount >= 3000 ? 0 : 80,
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!recoveryForm.phone) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setIsRecovering(true);
    try {
      if (!selectedCart) return;
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        customer_name: recoveryForm.name || "Unknown",
        phone: recoveryForm.phone,
        address: recoveryForm.address || "Pending",
        district: recoveryForm.district || "Pending",
        items: selectedCart.items as unknown as Json,
        subtotal: selectedCart.total_amount,
        delivery_charge: recoveryForm.deliveryCharge,
        total: selectedCart.total_amount + recoveryForm.deliveryCharge,
        status: "pending",
        payment_method: "cod"
      }).select().single();

      if (orderError) throw orderError;

      if (selectedCart) {
        await supabase.from("abandoned_carts").update({ is_recovered: true }).eq("id", selectedCart.id);
      }

      toast.success(t("order_placed_success"));
      setIsConfirmModalOpen(false);
      fetchCarts();
      fetchStats();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Error creating order: " + msg);
    } finally {
      setIsRecovering(false);
    }
  };

  const dismissCart = async (id: string) => {
    if (confirm(t("confirm_delete"))) {
      const { error } = await supabase.from("abandoned_carts").delete().eq("id", id);
      if (error) toast.error("Error deleting: " + error.message);
      else {
        toast.success(t("delete_success"));
        fetchCarts();
        fetchStats();
      }
    }
  };

  const getStatusDot = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hours > 24) return { color: "bg-rose-500 shadow-rose-500/50", label: t("urgent_old") };
    if (hours > 6) return { color: "bg-gold shadow-gold/50", label: t("medium") };
    return { color: "bg-slate-200 shadow-slate-200/50", label: t("recent") };
  };

  if (loading && carts.length === 0) return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-24 bg-slate-100 dark:bg-white/3 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">{[...Array(5)].map((_,i)=><div key={i} className="h-24 bg-slate-100 dark:bg-white/3 rounded-xl"/>)}</div>
      <div className="h-[600px] bg-slate-100 dark:bg-white/3 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-[#0a3622]/10">
      {/* Header Banner - Standard Green */}
      <div className="bg-primary rounded-xl p-5 text-white relative overflow-hidden shadow-lg" style={{background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 70%), var(--primary)'}}>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-xl blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">{t("incomplete_orders_title")}</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 rounded-xl text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 bg-white/70 rounded-xl animate-pulse" />
                  {stats.totalIncomplete} {t("incomplete")}
                </div>
              </div>
              <p className="text-xs text-white/60 mt-0.5">{t("incomplete_orders_desc")}</p>
            </div>
          </div>
          <button 
            onClick={fetchCarts} 
            className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-semibold flex items-center gap-2 backdrop-blur-sm transition-all border border-white/10"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> {t("refresh_data")}
          </button>
        </div>
      </div>

      {/* KPI Cards - Dashboard Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t("today_incomplete"), value: stats.todaysIncomplete, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: t("total_incomplete"), value: stats.totalIncomplete, icon: ShoppingBag, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: t("abandoned_total"), value: stats.abandoned, icon: Zap, color: "text-slate-500", bg: "bg-slate-500/10" },
          { label: t("recovered_label"), value: stats.recovered, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
          { label: t("recovery_rate"), value: `${stats.recoveryRate.toFixed(1)}%`, icon: TrendingUp, color: "text-gold", bg: "bg-gold/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search - Dashboard Style */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
         <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-1">
            {[
              { id: "all", label: t("all") },
              { id: "today", label: t("today") },
              { id: "7days", label: t("7_days") },
              { id: "30days", label: t("30_days") },
            ].map((f) => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)} 
                className={`px-6 py-2 rounded-xl text-[11px] font-semibold transition-all ${filter === f.id ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {f.label}
              </button>
            ))}
         </div>
         <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t("search_incomplete_placeholder")} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
         </div>
      </div>

      {/* Main Table - Dashboard Style */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-5 text-left w-12 border-b border-slate-100 dark:border-white/5"></th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("time")}</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("customer_label")}</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("product_label")}</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("page_label")}</th>
              <th className="px-6 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {carts.map((cart: AbandonedCart) => {
              const status = getStatusDot(cart.created_at);
              return (
                <tr key={cart.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-5">
                     <div className={`w-2 h-2 rounded-xl ${status.color.split(' ')[0]}`} title={status.label} />
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-xs font-black text-slate-900 dark:text-white">
                       {formatDistanceToNow(new Date(cart.last_active || cart.created_at), { addSuffix: true })}
                     </p>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                       {new Date(cart.created_at).toLocaleDateString('en-GB')}
                     </p>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                         <User size={16} strokeWidth={2.5} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">{cart.phone || t("no_phone")}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-[10px] font-bold text-slate-400">{cart.customer_name || t("unknown_customer")}</p>
                              {cart.phone && (
                                <div className="flex items-center gap-2">
                                  <FraudMiniScore phone={cart.phone} />
                                  <button 
                                    onClick={() => openFraudCheck(cart.phone || "")}
                                    className="p-1 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                                    title="Check Fraud Intelligence"
                                  >
                                    <ShieldAlert size={12} />
                                  </button>
                                </div>
                              )}
                          </div>
                       </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 shrink-0 p-1 group-hover:scale-110 transition-transform">
                          {cart.items?.[0]?.image ? <img src={cart.items[0].image} alt="" className="w-full h-full object-cover rounded-xl" /> : <ShoppingBag size={14} className="m-auto h-full text-slate-200" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[150px] tracking-tight">{cart.items?.[0]?.name || 'No Items'}</p>
                          <p className="text-[10px] font-black text-primary mt-1 tracking-tight">৳{cart.total_amount?.toLocaleString()}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-xl w-fit border border-slate-100 dark:border-white/10">
                        <MapPin size={10} className="text-slate-400" />
                        {(cart.source_page ? cart.source_page.split('/').pop() || 'Home' : 'Direct')}
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={() => dismissCart(cart.id)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-sm" title={t("delete")}>
                          <X size={16} />
                        </button>
                        <button 
                          onClick={() => recoverCart(cart)} 
                          className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                          <Phone size={12} /> {t("contact_action")}
                        </button>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {carts.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5">
               <ShoppingBag size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t("no_incomplete_msg")}</h3>
            <p className="text-sm font-bold text-slate-400 mt-3 tracking-tight">{t("all_clear_msg")}</p>
          </div>
        )}
      </div>

      {/* Pagination - Exact Match to Screenshot Style */}
      <div className="px-10 py-10 flex items-center justify-between mt-4">
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
           {t("page_label")} {page} ({t("total_label")} {totalCount} {t("incomplete")})
         </p>
         <div className="flex items-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button disabled={page * pageSize >= totalCount} onClick={() => setPage(p => p + 1)} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm group">
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>

      {/* Recovery Modal - Premium Style */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[1100px] h-[90vh] p-0 border-none overflow-hidden bg-slate-50 dark:bg-[#0c0c0c] shadow-2xl flex flex-col rounded-xl selection:bg-primary/30">
           <VisuallyHidden><DialogTitle>{t("manual_order_recovery")}</DialogTitle></VisuallyHidden>
           
           {/* Premium Gradient Header */}
           <div className="bg-linear-to-r from-emerald-900 to-emerald-800 p-8 flex justify-between items-center relative overflow-hidden shrink-0 text-white">
              <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-3xl -mr-20" />
              <div className="relative z-10 flex items-center gap-6">
                 <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner">
                    <Sparkles size={32} className="animate-pulse" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{t("convert_order_title")}</h2>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] mt-1">
                       {t("manual_recovery_protocol")}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setIsConfirmModalOpen(false)} 
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
              >
                <X size={24}/>
              </button>
           </div>
           
           <div className="p-12 max-h-[70vh] overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 border-l-4 border-[#0a3622]">{t("customer_info_title")}</h3>
                    <div className="space-y-4">
                       <div className="relative group">
                          <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a3622] transition-colors" />
                          <input type="text" placeholder={t("full_name_label")} value={recoveryForm.name} onChange={(e) => setRecoveryForm({...recoveryForm, name: e.target.value})} className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#0a3622]/5 transition-all shadow-sm" />
                       </div>
                       <div className="relative group">
                          <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a3622] transition-colors" />
                          <input type="text" placeholder={t("phone_number_label")} value={recoveryForm.phone} onChange={(e) => setRecoveryForm({...recoveryForm, phone: e.target.value})} className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#0a3622]/5 transition-all shadow-sm" />
                       </div>
                       <div className="relative group">
                          <MapPin size={18} className="absolute left-6 top-6 text-slate-400 group-focus-within:text-[#0a3622] transition-colors" />
                          <textarea placeholder={t("address_label")} value={recoveryForm.address} onChange={(e) => setRecoveryForm({...recoveryForm, address: e.target.value})} className="w-full h-40 pl-16 pr-8 py-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#0a3622]/5 transition-all resize-none shadow-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="bg-[#0a3622]/3 dark:bg-[#0a3622]/8 rounded-xl p-8 border border-[#0a3622]/10 space-y-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#0a3622]/5 rounded-xl -mr-16 -mb-16 blur-2xl group-hover:bg-[#0a3622]/10 transition-colors" />
                    <h3 className="text-[11px] font-black text-[#0a3622] uppercase tracking-[0.2em]">{t("payment_calc_title")}</h3>
                    <div className="space-y-4 relative z-10">
                       <div className="flex justify-between text-sm">
                          <span className="font-bold text-slate-500">{t("subtotal")}</span>
                          <span className="font-black text-slate-900 dark:text-white tabular-nums">৳{selectedCart?.total_amount?.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-500">{t("delivery_charge")}</span>
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-5 py-2.5 shadow-sm">
                             <span className="text-xs font-black text-slate-300">৳</span>
                             <input type="number" value={recoveryForm.deliveryCharge} onChange={(e) => setRecoveryForm({...recoveryForm, deliveryCharge: Number(e.target.value)})} className="w-20 bg-transparent text-right outline-none font-black text-slate-900 dark:text-white tabular-nums" />
                          </div>
                       </div>
                       <div className="h-px bg-[#0a3622]/10" />
                       <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("total_payable")}</span>
                          <span className="text-4xl font-black text-[#0a3622] tracking-tighter tabular-nums">৳{((selectedCart?.total_amount || 0) + recoveryForm.deliveryCharge).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 border-l-4 border-[#0a3622]">{t("selected_product_title")}</h3>
                 <div className="space-y-4">
                    {selectedCart?.items?.map((item: CartItem, i: number) => (
                      <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-[#0a3622]/20 transition-all">
                        <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 overflow-hidden shrink-0 p-2 shadow-sm group-hover:scale-105 transition-transform">
                           {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" /> : <ShoppingBag className="m-auto h-full text-slate-200 p-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{item.name}</p>
                           <p className="text-xs font-bold text-slate-400 mt-2">{item.qty || item.quantity} x ৳{item.price}</p>
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">৳{(item.price * (Number(item.qty || item.quantity) || 0)).toLocaleString()}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Zap size={64} className="text-[#0a3622]" />
                    </div>
                    <p className="text-[11px] text-[#0a3622] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                       <Zap size={14} fill="currentColor" /> {t("expert_tips_title")}
                    </p>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed relative z-10">
                      {t("expert_tips_desc")}
                    </p>
                 </div>
              </div>
           </div>

           <div className="p-12 border-t border-slate-100 dark:border-white/5 flex justify-end gap-6 bg-slate-50/30 dark:bg-white/1">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-10 py-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all shadow-sm">{t("cancel_btn")}</button>
              <button 
                onClick={handleConfirmOrder} 
                disabled={isRecovering}
                className="px-12 py-5 bg-[#0a3622] text-white rounded-xl text-sm font-black shadow-2xl shadow-[#0a3622]/30 flex items-center gap-4 hover:scale-[1.05] active:scale-[0.95] transition-all"
              >
                {isRecovering ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} 
                {t("confirm_order_btn")}
              </button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Fraud Intelligence Modal */}
      <Dialog open={isFraudModalOpen} onOpenChange={setIsFraudModalOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[1200px] h-[90vh] p-0 border-none overflow-hidden bg-white dark:bg-[#0c0c0c] rounded-xl shadow-2xl flex flex-col">
          <VisuallyHidden><DialogTitle>Fraud Intelligence Verification</DialogTitle></VisuallyHidden>
          <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                   <ShieldAlert size={20} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-white uppercase tracking-widest">{t("fraud_intel_title")}</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">{t("real_time_security_check")}</p>
                </div>
             </div>
             <button onClick={() => setIsFraudModalOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all">
                <X size={20} />
             </button>
          </div>
          <div className="flex-1 overflow-hidden">
             <FraudChecker phone={fraudCheckPhone} onClose={() => setIsFraudModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function IncompleteOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <IncompleteOrdersContent />
    </Suspense>
  );
}
