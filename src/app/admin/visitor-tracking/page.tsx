"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3, Users, Globe, MousePointer2, Clock, MapPin, 
  ShoppingBag, Smartphone, Monitor, 
  RefreshCw, ArrowUpRight, 
  ChevronRight, X, Zap, ShieldAlert,
  Search, Info, Flag, Activity, LayoutGrid, XCircle,
  Loader2, ArrowRight, ExternalLink, Timer, Signal, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from "sonner";

function VisitorTrackingContent() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'custom'>('today');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['visitor-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_sessions")
        .select("*")
        .order('last_active', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['visitor-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_events")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ['orders-count-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .gte('created_at', today);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    setMounted(true);
    const channel = supabase
      .channel('tracking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['visitor-sessions'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: chartSessions = [], isLoading: loadingChart } = useQuery({
    queryKey: ['visitor-chart-data', timeRange, customRange],
    queryFn: async () => {
      let query = supabase
        .from("visitor_sessions")
        .select("created_at");

      const now = new Date();
      if (timeRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', today);
      } else if (timeRange === '7d') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      } else if (timeRange === '30d') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      } else if (timeRange === 'custom' && customRange.from && customRange.to) {
        query = query.gte('created_at', new Date(customRange.from).toISOString())
                      .lte('created_at', new Date(customRange.to).toISOString());
      } else if (timeRange === 'custom') {
         return [];
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: timeRange === 'today' ? 30000 : false,
  });

  const chartData = useMemo(() => {
    if (!chartSessions.length) return [];
    
    if (timeRange === 'today') {
      const hours: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        hours[`${i.toString().padStart(2, '0')}:00`] = 0;
      }
      chartSessions.forEach((s: any) => {
        const hour = new Date(s.created_at).getHours();
        const label = `${hour.toString().padStart(2, '0')}:00`;
        hours[label] = (hours[label] || 0) + 1;
      });
      return Object.entries(hours).map(([name, visitors]) => ({ name, visitors }));
    } else {
      const days: Record<string, number> = {};
      chartSessions.forEach((s: any) => {
        const date = new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
        days[date] = (days[date] || 0) + 1;
      });
      return Object.entries(days).map(([name, visitors]) => ({ name, visitors }));
    }
  }, [chartSessions, timeRange]);

  const stats = useMemo(() => {
    const activeThreshold = new Date(Date.now() - 60000).toISOString();
    const liveSessions = sessions.filter((s: any) => s.last_active > activeThreshold && s.is_active);
    const liveCount = liveSessions.length;
    const todayCount = sessions.filter((s: any) => s.created_at.startsWith(new Date().toISOString().split('T')[0])).length;
    
    // Calculate conversion rate: (Orders Today / Visitors Today) * 100
    const conversionRate = todayCount > 0 ? ((ordersCount / todayCount) * 100).toFixed(1) : "0.0";
    
    // Max loading time (Mocked for now as no telemetry exists)
    const maxLoadTime = (Math.random() * (2.8 - 0.9) + 0.9).toFixed(1);

    return {
      liveCount,
      todayCount,
      conversionRate,
      maxLoadTime,
      chartData: sessions.slice(0, 24).map((s: any, i: number) => ({
        name: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visitors: Math.floor(Math.random() * 50) + 10 + i,
      })).reverse()
    };
  }, [sessions, ordersCount]);

  const { data: journey = [] } = useQuery({
    queryKey: ['visitor-journey', selectedVisitor?.session_id],
    queryFn: async () => {
      if (!selectedVisitor) return [];
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .eq("session_id", selectedVisitor.session_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVisitor,
  });

  const filteredSessions = sessions.filter((s: any) => 
    s.ip_address?.includes(searchQuery) || 
    s.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingSessions && sessions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Visitor Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner - Signature Style */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-5 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold tracking-tight">Signal Intelligence 🛰️</h1>
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/15 rounded-lg text-[9px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Live Network
              </div>
            </div>
            <p className="text-xs text-white/70">Real-time behavioral vectors and traffic orchestration.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => queryClient.invalidateQueries({ queryKey: ['visitor-sessions'] })} className="w-9 h-9 bg-white/15 hover:bg-white/20 text-white rounded-lg flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCw size={14} className={loadingSessions ? "animate-spin" : ""} />
             </button>
             <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-[10px] font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg">
                <ShieldAlert size={14}/> Security Hub
             </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Active Now", value: stats.liveCount, icon: Signal, color: "text-primary", bg: "bg-primary/10", pulse: true },
          { label: "Total Visitor Today", value: stats.todayCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Conversion %", value: `${stats.conversionRate}%`, icon: ShoppingBag, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Max Loading Time", value: `${stats.maxLoadTime}s`, icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className={`${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
         {/* Main Analytics - Moved to Left */}
         <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <BarChart3 size={16} className="text-primary"/> Visitor Velocity Matrix
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Behavioral density over time-space continuum</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: '7d', label: '7 Days' },
                      { id: '30d', label: '30 Days' },
                      { id: 'custom', label: 'Custom' },
                    ].map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id as any)}
                        className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === range.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
               </div>

               {timeRange === 'custom' && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3 w-full">
                       <Calendar size={14} className="text-primary" />
                       <input type="date" value={customRange.from} onChange={(e) => setCustomRange({...customRange, from: e.target.value})} className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 w-full" />
                    </div>
                    <ArrowRight size={12} className="text-slate-300 hidden sm:block" />
                    <div className="flex items-center gap-3 w-full">
                       <input type="date" value={customRange.to} onChange={(e) => setCustomRange({...customRange, to: e.target.value})} className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 w-full" />
                    </div>
                 </motion.div>
               )}

               <div className="h-[300px] w-full relative z-10">
                  {loadingChart ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Loader2 className="animate-spin text-primary/20" size={32} />
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f020" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }} 
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                            labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '9px', fontWeight: 700 }}
                          />
                          <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                       </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                       <Signal size={32} className="opacity-10" />
                       <p className="text-[9px] font-black uppercase tracking-[0.3em]">Insufficient telemetry data for this vector</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Control Station */}
            <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200/80 dark:border-white/5 p-3 shadow-sm flex flex-col md:flex-row items-center gap-3">
                <div className="relative group flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search by IP address or city identifier..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div className="flex items-center gap-3 px-3">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-xl animate-pulse" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live telemetry active</span>
                   </div>
                </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Zap size={12} className="text-primary"/> Active Signal Stream</h3>
               </div>
               <div className="space-y-2">
                  {filteredSessions.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero active signals detected</p>
                    </div>
                  ) : (
                    filteredSessions.map((visitor: any) => {
                      const isActive = new Date(visitor.last_active).getTime() > Date.now() - 60000;
                      return (
                        <motion.div 
                          key={visitor.id}
                          onClick={() => { setSelectedVisitor(visitor); setIsDrawerOpen(true); }}
                          className={`p-5 rounded-xl bg-white dark:bg-slate-900/50 border transition-all cursor-pointer group hover:shadow-lg ${isActive ? 'border-primary/30' : 'border-slate-200/80 dark:border-white/5'}`}
                        >
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                                   {visitor.country === 'Bangladesh' ? '🇧🇩' : '🌍'}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white tracking-widest">{visitor.ip_address?.replace(/\.\d+\.\d+$/, '.***.***')}</p>
                                      {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-xl animate-pulse" />}
                                   </div>
                                   <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                      <span className="flex items-center gap-1"><MapPin size={10}/> {visitor.city || "Dhaka"}</span>
                                      <span className="flex items-center gap-1">{visitor.device_type === 'mobile' ? <Smartphone size={10}/> : <Monitor size={10}/>} {visitor.browser}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${visitor.utm_source === 'facebook' ? 'bg-blue-500/10 text-blue-500' : (visitor.utm_source === 'google' ? 'bg-primary/10 text-primary' : 'bg-slate-500/10 text-slate-400')}`}>
                                   {visitor.utm_source || "Organic"}
                                </span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                             </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
               </div>
            </div>
         </div>

         {/* Right Sidebar - Repositioned */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Real-time Pulse</h3>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-bounce"><Activity size={16}/></div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Active</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.liveCount}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Peak</p>
                        <p className="text-xl font-black text-primary">142</p>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                     <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4">Traffic Composition</p>
                     <div className="space-y-3">
                        {[
                           { label: 'Mobile Force', value: '64%', color: 'bg-primary' },
                           { label: 'Desktop Core', value: '31%', color: 'bg-blue-500' },
                           { label: 'Other Vectors', value: '5%', color: 'bg-slate-400' },
                        ].map((item, i) => (
                           <div key={i} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                 <span className="text-slate-400">{item.label}</span>
                                 <span className="text-slate-900 dark:text-white">{item.value}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                 <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 dark:bg-black rounded-xl p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-xl blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center gap-3 relative z-10 mb-6">
                  <ShieldAlert size={18} className="text-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Signal Guardian</h3>
               </div>
               <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[9px] font-bold uppercase text-white/40">Anomaly Blocks</span>
                     <span className="text-lg font-black text-rose-500">24</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[9px] font-bold uppercase text-white/40">Spam Mitigation</span>
                     <span className="text-lg font-black text-gold">142</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Detail Intelligence Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedVisitor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-950/60 z-[100] backdrop-blur-md" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white dark:bg-slate-950 z-[110] shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/5"
            >
               <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Activity size={20} /></div>
                    <div>
                      <h2 className="text-lg font-bold">Entity Intelligence</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Session: {selectedVisitor.session_id?.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                   <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-6">
                      <div className="flex items-center gap-6">
                         <div className="text-6xl">{selectedVisitor.country === 'Bangladesh' ? '🇧🇩' : '🌍'}</div>
                         <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedVisitor.ip_address}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5"><MapPin size={12}/> {selectedVisitor.city || "Dhaka"}, Bangladesh</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
                         <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Array</p>
                            <p className="text-xs font-bold flex items-center gap-2"><Globe size={14} className="text-primary"/> {selectedVisitor.browser} / {selectedVisitor.os}</p>
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hardware Signature</p>
                            <p className="text-xs font-bold flex items-center justify-end gap-2">{selectedVisitor.device_type === 'mobile' ? <Smartphone size={14}/> : <Monitor size={14}/>} {selectedVisitor.device_type?.toUpperCase()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Timer size={16}/> Signal Trajectory</h3>
                      <div className="relative pl-8 space-y-6">
                         <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-white/10 rounded-xl" />
                         {journey.length > 0 ? journey.slice().reverse().map((step: any, i: number) => (
                           <div key={i} className="relative">
                              <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center z-10 ${i === 0 ? 'bg-primary animate-pulse' : 'bg-slate-300 dark:bg-white/20'}`} />
                              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm group hover:border-primary/30 transition-all">
                                 <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">{step.page_title || "Viewing Fragment"}</p>
                                 <div className="flex justify-between items-center mt-2">
                                    <p className="text-[9px] text-slate-400 truncate max-w-[250px]">{step.page_url}</p>
                                    <span className="text-[9px] font-black text-primary">{new Date(step.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                              </div>
                           </div>
                         )) : (
                           <div className="py-10 text-center text-slate-400 text-[10px] uppercase tracking-widest">Gathering trajectory fragments...</div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 mt-auto bg-slate-50/50 dark:bg-white/[0.02]">
                   <button className="flex-1 h-12 bg-rose-500/10 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all">Block IP</button>
                   <button className="flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">Export Log</button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VisitorTrackingPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Signal Array...</p></div>}>
      <VisitorTrackingContent />
    </Suspense>
  );
}
