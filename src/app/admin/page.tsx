"use client";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, DollarSign, AlertTriangle, Clock, Truck, CheckCircle2, RefreshCcw, ArrowUpRight, ArrowRight, Users, Target, Star, ShieldCheck, LayoutGrid, Wallet, Eye, CalendarDays, Box, ShoppingBag, Zap, Inbox, Fingerprint } from "lucide-react";
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadData())
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
    <div className="space-y-6 pb-32 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{[...Array(5)].map((_,i)=><div key={i} className="h-24 bg-slate-100 rounded-xl"/>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-64 bg-slate-100 rounded-xl"/><div className="h-64 bg-slate-100 rounded-xl"/></div>
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

      {/* Welcome Banner - Elite Hub */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
               <Fingerprint size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/15 text-white text-[10px] font-medium rounded-xl">Authorized</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/15 rounded-xl text-[10px] font-medium">
                  <div className="w-1.5 h-1.5 bg-white rounded-xl animate-pulse" />
                  {liveVisitors} {t("live")}
                </div>
              </div>
              <h1 className="text-xl font-bold">
                {greeting}, <span className="text-white/80">{fullName || getRoleBadge(role)}</span>!
              </h1>
              <p className="text-xs text-white/60 mt-0.5">
                {now.toLocaleDateString(t("lang") === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 px-5 py-3 bg-white/10 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] font-medium text-white/60 mb-1">{t("today_orders")}</p>
              <p className="text-2xl font-bold">{todaysOrders.length}</p>
            </div>
            {!isProduction && (
              <>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-[10px] font-medium text-white/60 mb-1">{t("today_revenue")}</p>
                  <p className="text-2xl font-bold">৳{todaysRevenue.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Section - Elite Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon size={16} className={kpi.color} />
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">{kpi.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Actionable Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isProduction && (
          <div className="bg-white dark:bg-white/[0.02] border border-emerald-500/10 rounded-xl p-[2%] lg:p-10 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-xl blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="flex items-center gap-[2%] lg:gap-6 mb-10 relative z-10">
                <div className="w-[3rem] lg:w-16 h-[3rem] lg:h-16 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20"><Package size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("packing_operations")}</h3>
                   <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-1">{t("live_updates")}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 relative z-10">
                <Link href="/admin/orders?status=processing" className="p-[2%] lg:p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group/card">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 group-hover/card:text-emerald-500">{t("processing")}</p>
                   <p className="text-4xl font-black text-emerald-500 tracking-tighter">{statusCounts.processing}</p>
                </Link>
                <Link href="/admin/orders?status=shipped" className="p-[2%] lg:p-8 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all group/card">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 group-hover/card:text-blue-500">{t("shipped")}</p>
                   <p className="text-4xl font-black text-blue-500 tracking-tighter">{statusCounts.shipped}</p>
                </Link>
             </div>
             <Link href="/admin/orders?status=processing" className="mt-8 w-full min-h-[3rem] lg:h-16 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl">
               {t("start_packing")} <ArrowRight size={18}/>
             </Link>
          </div>
        )}
      </div>

      {/* Advanced Telemetry Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isProduction && (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp size={16}/></div>
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("sales_graph")}</h3>
                   <p className="text-[10px] text-slate-400">{t("revenue_trend")}</p>
                </div>
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                {([7,30] as const).map((d: number)=>(
                  <button key={d} onClick={()=>setChartRange(d as 7 | 30)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${chartRange===d?"bg-white dark:bg-slate-700 text-primary shadow-sm":"text-slate-500 hover:text-slate-700"}`}>{d} {t("days")}</button>
                ))}
              </div>
            </div>
            <div className="h-[280px] min-h-[200px] sm:h-[280px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F3D2E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0F3D2E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-slate-900 px-4 py-2 rounded-xl shadow-lg">
                        <p className="text-[10px] text-slate-400 mb-1">{payload[0].payload.date}</p>
                        <p className="text-sm font-bold text-white">৳{payload[0].value?.toLocaleString()}</p>
                      </div>
                    ) : null} />
                    <Area type="monotone" dataKey="revenue" stroke="#0F3D2E" strokeWidth={2} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500"><LayoutGrid size={16}/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("order_status")}</h3><p className="text-[10px] text-slate-400">{t("distribution")}</p></div>
          </div>
          <div className="h-[220px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {donutData.map((d,i)=><Cell key={i} fill={d.color} strokeWidth={0}/>)}
                  </Pie>
                  <Tooltip cursor={false} content={() => null} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {donutData.map((d,i)=>(
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <div className="w-2 h-2 rounded-xl" style={{backgroundColor: d.color}}/>
                <span className="text-[10px] font-medium text-slate-600">{d.name}</span>
                <span className="text-xs font-bold text-slate-900 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500"><Package size={16}/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("order_summary")}</h3><p className="text-[10px] text-slate-400">{t("all_statuses")}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: t("pending"), count: statusCounts.pending, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { label: t("confirmed"), count: statusCounts.confirmed, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
              { label: t("processing"), count: statusCounts.processing, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { label: t("shipped"), count: statusCounts.shipped, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
              { label: t("delivered"), count: statusCounts.delivered, color: "text-primary", bg: "bg-emerald-50/50 dark:bg-primary/10" },
              { label: t("cancelled"), count: statusCounts.cancelled, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
            ].map((s,i) => (
              <div key={i} className={`p-3 ${s.bg} rounded-xl flex items-center gap-2`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isProduction && (
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500"><Star size={16}/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("top_selling")}</h3><p className="text-[10px] text-slate-400">{t("best_products")}</p></div>
          </div>
          <div className="space-y-4 flex-1">
            {topProducts.map((p,i) => (
              <div key={p.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</span>
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{t("lang") === 'bn' ? p.name_bn : p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">৳{Number(p.revenue).toLocaleString()}</p>
                    <p className="text-[9px] font-medium text-slate-400">{p.sales} {t("sold")}</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-xl overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(p.sales / maxSales) * 100}%` }} 
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    className="h-full rounded-xl bg-primary" 
                  />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-40">
                <Package size={32} className="mb-2"/>
                <p className="text-xs font-medium">{t("no_data")}</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>


      {/* Signal Registry Feed (Recent Orders) */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 gap-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500"><Inbox size={16}/></div>
            <div>
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("recent_orders")}</h3>
               <p className="text-[10px] text-slate-400">{t("latest_orders")}</p>
            </div>
          </div>
          <Link href="/admin/orders" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
            {t("view_all")} <ArrowUpRight size={13}/>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.02]">
                {[t("order"), t("customer"), t("date"), !isProduction && t("total_label"), t("status")].filter(Boolean).map((h,i)=>(
                  <th key={i} className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 8).map((o: any, idx: number) => (
                <motion.tr 
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-all"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-primary">#{o.id.split('-')[0].toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{(o.customer_name||"?")[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{o.customer_name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{o.customer_phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500">{new Date(o.created_at).toLocaleDateString(t("lang")==='bn'?'bn-BD':'en-US',{day:'numeric',month:'short'})}</span>
                  </td>
                  {!isProduction && (
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">৳{Number(o.total).toLocaleString()}</span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold ${
                      o.status==='pending'?'bg-amber-50 text-amber-600':
                      o.status==='confirmed'?'bg-emerald-50 text-emerald-600':
                      o.status==='delivered'?'bg-blue-50 text-blue-600':
                      o.status==='cancelled'?'bg-rose-50 text-rose-600':
                      'bg-slate-100 text-slate-600'
                    }`}>{t(o.status)}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
