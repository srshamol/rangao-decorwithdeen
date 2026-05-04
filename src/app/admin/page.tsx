"use client";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, DollarSign, AlertTriangle, Clock, Truck, CheckCircle2, RefreshCcw, ArrowUpRight, ArrowRight, Users, Target, Star, ShieldCheck, LayoutGrid, Wallet, Eye, CalendarDays, Box, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
type StaffRole = 'super_admin' | 'admin' | 'moderator' | 'production' | 'user';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [role, setRole] = useState<StaffRole>('production');
  const [fullName, setFullName] = useState("");
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [incompleteCarts, setIncompleteCarts] = useState(0);
  const [incompleteStats, setIncompleteStats] = useState({
    today: 0,
    total: 0,
    abandoned: 0,
    recovered: 0,
    rate: 0
  });

  const loadData = async () => {
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      const { data: { session } } = await supabase.auth.getSession() as any;
      if (session) {
        // Hard override for primary owner
        if (session.user.email === 'rangao.bd@gmail.com') {
          setRole('super_admin');
        } else {
          const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
          if (roleData) setRole(roleData.role as StaffRole);
        }

        // Fetch profile for name
        const { data: profile } = await supabase.from('staff_profiles').select('full_name').eq('id', session.user.id).single();
        if (profile) setFullName(profile.full_name);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, productsRes, abandonedRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
        supabase.from("abandoned_carts").select("*")
      ]);
      
      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      
      if (abandonedRes.data) {
        const data = abandonedRes.data;
        const totalAbandoned = data.length;
        const recovered = data.filter((c: any) => c.is_recovered).length;
        const totalIncomplete = data.filter((c: any) => !c.is_recovered).length;
        const todayIncomplete = data.filter((c: any) => !c.is_recovered && new Date(c.created_at) >= today).length;
        const rate = totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0;
        
        setIncompleteCarts(totalIncomplete);
        setIncompleteStats({
          today: todayIncomplete,
          total: totalIncomplete,
          abandoned: totalAbandoned,
          recovered: recovered,
          rate: rate
        });
      }
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      toast.error(t("failed_to_load_dashboard_data") || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      clearTimeout(safetyTimeout);
    }
  };

  const loadLive = async () => {
    const threshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase.from('visitor_sessions').select('*', { count: 'exact', head: true }).gt('last_active', threshold);
    setLiveVisitors(count || 0);
  };

  useEffect(() => {
    setMounted(true);
    loadData(); loadLive();
    const ch = supabase.channel('dash-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_sessions' }, () => loadLive())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const isProduction = role === 'production';
  const isModerator = role === 'moderator';

  const todayStr = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const todaysOrders = orders.filter((o: any) => o.created_at.startsWith(todayStr));
  const todaysRevenue = todaysOrders.reduce((s: number, o: any) => s + Number(o.total), 0);
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total), 0);
  const monthlyRevenue = orders.filter((o: any) => o.created_at >= monthStart).reduce((s: number, o: any) => s + Number(o.total), 0);
  const outOfStock = products.filter((p: any) => p.stock < 1).length;

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'super_admin': return t("super_admin_label");
      case 'admin': return t("admin_label");
      case 'moderator': return t("moderator_label");
      case 'production': return t("production_label");
      default: return r;
    }
  };

  const revenueByDay = Array.from({ length: chartRange }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (chartRange - 1 - i));
    const dStr = d.toISOString().split("T")[0];
    return { 
      date: d.toLocaleDateString(t("lang") === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" }), 
      revenue: orders.filter((o: any) => o.created_at.startsWith(dStr)).reduce((s: number, o: any) => s + Number(o.total), 0) 
    };
  });

  const statusCounts = {
    pending: orders.filter((o: any) => o.status === 'pending').length,
    confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
    processing: orders.filter((o: any) => o.status === 'processing').length,
    shipped: orders.filter((o: any) => o.status === 'shipped').length,
    delivered: orders.filter((o: any) => o.status === 'delivered').length,
    cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
    return: orders.filter((o: any) => o.status === 'return').length,
  };

  const donutData = [
    { name: t("pending"), value: statusCounts.pending, color: '#f59e0b' },
    { name: t("confirmed"), value: statusCounts.confirmed, color: '#10b981' },
    { name: t("shipped"), value: statusCounts.shipped, color: '#6366f1' },
    { name: t("delivered"), value: statusCounts.delivered, color: '#3b82f6' },
    { name: t("cancelled"), value: statusCounts.cancelled, color: '#ef4444' },
  ].filter((d: any) => d.value > 0);

  const topProducts = products.map((p: any) => ({
    ...p, sales: orders.filter((o: any) => o.items?.some((i: any) => i.id === p.id)).length,
    revenue: orders.filter((o: any) => o.items?.some((i: any) => i.id === p.id)).reduce((s: number, o: any) => s + Number(o.total), 0)
  })).sort((a, b) => b.sales - a.sales).slice(0, 5);
  const maxSales = topProducts[0]?.sales || 1;

  if (loading) return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-28 bg-slate-100 dark:bg-white/3 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">{[...Array(7)].map((_,i)=><div key={i} className="h-28 bg-slate-100 dark:bg-white/3 rounded-xl"/>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-80 bg-slate-100 dark:bg-white/3 rounded-xl"/><div className="h-80 bg-slate-100 dark:bg-white/3 rounded-xl"/></div>
    </div>
  );

  const now = new Date();
  const greeting = now.getHours() < 12 ? t("morning") : now.getHours() < 17 ? t("afternoon") : t("evening");

  const kpis = [
    { label: t("today_orders"), value: todaysOrders.length, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/10" },
    { label: t("today_revenue"), value: `৳${todaysRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-emerald-50 dark:bg-primary/10", border: "border-emerald-100 dark:border-primary/10", hidden: isProduction },
    { label: t("total_revenue"), value: `৳${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5", border: "border-primary/10", hidden: isProduction },
    { label: t("monthly_revenue"), value: `৳${monthlyRevenue.toLocaleString()}`, icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/10", hidden: isProduction },
    { label: t("total_products"), value: products.length, icon: Box, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-100 dark:border-violet-500/10" },
    { label: t("out_of_stock_kpi"), value: outOfStock, icon: AlertTriangle, color: outOfStock > 0 ? "text-rose-600" : "text-primary", bg: outOfStock > 0 ? "bg-rose-50 dark:bg-rose-500/10" : "bg-emerald-50 dark:bg-primary/10", border: outOfStock > 0 ? "border-rose-100 dark:border-rose-500/10" : "border-emerald-100 dark:border-primary/10" },
    { label: t("courier_balance"), value: "৳0", icon: Wallet, color: "text-gold", bg: "bg-amber-50 dark:bg-gold/10", border: "border-amber-100 dark:border-gold/10", hidden: isProduction },
  ].filter((k: any) => !k.hidden);

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">

      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"><LayoutGrid size={120}/></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{greeting}, {fullName || getRoleBadge(role)}! 👋</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                {liveVisitors} {t("live")}
              </div>
            </div>
            <p className="text-sm text-white/70">{now.toLocaleDateString(t("lang") === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-6">
            <div><p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{t("today_orders")}</p><p className="text-2xl font-bold">{todaysOrders.length}</p></div>
            {!isProduction && <div><p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{t("today_revenue")}</p><p className="text-2xl font-bold">৳{todaysRevenue.toLocaleString()}</p></div>}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-${kpis.length} gap-4`}>
        {kpis.map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.08)" }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`bg-white dark:bg-slate-900/50 border ${kpi.border} rounded-xl p-4 shadow-sm cursor-default group flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{kpi.label}</p>
              <p className={`text-lg font-black ${kpi.color === "text-rose-600" ? "text-rose-600" : "text-slate-900 dark:text-white"} leading-none`}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Role Specific Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isProduction && (
          <div className="bg-white dark:bg-slate-900/50 border border-emerald-500/20 rounded-xl p-6 shadow-sm border-l-4">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Package size={20}/></div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("packing_operations")}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("orders_ready")}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/orders?status=confirmed" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500">{t("confirmed")}</p>
                   <p className="text-2xl font-black text-emerald-500">{statusCounts.confirmed}</p>
                </Link>
                <Link href="/admin/orders?status=processing" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500">{t("processing")}</p>
                   <p className="text-2xl font-black text-blue-500">{statusCounts.processing}</p>
                </Link>
             </div>
             <Link href="/admin/orders?status=confirmed" className="mt-6 w-full h-12 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                {t("start_packing")} <ArrowRight size={14}/>
             </Link>
          </div>
        )}

        {(role === 'moderator' || role === 'admin') && (
          <div className="bg-white dark:bg-slate-900/50 border border-amber-500/20 rounded-xl p-6 shadow-sm border-l-4">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><ShieldCheck size={20}/></div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("verification_queue")}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("pending_orders")}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/orders?status=pending" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500">{t("pending")}</p>
                   <p className="text-2xl font-black text-amber-500">{statusCounts.pending}</p>
                </Link>
                <Link href="/admin/incomplete-orders" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-rose-500">{t("incomplete")}</p>
                   <p className="text-2xl font-black text-rose-500">{incompleteCarts}</p>
                </Link>
             </div>
             <Link href="/admin/orders?status=pending" className="mt-6 w-full h-12 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                {t("verify_orders")} <ArrowRight size={14}/>
             </Link>
          </div>
        )}
      </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Graph */}
        {!isProduction && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp size={16} className="text-primary"/></div>
              <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("sales_graph")}</h3><p className="text-[11px] text-slate-400">{t("revenue_trend")}</p></div>
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
              {([7,30] as const).map((d: number)=>(
                <button key={d} onClick={()=>setChartRange(d as 7 | 30)} className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${chartRange===d?"bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm":"text-slate-400"}`}>{d} {t("days")}</button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={revenueByDay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F3D2E" stopOpacity={0.15}/><stop offset="95%" stopColor="#0F3D2E" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-slate-900 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-white/10 shadow-xl">
                      <p className="text-[10px] text-slate-400 font-medium">{payload[0].payload.date}</p>
                      <p className="text-sm font-bold text-white">৳{payload[0].value?.toLocaleString()}</p>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="revenue" stroke="#0F3D2E" strokeWidth={2.5} fill="url(#sg)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

        {/* Order Status Donut */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><LayoutGrid size={16} className="text-indigo-600"/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("order_status")}</h3><p className="text-[11px] text-slate-400">{t("distribution")}</p></div>
          </div>
          <div className="h-[180px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" animationDuration={1000}>
                  {donutData.map((d,i)=><Cell key={i} fill={d.color} strokeWidth={0}/>)}
                </Pie></PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {donutData.map((d,i)=>(
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/2 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-xl" style={{background:d.color}}/>
                <span className="text-[11px] font-medium text-slate-500">{d.name}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-white ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Summary + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Summary */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-gold/10 flex items-center justify-center"><Package size={16} className="text-gold"/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("order_summary")}</h3><p className="text-[11px] text-slate-400">{t("all_statuses")}</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t("pending"), count: statusCounts.pending, icon: Clock, color: "text-gold", bg: "bg-amber-50 dark:bg-gold/10" },
              { label: t("confirmed"), count: statusCounts.confirmed, icon: CheckCircle2, color: "text-primary", bg: "bg-emerald-50 dark:bg-primary/10" },
              { label: t("processing"), count: statusCounts.processing, icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { label: t("shipped"), count: statusCounts.shipped, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
              { label: t("delivered"), count: statusCounts.delivered, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/5" },
              { label: t("cancelled"), count: statusCounts.cancelled, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
            ].map((s,i) => (
              <div key={i} className={`p-4 rounded-xl border border-slate-100 dark:border-white/5 ${s.bg} flex items-center gap-3 group hover:scale-[1.02] transition-transform`}>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                  <s.icon size={18} className={s.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{s.label}</p>
                  <p className={`text-lg font-black ${s.color} leading-none`}>{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        {!isProduction && (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center"><Star size={16} className="text-violet-600"/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("top_selling")}</h3><p className="text-[11px] text-slate-400">{t("best_products")}</p></div>
          </div>
          <div className="space-y-4">
            {topProducts.map((p,i) => (
              <div key={p.id} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">{i+1}</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{t("lang") === 'bn' ? p.name_bn : p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">৳{Number(p.revenue).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{p.sales} {t("sold")}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.sales / maxSales) * 100}%` }} transition={{ duration: 1, delay: i * 0.15 }}
                    className="h-full rounded-xl bg-linear-to-r from-primary to-primary" />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <div className="py-12 text-center"><Package size={32} className="mx-auto text-slate-200 mb-2"/><p className="text-xs text-slate-400">{t("no_data")}</p></div>}
          </div>
        </div>
      )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><ShoppingCart size={16} className="text-blue-600"/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("recent_orders")}</h3><p className="text-[11px] text-slate-400">{t("latest_orders")}</p></div>
          </div>
          <Link href="/admin/orders" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {t("view_all")} <ArrowUpRight size={14}/>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100 dark:border-white/5">
              {[t("order"), t("customer"), t("date"), !isProduction && t("total_label"), t("status")].filter(Boolean).map((h,i)=>(
                <th key={i} className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {orders.slice(0, 8).map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4"><span className="text-xs font-semibold text-primary">#{o.id.split('-')[0].toUpperCase()}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">{(o.customer_name||"?")[0]}</div>
                    <div><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{o.customer_name}</p><p className="text-[10px] text-slate-400">{o.customer_phone}</p></div>
                  </div></td>
                  <td className="px-6 py-4"><span className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString(t("lang")==='bn'?'bn-BD':'en-US',{day:'numeric',month:'short'})}</span></td>
                  {!isProduction && <td className="px-6 py-4"><span className="text-xs font-bold text-slate-900 dark:text-white">৳{Number(o.total).toLocaleString()}</span></td>}
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                    o.status==='pending'?'bg-amber-50 text-gold dark:bg-gold/10':
                    o.status==='confirmed'?'bg-emerald-50 text-primary dark:bg-primary/10':
                    o.status==='delivered'?'bg-blue-50 text-blue-600 dark:bg-blue-500/10':
                    o.status==='cancelled'?'bg-rose-50 text-rose-600 dark:bg-rose-500/10':
                    'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10'
                  }`}>{t(o.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
