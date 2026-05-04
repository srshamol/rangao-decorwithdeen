"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, Suspense, Fragment } from "react";
import { 
  Search, Download, RefreshCw, 
  Trash2, Phone, MessageSquare, Check, X,
  Printer, CreditCard, MapPin,
  Calendar, Clock, CheckCircle2, Package, Truck, Ban, Eye, User,
  Activity, ListFilter, ChevronDown, Zap, Loader2, Pencil, RotateCcw, FileText, Send, ShieldCheck, Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FraudChecker, FraudMiniScore, FraudSummaryPanel } from "@/components/admin/FraudChecker";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { formatDate, formatOrderDate } from "@/lib/date-utils";

interface OrderItem {
  name: string;
  price: number;
  qty?: number;
  quantity?: number;
  image?: string;
}

interface Order {
  id: string;
  order_number: string | null;
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  items: OrderItem[];
  total: number;
  delivery_charge: number | null;
  status: string;
  payment_method: string | null;
  admin_note: string | null;
  created_at: string;
  courier_name: string | null;
  status_history: { status: string; time: string }[];
}

type StaffRole = 'super_admin' | 'admin' | 'moderator' | 'production';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const bnLocale = language === 'bn';
  
  const STATUS_TABS = [
    { id: "all", label: t("all_orders"), icon: ListFilter, color: "text-slate-500" },
    { id: "pending", label: t("pending"), icon: Clock, color: "text-gold" },
    { id: "confirmed", label: t("confirmed"), icon: CheckCircle2, color: "text-blue-500" },
    { id: "processing", label: t("processing"), icon: Activity, color: "text-purple-500" },
    { id: "shipped", label: t("shipped"), icon: Truck, color: "text-indigo-500" },
    { id: "delivered", label: t("delivered"), icon: Package, color: "text-primary" },
    { id: "cancelled", label: t("cancelled"), icon: Ban, color: "text-rose-500" },
    { id: "return", label: t("returned"), icon: RefreshCw, color: "text-indigo-400" },
    { id: "on_hold", label: t("on_hold"), icon: Pause, color: "text-orange-500" },
  ];
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCourierCenterOpen, setIsCourierCenterOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('steadfast');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    paymentType: 'all',
    courier: 'all'
  });
  const [expandedFraudRows, setExpandedFraudRows] = useState<Set<string>>(new Set());
  const [isFraudCheckOpen, setIsFraudCheckOpen] = useState(false);
  const [selectedPhoneForFraud, setSelectedPhoneForFraud] = useState("");
  const [selectedCourierForOrder, setSelectedCourierForOrder] = useState<string>('steadfast');
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<StaffRole>('production');
  const isProduction = role === 'production';
  const isAdmin = role === 'admin' || role === 'super_admin';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user as SupabaseUser);
        // Hard override for primary owner
        if (session.user.email === 'rangao.bd@gmail.com') {
          setRole('super_admin');
        } else {
          supabase.from('user_roles').select('role').eq('user_id', session.user.id).single().then(({ data }) => {
            if (data) setRole(data.role as StaffRole);
          });
        }
      }
    });
  }, []);

  const logActivity = async (action: string, desc: string) => {
    if (!currentUser) return;
    await supabase.from('staff_activity_logs').insert({
      staff_id: currentUser.id,
      staff_name: currentUser.email?.split('@')[0] || "Unknown",
      role: role,
      action_type: action,
      description: desc,
      ip_address: "Client-side"
    });
  };

  useEffect(() => {
    const handleOpenFraud = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedPhoneForFraud(customEvent.detail);
      setIsFraudCheckOpen(true);
    };
    window.addEventListener('open-fraud-checker', handleOpenFraud);
    return () => window.removeEventListener('open-fraud-checker', handleOpenFraud);
  }, []);

  const currentStatus = searchParams.get('status') || "all";

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(t("failed_load_orders"));
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { 
    loadOrders(); 
    const channel = supabase.channel('order-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const statusCounts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o: Order) => o.status === 'pending').length,
    confirmed: orders.filter((o: Order) => o.status === 'confirmed').length,
    processing: orders.filter((o: Order) => o.status === 'processing').length,
    shipped: orders.filter((o: Order) => o.status === 'shipped').length,
    delivered: orders.filter((o: Order) => o.status === 'delivered').length,
    cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
    return: orders.filter((o: Order) => o.status === 'return').length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (currentStatus !== "all") result = result.filter((o: Order) => o.status === currentStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o: Order) => 
        o.id.toLowerCase().includes(q) || 
        o.customer_name?.toLowerCase().includes(q) || 
        o.phone?.includes(q)
      );
    }
    if (filters.paymentType !== 'all') {
      result = result.filter((o: Order) => o.payment_method?.toLowerCase() === filters.paymentType.toLowerCase());
    }
    if (filters.courier !== 'all') {
      result = result.filter((o: Order) => o.courier_name?.toLowerCase() === filters.courier.toLowerCase());
    }
    
    return result;
  }, [orders, currentStatus, searchQuery, filters]);

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return toast.error(t("select_items"));
    const toastId = toast.loading(t("updating_orders"));
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus } as any)
        .in("id", selectedOrders);
      if (error) throw error;
      toast.success(`${selectedOrders.length} ${t("orders_updated")}`, { id: toastId });
      logActivity('BULK_STATUS_UPDATE', `Updated ${selectedOrders.length} orders to ${newStatus}`);
      setSelectedOrders([]);
      loadOrders();
    } catch (err) {
      const error = err as Error;
      toast.error(t("bulk_update_failure"), { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (!isAdmin) return toast.error(t("manager_role_required"));
    if (selectedOrders.length === 0) return;
    if (confirm(t("confirm_bulk_delete"))) {
      const toastId = toast.loading(t("deleting_orders"));
      const { error } = await supabase.from("orders").delete().in("id", selectedOrders);
      if (!error) {
        toast.success(t("orders_deleted"), { id: toastId });
        logActivity('BULK_DELETE', `Deleted ${selectedOrders.length} orders`);
        setSelectedOrders([]);
        loadOrders();
      } else {
        toast.error(t("delete_failure"), { id: toastId });
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const currentOrder = orders.find(o => o.id === id);
      
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          admin_note: adminNote 
        } as any)
        .eq("id", id);
      
      if (error) throw error;

      toast.success(t("order_status_success"));
      logActivity('STATUS_UPDATE', `Order #${id.split('-')[0].toUpperCase()} updated to ${newStatus}`);
      loadOrders();
      setConfirmOrder(null);
      setCancelOrder(null);
      setAdminNote("");
      setViewOrder(null);
    } catch (err) {
      const error = err as Error;
      toast.error(t("update_failure") + ": " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!isAdmin) return toast.error(t("manager_role_required"));
    if (confirm(t("delete_order_confirm"))) {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (!error) {
        toast.success(t("order_deleted_success"));
        logActivity('DELETE_ORDER', `Deleted order #${id.split('-')[0]}`);
        loadOrders();
      } else {
        toast.error(t("delete_failed"));
      }
    }
  };

  const recoverOrder = async (id: string) => {
    await handleStatusUpdate(id, 'pending');
    toast.success(t("order_recovered_success"));
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) throw error;
      toast.success(t("order_update_success"));
      loadOrders();
    } catch (err) {
      const error = err as Error;
      toast.error(t("update_failure") + ": " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Phone", "Total", "Status", "District", "Payment"];
    const rows = filteredOrders.map((o: Order) => [o.id, new Date(o.created_at).toLocaleString(), o.customer_name, o.phone, o.total, o.status, o.district, o.payment_method]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: (string | number | null)[]) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-gold dark:bg-gold/10';
      case 'confirmed': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10';
      case 'processing': return 'bg-purple-50 text-purple-600 dark:bg-purple-500/10';
      case 'shipped': return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10';
      case 'delivered': return 'bg-emerald-50 text-primary dark:bg-primary/10';
      case 'cancelled': return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10';
      case 'return': return 'bg-slate-50 text-slate-600 dark:bg-white/10';
      case 'on_hold': return 'bg-orange-50 text-orange-600 dark:bg-orange-500/10';
      default: return 'bg-slate-50 text-slate-600 dark:bg-white/10';
    }
  };

  if (loading) return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-32 bg-slate-100 dark:bg-white/3 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="h-24 bg-slate-100 dark:bg-white/3 rounded-xl"/>)}</div>
      <div className="h-96 bg-slate-100 dark:bg-white/3 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase">{t("order_management")} 📂</h1>
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 rounded-xl text-xs font-black backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {orders.length} <span className="opacity-70">{t("total_label")}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-white/80 uppercase tracking-widest">{t("live_transaction_stream")}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={exportCSV} className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-sm transition-all border border-white/10">
               <Download size={14} /> {t("export")}
             </button>
             {!isProduction && (
               <button onClick={() => setIsCourierCenterOpen(true)} className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg">
                 <Truck size={14} /> {t("dispatch")}
               </button>
             )}
             <button onClick={loadOrders} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} />
             </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {STATUS_TABS.map((tab, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all cursor-default group flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${tab.color.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
              <tab.icon size={16} className={tab.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{tab.label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{statusCounts[tab.id as keyof typeof statusCounts] || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-xl border border-slate-200/80 dark:border-white/5 shadow-xl flex items-center gap-1 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { const params = new URLSearchParams(searchParams); if (tab.id === 'all') params.delete('status'); else params.set("status", tab.id); router.push(`?${params.toString()}`); }} 
              className={`px-4 py-2 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${currentStatus === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t("search_orders")} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <select className="h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-semibold outline-none flex-1 md:flex-none" onChange={(e) => setFilters({...filters, paymentType: e.target.value})}>
                 <option value="all">{t("all_payments")}</option>
                 <option value="cod">{t("cod")}</option>
                 <option value="bkash">{t("bkash")}</option>
               </select>
               {isAdmin && (
                 <div className="relative group">
                   <button className="h-11 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all">
                     <ListFilter size={14} /> {selectedOrders.length > 0 ? `${selectedOrders.length} ${t("selected")}` : t("bulk_actions")} <ChevronDown size={12} />
                   </button>
                   <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50 p-2">
                      <button onClick={() => handleBulkStatusUpdate('confirmed')} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-2">{t("confirm_selected")}</button>
                      <button onClick={() => handleBulkStatusUpdate('processing')} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-2">{t("processing_selected")}</button>
                      <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                      <button onClick={handleBulkDelete} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2">{t("delete_selected")}</button>
                   </div>
                 </div>
               )}
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] no-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-5 text-left w-12 border-b border-slate-100 dark:border-white/5">
                   <input type="checkbox" checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} onChange={() => { if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]); else setSelectedOrders(filteredOrders.map((o: Order) => o.id)); }} className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("order")}</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("customer")}</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("phone_number_label")}</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("product_label")}</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("total_label")}</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("status")}</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredOrders.map((o: Order) => (
                <Fragment key={o.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-3.5">
                      <input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={() => { if (selectedOrders.includes(o.id)) setSelectedOrders(selectedOrders.filter((id: string) => id !== o.id)); else setSelectedOrders([...selectedOrders, o.id]); }} className="rounded border-slate-300" />
                    </td>
                    <td className="px-6 py-3.5">
                      <button 
                        onClick={() => router.push(`/admin/orders/${o.id}`)}
                        className="text-xs font-black text-primary tracking-tighter hover:underline decoration-primary/30 text-left"
                      >
                        {o.order_number || `#${o.id.split('-')[0].toUpperCase()}`}
                      </button>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{formatDate(o.created_at, 'MMM dd, yyyy', language)}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{o.customer_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{o.district}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 group">
                           <p className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono tracking-tighter">{o.phone}</p>
                           <button 
                             onClick={() => { 
                               const newSet = new Set(expandedFraudRows);
                               if (newSet.has(o.id)) newSet.delete(o.id);
                               else newSet.add(o.id);
                               setExpandedFraudRows(newSet);
                             }}
                             className={`p-1 rounded-xl transition-all ${expandedFraudRows.has(o.id) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-primary'}`}
                             title="Fraud Check"
                           >
                             <ShieldCheck size={12} />
                           </button>
                        </div>
                        <FraudMiniScore phone={o.phone} />
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 p-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {o.items?.[0]?.image ? <img src={o.items[0].image} alt="" className="w-full h-full object-cover rounded-xl" /> : <Package size={14} className="m-auto h-full text-slate-300" />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[120px] uppercase tracking-tight">{o.items?.[0]?.name || 'N/A'}</p>
                             <p className="text-[9px] font-medium text-slate-400">Qty: {o.items?.[0]?.qty || o.items?.[0]?.quantity || 1}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-3.5"><span className="text-xs font-black text-slate-950 dark:text-white tracking-tighter">৳{(Number(o.total)||0).toLocaleString()}</span></td>
                    <td className="px-6 py-3.5"><span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest ${getStatusColor(o.status)}`}>{t(o.status)}</span></td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                         {o.status === 'pending' && (
                           <>
                             <button onClick={() => setConfirmOrder(o)} className="px-3 py-2 bg-primary text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"><Check size={12} strokeWidth={3}/> {t("confirm_order")}</button>
                             <button onClick={() => setCancelOrder(o)} className="px-3 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"><X size={12} strokeWidth={3}/> {t("cancel_btn")}</button>
                           </>
                         )}
                         
                         {o.status === 'confirmed' && (
                           <>
                             <div className="relative group">
                               <button 
                                 onClick={() => router.push(`/admin/orders/${o.id}?print=true`)}
                                 className="px-3 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                               >
                                 <Printer size={12} strokeWidth={3}/> {t("print")}
                               </button>
                               <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-100 shadow-2xl">
                                 {t("print_invoice")}
                               </div>
                             </div>
                             {isProduction && (
                               <button 
                                 onClick={async () => {
                                   setIsUpdating(true);
                                   const { error } = await supabase.from('orders').update({ status: 'processing' }).eq('id', o.id);
                                   if (!error) {
                                     toast.success("Order marked as Packing/Processing");
                                     logActivity("pack_order", `Marked order ${o.order_number || '#' + o.id.split('-')[0]} as processing`);
                                     loadOrders();
                                   }
                                   setIsUpdating(false);
                                 }}
                                 className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                               >
                                 <Package size={12} strokeWidth={3}/> {t("pack_order")}
                               </button>
                             )}
                             {!isProduction && (
                               <Popover>
                                 <PopoverTrigger asChild>
                                   <button className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                     <Send size={12} strokeWidth={3}/> {t("send_to_courier")}
                                   </button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-56 p-5 rounded-xl border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-slate-900 z-[100]" align="end">
                                    <div className="space-y-5">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("select_courier")}</p>
                                       <RadioGroup defaultValue="steadfast" onValueChange={setSelectedCourierForOrder} className="gap-3">
                                          {[
                                            { id: 'steadfast', label: 'Steadfast' },
                                            { id: 'carrybee', label: 'Carrybee' },
                                            { id: 'pathao', label: 'Pathao' },
                                            { id: 'redx', label: 'RedX' },
                                            { id: 'paperfly', label: 'Paperfly' }
                                          ].map((c) => (
                                            <div key={c.id} className="flex items-center space-x-3 group cursor-pointer">
                                               <RadioGroupItem value={c.id} id={`${o.id}-${c.id}`} className="border-slate-300 text-blue-600" />
                                               <Label htmlFor={`${o.id}-${c.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors cursor-pointer">{c.label}</Label>
                                            </div>
                                          ))}
                                       </RadioGroup>
                                       <button 
                                         onClick={async () => {
                                           const loadingToast = toast.loading(`${selectedCourierForOrder.toUpperCase()} ${t("booking_to_courier")}`);
                                           try {
                                             const res = await fetch(`/api/admin/orders/${o.id}/courier`, {
                                               method: 'POST',
                                               headers: { 'Content-Type': 'application/json' },
                                               body: JSON.stringify({ courier: selectedCourierForOrder })
                                             });
                                             const data = await res.json();
                                             
                                             if (data.success) {
                                               toast.success(`${t("booking_success")} ${data.trackingNumber}`, { id: loadingToast });
                                               logActivity("courier_dispatch", `Dispatched order #${o.id.split('-')[0]} to ${selectedCourierForOrder}`);
                                               loadOrders();
                                             } else {
                                               toast.error(data.message || t("booking_failed"), { id: loadingToast });
                                             }
                                           } catch (err) {
                                             const error = err as Error;
                                             toast.error(error.message, { id: loadingToast });
                                           }
                                         }}
                                         className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                       >
                                          <Send size={14} strokeWidth={3}/> {t("book_now")}
                                       </button>
                                    </div>
                                 </PopoverContent>
                               </Popover>
                             )}
                           </>
                         )}

                         {o.status === 'processing' && (
                           <>
                             <button 
                               onClick={() => router.push(`/admin/orders/${o.id}?tab=tracking`)}
                               className="px-3 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                             >
                               <MapPin size={12} strokeWidth={3}/> {t("track")}
                             </button>
                             {isProduction && (
                               <button 
                                 onClick={async () => {
                                   setIsUpdating(true);
                                   const { error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', o.id);
                                   if (!error) {
                                     toast.success("Order marked as Shipped");
                                     logActivity("ship_order", `Marked order #${o.id.split('-')[0]} as shipped`);
                                     loadOrders();
                                   }
                                   setIsUpdating(false);
                                 }}
                                 className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                               >
                                 <Truck size={12} strokeWidth={3}/> {t("ship_order")}
                               </button>
                             )}
                           </>
                         )}

                         {o.status === 'cancelled' && (
                           <button onClick={() => recoverOrder(o.id)} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"><RotateCcw size={12} strokeWidth={3}/> {t("recover")}</button>
                         )}

                         {o.status === 'delivered' && (
                           <button 
                             onClick={() => router.push(`/admin/orders/${o.id}?print=true`)} 
                             className="px-3 py-2 bg-primary text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                           >
                             <FileText size={12} strokeWidth={3}/> {t("invoice")}
                           </button>
                         )}

                         <button onClick={() => router.push(`/admin/orders/${o.id}`)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-slate-200/50 dark:border-white/5" title={t("edit")}><Pencil size={14}/></button>
                         
                         {isAdmin && (o.status === 'pending' || o.status === 'confirmed' || o.status === 'on_hold') && (
                           <button onClick={() => setCancelOrder(o)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-200/50 dark:border-white/5" title={t("cancel_btn")}><X size={14}/></button>
                         )}

                         {isAdmin && (o.status === 'cancelled') && (
                           <button onClick={() => deleteOrder(o.id)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all border border-slate-200/50 dark:border-white/5" title={t("delete")}><Trash2 size={14}/></button>
                         )}
                         
                         <a href={`tel:${o.phone}`} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-slate-200/50 dark:border-white/5" title={t("call")}><Phone size={14} /></a>
                      </div>
                    </td>
                  </tr>
                  {expandedFraudRows.has(o.id) && (
                    <tr className="bg-slate-50/50 dark:bg-white/1">
                      <td colSpan={8} className="px-8 py-0 border-b border-slate-100 dark:border-white/5">
                         <FraudSummaryPanel phone={o.phone} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[1100px] h-[90vh] p-0 border-none overflow-hidden bg-slate-50 dark:bg-[#0c0c0c] shadow-2xl flex flex-col rounded-xl selection:bg-primary/30">
           <VisuallyHidden><DialogTitle>{t("order_details")}</DialogTitle></VisuallyHidden>
           
           <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-full bg-primary/10 blur-3xl -mr-20" />
              <div className="relative z-10 flex items-center gap-5">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner">
                    <Package size={24} />
                 </div>
                 <div>
                    <div className="flex items-center gap-3">
                       <h2 className="text-xl font-black text-white uppercase tracking-tight ">{t("order")} #{viewOrder?.id.split('-')[0].toUpperCase()}</h2>
                       <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase  shadow-sm ${getStatusColor(viewOrder?.status || '')}`}>
                         {t(viewOrder?.status || '')}
                       </span>
                    </div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1 ">
                       {formatOrderDate(viewOrder?.created_at || "", language)}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setViewOrder(null)} 
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
              >
                <X size={20}/>
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-7 shadow-sm">
                       <div className="flex items-center justify-between mb-8">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest  flex items-center gap-3">
                            <ListFilter size={16} className="text-primary"/> {t("items_manifest")}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewOrder?.items?.length} {t("units")}</span>
                       </div>
                       <div className="space-y-4">
                          {viewOrder?.items?.map((item: OrderItem, i: number) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all hover:shadow-md">
                              <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 dark:border-white/10 overflow-hidden shadow-inner p-1 group-hover:scale-105 transition-transform">
                                  <img src={item.image} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[11px] font-bold text-slate-400 mt-1 ">
                                    <span className="text-primary">৳{item.price}</span> x {item.qty || item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="text-base font-black text-slate-950 dark:text-white tracking-tighter ">৳{(item.price * (item.qty || item.quantity || 0)).toLocaleString()}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-7 shadow-sm">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                         <Activity size={16} className="text-primary"/> {t("operational_timeline")}
                       </h3>
                       <div className="space-y-8 relative ml-4">
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                            const statusHistory = viewOrder?.status_history || [];
                            const stepInfo = statusHistory.find((h) => h.status === step);
                            const isReached = statusHistory.some((h) => h.status === step) || viewOrder?.status === step;
                            const isPast = statusHistory.some((h) => h.status === step) && viewOrder?.status !== step;
                            
                            return (
                              <div key={step} className="flex items-start gap-8 relative">
                                {idx !== 4 && <div className={`absolute left-4 top-8 w-[2px] h-12 ${isReached ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]' : 'bg-slate-100 dark:bg-white/10'}`} />}
                                <div className={`w-8 h-8 rounded-xl border-4 shrink-0 z-10 transition-all flex items-center justify-center ${isReached ? 'bg-primary border-primary/20 shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10'}`}>
                                   {isPast && <Check size={14} className="text-white" strokeWidth={3}/>}
                                   {viewOrder?.status === step && <div className="w-2 h-2 bg-white rounded-xl animate-pulse"/>}
                                </div>
                                <div className="flex-1 -mt-1">
                                  <p className={`text-[11px] font-black uppercase tracking-widest  ${isReached ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>{t(step)}</p>
                                  {stepInfo ? (
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                      {formatOrderDate(stepInfo.time, language)}
                                    </p>
                                  ) : isReached ? (
                                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-1 ">{t("active_stage")}</p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-7 shadow-sm">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t("identity_profile")}</h3>
                       <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                             <User size={28} />
                          </div>
                          <div>
                             <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{viewOrder?.customer_name}</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 ">{viewOrder?.phone}</p>
                          </div>
                       </div>
                       
                       <FraudMiniScore phone={viewOrder?.phone || ""} />
                       
                       <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                          <a href={`tel:${viewOrder?.phone}`} className="flex-1 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all "><Phone size={14}/> {t("call")}</a>
                          <a href={`https://wa.me/${viewOrder?.phone?.replace(/\+/g, '')}`} target="_blank" className="flex-1 h-11 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all "><MessageSquare size={14}/> WhatsApp</a>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-7 shadow-sm">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t("logistics_hub")}</h3>
                       <div className="space-y-5">
                          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ">{t("destination_address")}</label>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight">{viewOrder?.address}, {viewOrder?.district}</p>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/${encodeURIComponent(`${viewOrder?.address}, ${viewOrder?.district}`)}`} 
                            target="_blank" 
                            className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all "
                          >
                             <MapPin size={16} className="text-primary"/> {t("view_on_satellite")}
                          </a>
                       </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-7 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                       <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-xl blur-2xl" />
                       <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 relative z-10">{t("financial_settlement")}</h3>
                       <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-white/50 uppercase ">{t("subtotal")}</span>
                             <span className="text-sm font-black ">৳{(Number(viewOrder?.total) - (Number(viewOrder?.delivery_charge)||0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-white/50 uppercase ">{t("freight")}</span>
                             <span className="text-sm font-black ">৳{(Number(viewOrder?.delivery_charge)||0).toLocaleString()}</span>
                          </div>
                          <div className="h-px bg-white/10 my-4" />
                          <div className="flex justify-between items-end">
                             <span className="text-[11px] font-black text-primary uppercase ">{t("total_settlement")}</span>
                             <span className="text-3xl font-black  tracking-tighter">৳{(Number(viewOrder?.total)||0).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-7 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t("internal_operational_logs")}</h3>
                 <textarea 
                   defaultValue={viewOrder?.admin_note || ""} 
                   onBlur={(e) => viewOrder && updateOrder(viewOrder.id, { admin_note: e.target.value })} 
                   placeholder={t("system_log_entry")} 
                   className="w-full h-32 bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5 rounded-xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"
                 />
              </div>
           </div>

           <div className="p-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap justify-end gap-4 bg-white dark:bg-[#0c0c0c] shrink-0">
              <button 
                onClick={() => setViewOrder(null)} 
                className="h-12 px-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all "
              >
                {t("abort_view")}
              </button>
              
              {isAdmin && viewOrder?.status === 'pending' && (
                <button 
                  onClick={() => viewOrder && handleStatusUpdate(viewOrder.id, 'confirmed')} 
                  className="h-12 px-8 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 "
                >
                  <CheckCircle2 size={16}/> {t("authorize_order")}
                </button>
              )}
              
              {isAdmin && viewOrder?.status !== 'cancelled' && (
                <button 
                  onClick={() => viewOrder && handleStatusUpdate(viewOrder.id, 'cancelled')} 
                  className="h-12 px-8 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 "
                >
                  <Ban size={16}/> {t("revoke_transaction")}
                </button>
              )}
           </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden backdrop-blur-2xl">
           <AnimatePresence>
             {confirmOrder && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="p-8 space-y-6"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Check size={24} strokeWidth={3} />
                     </div>
                     <div>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">✅ {t("confirm_order")}</DialogTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{t("verification_protocol_desc")}</p>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-primary tracking-tighter ">#{confirmOrder.id.split("-")[0].toUpperCase()}</span>
                        <span className="px-3 py-1 bg-white dark:bg-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-white/5">
                           {confirmOrder.payment_method === 'cod' ? t("cod") : confirmOrder.payment_method?.toUpperCase()}
                        </span>
                     </div>
                     <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                        {confirmOrder.customer_name}
                     </h3>
                     <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span>৳{(Number(confirmOrder.total)||0).toLocaleString()}</span>
                        <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-white/10 rounded-xl" />
                        <span>{confirmOrder.phone}</span>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t("note_optional")}</label>
                     <textarea 
                       placeholder={t("note_optional") + "..."} 
                       value={adminNote}
                       onChange={(e) => setAdminNote(e.target.value)}
                       className="w-full h-32 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-6 text-sm outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all resize-none placeholder:text-slate-300"
                     />
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => setConfirmOrder(null)} 
                       className="flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2"
                     >
                        <X size={14} strokeWidth={3} /> {t("cancel_btn")}
                     </button>
                     <button 
                       onClick={() => handleStatusUpdate(confirmOrder.id, 'on_hold')}
                       className="flex-1 py-4 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-gold/20"
                     >
                        <Pause size={14} strokeWidth={3} /> {t("hold")}
                     </button>
                     <button 
                       onClick={() => handleStatusUpdate(confirmOrder.id, 'confirmed')} 
                       className="flex-[1.5] py-4 bg-primary hover:bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                     >
                        <Check size={14} strokeWidth={3} /> {t("confirm_order")}
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Cancellation Modal */}
      <Dialog open={!!cancelOrder} onOpenChange={() => setCancelOrder(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
           <div className="bg-gradient-to-r from-rose-600 to-rose-800 p-8 flex items-center gap-5 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-full bg-white/10 blur-2xl" />
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner relative z-10">
                 <Ban size={28} strokeWidth={2.5}/>
              </div>
              <div className="relative z-10">
                 <DialogTitle className="text-xl font-black uppercase tracking-tight ">{t("revoke_transaction")}</DialogTitle>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">{t("void_security_protocol")}</p>
              </div>
           </div>
           
           <div className="p-10 space-y-8">
              <div className="p-6 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 text-center">
                 <p className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-tight leading-relaxed">
                   {t("terminate_order_confirm_pre")} <span className="font-black underline decoration-rose-500/30 underline-offset-4">{t("permanently_decommission")}</span> {t("order")} #{(cancelOrder?.id || "").split("-")[0].toUpperCase()}?
                 </p>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 ">{t("revocation_justification")}</label>
                 <textarea 
                   placeholder={t("revocation_justification_placeholder")} 
                   value={adminNote}
                   onChange={(e) => setAdminNote(e.target.value)}
                   className="w-full h-32 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-none shadow-inner"
                 />
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => setCancelOrder(null)} 
                   className="flex-1 h-14 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
                 >
                   {t("abort_request")}
                 </button>
                 <button 
                   onClick={() => cancelOrder && handleStatusUpdate(cancelOrder.id, 'cancelled')} 
                   className="flex-[1.5] h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <Ban size={16} strokeWidth={3}/> {t("void_transaction")}
                 </button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* Courier Center Modal */}
      <Dialog open={isCourierCenterOpen} onOpenChange={setIsCourierCenterOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 rounded-xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
           <div className="bg-gradient-to-r from-primary to-emerald-700 p-8 flex items-center gap-6 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-3xl -mr-20" />
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner relative z-10">
                 <Truck size={32} strokeWidth={2.5}/>
              </div>
              <div className="relative z-10">
                 <DialogTitle className="text-2xl font-black uppercase tracking-tight ">{t("courier_dispatch_center")}</DialogTitle>
                 <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">{t("operational_gateway")}</p>
              </div>
              <button 
                onClick={() => setIsCourierCenterOpen(false)} 
                className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10"
              >
                <X size={20}/>
              </button>
           </div>
           
           <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {[
                   { id: 'steadfast', label: 'Steadfast Courier', desc: 'Premium nationwide delivery network', icon: Zap, color: 'text-gold', bg: 'bg-gold/10' },
                   { id: 'carrybee', label: 'Carrybee Logistics', desc: 'Fast intra-city fulfillment', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                   { id: 'pathao', label: 'Pathao Courier', desc: 'Reliable on-demand shipping', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                   { id: 'redx', label: 'RedX Logistics', desc: 'Technology-driven courier service', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' }
                 ].map((courier) => (
                   <button 
                     key={courier.id}
                     onClick={() => setSelectedCourier(courier.id)}
                     className={`p-6 rounded-xl border-2 transition-all flex items-start gap-5 text-left group ${selectedCourier === courier.id ? 'border-primary bg-primary/[0.02] shadow-lg' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:border-slate-200 dark:hover:border-white/10'}`}
                   >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/2 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
                         <courier.icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className={`text-sm font-black uppercase tracking-tight  ${selectedCourier === courier.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{courier.label}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest ">{courier.desc}</p>
                      </div>
                      {selectedCourier === courier.id && (
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/2 flex items-center justify-center text-slate-400 shrink-0">
                           <Check size={12} strokeWidth={4}/>
                        </div>
                      )}
                   </button>
                 ))}
              </div>

              <div className="p-7 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("operational_manifest")}</h4>
                    <span className="px-3 py-1 bg-white dark:bg-white/5 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest border border-slate-100 dark:border-white/5">
                       {filteredOrders.filter(o => o.status === 'confirmed').length} {t("order_ready_count")}
                    </span>
                 </div>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed ">
                    {t("dispatch_warning_pre")} <span className="text-primary font-black">{t("confirmed")}</span> {t("dispatch_warning_mid")} <span className="font-black uppercase text-slate-900 dark:text-white underline decoration-primary/30 underline-offset-4">{selectedCourier}</span> {t("dispatch_warning_post")}
                 </p>
              </div>

              <button 
                onClick={async () => {
                   const loadingToast = toast.loading(`${t("dispatching_to")} ${selectedCourier.toUpperCase()}...`);
                   try {
                     const res = await fetch(`/api/admin/orders/bulk-courier`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ courier: selectedCourier, status: 'confirmed' })
                     });
                     const data = await res.json();
                     if (data.success) {
                       toast.success(`${t("dispatch_success")} ${data.count} ${t("orders")}!`, { id: loadingToast });
                       setIsCourierCenterOpen(false);
                       loadOrders();
                     } else {
                       toast.error(data.message || t("bulk_dispatch_failed"), { id: loadingToast });
                     }
                   } catch (err: any) {
                     toast.error(err.message, { id: loadingToast });
                   }
                }}
                className="w-full h-16 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 "
              >
                 <Zap size={18} strokeWidth={3} className="animate-pulse text-amber-300"/> {t("transmit_to_gateway")}
              </button>
           </div>
        </DialogContent>
      </Dialog>
      
      {/* Fraud Check Modal */}
      <Dialog open={isFraudCheckOpen} onOpenChange={setIsFraudCheckOpen}>
        <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl">
          <VisuallyHidden>
             <DialogTitle>Fraud Check Intelligence</DialogTitle>
             <DialogDescription>Check delivery history for {selectedPhoneForFraud}</DialogDescription>
          </VisuallyHidden>
          <FraudChecker phone={selectedPhoneForFraud} onClose={() => setIsFraudCheckOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
