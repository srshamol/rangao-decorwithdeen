"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, 
  ArrowUpRight, ArrowDownLeft, Calendar, Download,
  RefreshCw, Filter, FileText, PieChart, BarChart3,
  Activity, Wallet, Truck, AlertCircle, Loader2,
  ChevronRight, Package, ShoppingBag, Receipt, Zap, ArrowRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, Cell 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

// Logic Constants
const DEFAULT_COURIER_COST = 120;
const RETURN_PENALTY = 120;
const PRODUCT_COST_PERCENTAGE = 0.6; // 60% of total is cost

function AdminFinanceContent() {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [mounted, setMounted] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("Failed to synchronize financial ledger");
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { 
    setMounted(true);
    loadData(); 
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    if (dateRange === "all") return orders;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.setDate(now.getDate() - days));
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, dateRange]);

  const stats = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered');
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled');
    const returned = filteredOrders.filter(o => o.status === 'return');
    const pendingCod = filteredOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));

    const totalRevenue = delivered.reduce((acc, o) => acc + Number(o.total), 0);
    const totalCodPending = pendingCod.reduce((acc, o) => acc + Number(o.total), 0);
    
    const courierCosts = (delivered.length + returned.length) * DEFAULT_COURIER_COST;
    const returnCosts = (cancelled.length + returned.length) * RETURN_PENALTY;
    const estimatedProductCost = totalRevenue * PRODUCT_COST_PERCENTAGE;
    
    const totalCosts = courierCosts + returnCosts + estimatedProductCost;
    const netProfit = totalRevenue - totalCosts;

    return {
      totalRevenue,
      totalCodPending,
      courierCosts,
      returnCosts,
      netProfit,
      deliveredCount: delivered.length,
      cancelledCount: cancelled.length,
      returnedCount: returned.length,
      totalCount: filteredOrders.length
    };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const daily: Record<string, { revenue: number, cost: number, profit: number }> = {};
    
    filteredOrders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (!daily[date]) daily[date] = { revenue: 0, cost: 0, profit: 0 };
      
      if (o.status === 'delivered') {
        const rev = Number(o.total);
        const cost = (rev * PRODUCT_COST_PERCENTAGE) + DEFAULT_COURIER_COST;
        daily[date].revenue += rev;
        daily[date].cost += cost;
        daily[date].profit += (rev - cost);
      } else if (o.status === 'cancelled' || o.status === 'return') {
        daily[date].cost += RETURN_PENALTY;
        daily[date].profit -= RETURN_PENALTY;
      }
    });

    return Object.entries(daily).map(([name, vals]) => ({ name, ...vals })).reverse();
  }, [filteredOrders]);

  if (loading && orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Financial Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Business Intelligence 📊</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Live Fiscal Node
              </div>
            </div>
            <p className="text-sm text-white/70">Analyze revenue velocity, cost attribution, and net yield.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex gap-1 border border-white/10">
                {["7d", "30d", "all"].map((r) => (
                  <button 
                    key={r} 
                    onClick={() => setDateRange(r as any)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === r ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"}`}
                  >
                    {r}
                  </button>
                ))}
             </div>
             <button onClick={loadData} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: stats.totalRevenue, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Logistical Cost", value: stats.courierCosts + stats.returnCosts, icon: Truck, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Net Yield", value: stats.netProfit, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", isProfit: true },
          { label: "COD Liquidity", value: stats.totalCodPending, icon: Wallet, color: "text-gold", bg: "bg-gold/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className={`text-2xl font-black tracking-tighter leading-none ${stat.isProfit ? (stat.value >= 0 ? 'text-primary' : 'text-rose-500') : 'text-slate-900 dark:text-white'}`}>
                ৳{Math.abs(stat.value).toLocaleString()}
                {stat.isProfit && stat.value < 0 && <span className="text-[10px] ml-1 opacity-60 font-bold uppercase tracking-widest">(Loss)</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Revenue Velocity Chart */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Revenue Velocity</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Daily gross performance vector</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity size={18} />
               </div>
            </div>
            <div className="h-[300px] w-full">
               {mounted && (
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Profit vs Cost Matrix */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Fiscal Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Profit vs Cost attribution</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BarChart3 size={18} />
               </div>
            </div>
            <div className="h-[300px] w-full">
               {mounted && (
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                       />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                       <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                       <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent Transactions */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Recent Fiscal Events</h3>
               <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">View All <ArrowRight size={10}/></button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Protocol</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Magnitude</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">State</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                     {filteredOrders.slice(0, 8).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                           <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-500 uppercase">#{o.id.slice(0, 8)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{o.payment_type || 'COD'}</span>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <span className="text-xs font-black text-slate-900 dark:text-white">৳{Number(o.total).toLocaleString()}</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-0.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${o.status === 'delivered' ? 'bg-primary/10 text-primary' : (o.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500' : 'bg-gold/10 text-gold')}`}>
                                 {o.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Cost Attribution Breakdown */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-white/5 pb-4">Cost Attribution</h3>
            <div className="space-y-6">
               {[
                  { label: "Courier Dispatch", value: stats.courierCosts, icon: Truck, color: "text-blue-500" },
                  { label: "Return Penalties", value: stats.returnCosts, icon: RefreshCw, color: "text-rose-500" },
                  { label: "Asset Procurement", value: stats.totalRevenue * PRODUCT_COST_PERCENTAGE, icon: Package, color: "text-gold" },
                  { label: "Promotional Burn", value: 0, icon: Receipt, color: "text-primary" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                           <item.icon size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-xs font-black text-slate-900 dark:text-white">৳{Math.round(item.value).toLocaleString()}</span>
                  </div>
               ))}
               
               <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Total Liability</span>
                     <span className="text-lg font-black text-rose-500">৳{(stats.courierCosts + stats.returnCosts + (stats.totalRevenue * PRODUCT_COST_PERCENTAGE)).toLocaleString()}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function AdminFinance() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <AdminFinanceContent />
    </Suspense>
  );
}
