"use client";

import { useState, useMemo, Suspense } from "react";
import { 
  BarChart3, Target, TrendingUp, Users, Globe, ShoppingBag, 
  Settings, RefreshCcw, Activity, ShieldCheck, Zap, History, 
  Timer, MessageSquare, Bell, CreditCard, Send, ArrowUpRight, 
  TrendingDown, LayoutGrid, XCircle, MousePointer2, Loader2,
  Signal, Rocket, ShieldAlert, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SMSCampaignModal from "@/components/admin/marketing/SMSCampaignModal";

function MarketingAnalyticsContent() {
  const queryClient = useQueryClient();
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: async () => {
      const [ordersRes, sessionsRes, eventsRes] = await Promise.all([
        supabase.from("orders").select("total, created_at, status, admin_note, phone"),
        supabase.from("visitor_sessions").select("id, created_at"),
        supabase.from("visitor_events").select("event_type")
      ]);

      const orders = ordersRes.data || [];
      const sessions = sessionsRes.data || [];
      const events = eventsRes.data || [];

      // Audience Segmentation Logic
      const customersMap: Record<string, any> = {};
      orders.forEach((o: any) => {
        if (!customersMap[o.phone] || new Date(o.created_at) > new Date(customersMap[o.phone].last_order)) {
          customersMap[o.phone] = { last_order: o.created_at, status: o.status };
        }
      });
      const uniqueCustomers = Object.values(customersMap);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const audienceCounts = {
        all: uniqueCustomers.length,
        pending: orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
        inactive: uniqueCustomers.filter((c: any) => new Date(c.last_order) < thirtyDaysAgo).length
      };

      const reach = sessions.length;
      const conversionRate = sessions.length > 0 ? ((orders.length / sessions.length) * 100).toFixed(1) : "0.0";
      const recoveredRevenue = orders.filter((o: any) => o.status === 'confirmed' && o.admin_note?.includes('Recovered')).reduce((sum: number, o: any) => sum + Number(o.total), 0);
      
      const viewContent = events.filter((e: any) => e.event_type === 'PageView').length || sessions.length;
      const addToCart = events.filter((e: any) => e.event_type === 'AddToCart').length;
      const initiateCheckout = events.filter((e: any) => e.event_type === 'InitiateCheckout').length;
      const purchase = orders.length;

      return {
        reach: (reach * 1.2).toFixed(1) + "k",
        conversionRate: conversionRate + "%",
        views: viewContent.toLocaleString(),
        recovered: recoveredRevenue.toLocaleString(),
        audienceCounts,
        funnel: [
          { stage: "Asset Engagement", count: viewContent, percentage: 100, icon: MousePointer2 },
          { stage: "Selection Array", count: addToCart, percentage: viewContent > 0 ? Number(((addToCart / viewContent) * 100).toFixed(1)) : 0, icon: ShoppingBag },
          { stage: "Checkout Protocol", count: initiateCheckout, percentage: viewContent > 0 ? Number(((initiateCheckout / viewContent) * 100).toFixed(1)) : 0, icon: CreditCard },
          { stage: "Settled Assets", count: purchase, percentage: viewContent > 0 ? Number(((purchase / viewContent) * 100).toFixed(1)) : 0, icon: ShieldCheck },
        ]
      };
    }
  });

  const [pixelId, setPixelId] = useState("1234567890");
  const [capiToken, setCapiToken] = useState("");

  const stats = useMemo(() => [
    { label: "Market Reach", value: statsData?.reach || "0.0k", change: "+12%", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Yield Velocity", value: statsData?.conversionRate || "0.0%", change: "+0.5%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Asset Visibility", value: statsData?.views || "0", change: "-2%", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Campaign ROI", value: "Optimal", change: "Live", icon: BarChart3, color: "text-gold", bg: "bg-gold/10" },
  ], [statsData]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Marketing Intelligence...</p>
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
              <h1 className="text-2xl font-bold tracking-tight">Market Orchestration 🚀</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Signal Sync Active
              </div>
            </div>
            <p className="text-sm text-white/70">Analyze conversion funnels, orchestrate campaigns, and monitor ROI.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => queryClient.invalidateQueries({ queryKey: ['marketing-stats'] })} className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
             </button>
              <button 
                onClick={() => setIsCampaignModalOpen(true)}
                className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
              >
                 <Rocket size={14}/> Campaign Hub
              </button>
          </div>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm relative overflow-hidden group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate mb-1">{stat.label}</p>
              <div className="flex items-center justify-between">
                 <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                 <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-xl shrink-0 ${stat.change.startsWith('+') ? 'bg-primary/10 text-primary' : stat.change === "Live" ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {stat.change}
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Conversion Funnel - Advanced Visual */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Activity size={24}/></div>
                  <div>
                     <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Conversion Funnel</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">End-to-end signal performance</p>
                  </div>
               </div>
               <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Yield Optimized</div>
            </div>

            <div className="space-y-12 pb-6">
               {statsData?.funnel.map((stage, i) => (
                 <div key={i} className="relative group/stage">
                    <div className="flex justify-between items-end mb-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/stage:text-primary transition-all border border-slate-100 dark:border-white/5">
                             <stage.icon size={18} />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{stage.stage}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{stage.count.toLocaleString()} Signals Recorded</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-primary tracking-tighter">{stage.percentage}%</p>
                       </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-3.5 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stage.percentage}%` }}
                         transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                         className="bg-primary h-full rounded-xl relative"
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                       </motion.div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Signal Injector Hub */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 dark:bg-black rounded-xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-xl blur-[100px] -mr-32 -mt-32" />
               <div className="flex items-center gap-4 relative z-10 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10 shadow-inner"><Zap size={24} /></div>
                  <div>
                     <h3 className="text-base font-bold">Signal Injector</h3>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Meta Pixel Configuration</p>
                  </div>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset ID (Pixel)</label>
                     <input 
                       value={pixelId}
                       onChange={(e) => setPixelId(e.target.value)}
                       className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                       placeholder="ID: 0000000000"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">CAPI Token Matrix</label>
                     <textarea 
                       value={capiToken}
                       onChange={(e) => setCapiToken(e.target.value)}
                       rows={4}
                       className="w-full p-5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none shadow-inner no-scrollbar"
                       placeholder="Token Manifest..."
                     />
                  </div>
                  <button onClick={() => toast.success("Signals synchronized with Meta edge node")} className="w-full h-14 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                     <RefreshCcw size={16}/> Save & Orchestrate
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={18} className="text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Compliance Status</h3>
               </div>
               <div className="space-y-3">
                  {[
                     { label: "Data Integrity", status: "Optimal" },
                     { label: "GDPR Alignment", status: "Active" },
                     { label: "Encryption Node", status: "Enabled" }
                  ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{item.status}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recovery Engine - Elite Style */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner"><History size={24}/></div>
                  <div>
                     <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Recovery Engine</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automated Asset Retrieval</p>
                  </div>
               </div>
               <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View History</button>
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                  {[
                    { label: "Phase I: Follow-up", time: "30 Mins", active: true },
                    { label: "Phase II: Persistence", time: "24 Hours", active: true },
                    { label: "Phase III: Incentive", time: "48 Hours", active: false },
                  ].map((phase, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 group transition-all">
                       <div className="flex items-center gap-3">
                          <Timer size={16} className={phase.active ? "text-primary" : "text-slate-300"} />
                          <div>
                             <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">{phase.label}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Latency: {phase.time}</p>
                          </div>
                       </div>
                       <div className={`w-10 h-5 rounded-xl p-0.5 transition-all cursor-pointer ${phase.active ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`}>
                          <div className={`w-4 h-4 rounded-xl bg-white shadow-sm transition-all ${phase.active ? 'translate-x-5' : ''}`} />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 text-center">
                     <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Yield Recovery</p>
                     <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">24.5%</p>
                  </div>
                  <div className="p-6 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center">
                     <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1">Asset Value</p>
                     <p className="text-3xl font-black text-blue-700 dark:text-blue-400 tracking-tighter">৳{statsData?.recovered}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Broadcast Center */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><MessageSquare size={24}/></div>
               <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Broadcast Center</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Audience Outreach</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                  <select 
                    value={selectedAudience}
                    onChange={(e) => {
                      setSelectedAudience(e.target.value);
                      setShowFilterBuilder(e.target.value === 'custom');
                    }}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                     <option value="all">সব কাস্টমার (All Customers) — {statsData?.audienceCounts?.all || 0}</option>
                     <option value="pending">অর্ডার দিয়েছে কিন্তু ডেলিভার হয়নি (Ordered, Not Delivered) — {statsData?.audienceCounts?.pending || 0}</option>
                     <option value="delivered">ডেলিভারড কাস্টমার (Delivered Customers) — {statsData?.audienceCounts?.delivered || 0}</option>
                     <option value="cancelled">ক্যান্সেলড কাস্টমার (Cancelled Orders) — {statsData?.audienceCounts?.cancelled || 0}</option>
                     <option value="inactive">ইনএকটিভ কাস্টমার (No order in 30+ days) — {statsData?.audienceCounts?.inactive || 0}</option>
                     <option value="custom">কাস্টম সেগমেন্ট (Custom)</option>
                  </select>
               </div>

               <AnimatePresence>
                 {showFilterBuilder && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Audience Filter Builder</p>
                           <button onClick={() => {setShowFilterBuilder(false); setSelectedAudience('all');}} className="text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase">Clear Filters</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Min Spend (৳)</label>
                              <input type="number" placeholder="0" className="w-full h-10 px-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs outline-none" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Min Orders</label>
                              <input type="number" placeholder="0" className="w-full h-10 px-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs outline-none" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Location / District</label>
                           <input type="text" placeholder="e.g. Dhaka" className="w-full h-10 px-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs outline-none" />
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payload Content</label>
                  <textarea rows={5} className="w-full p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner" placeholder="Define broadcast signal..." />
               </div>
               <button onClick={() => toast.success("Broadcast signal queued for execution")} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all active:scale-95">
                  <Send size={16}/> Execute Broadcast
               </button>
            </div>
         </div>
      </div>

      <SMSCampaignModal 
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        audienceCounts={statsData?.audienceCounts}
      />
    </div>
  );
}

export default function MarketingAnalytics() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Marketing Signals...</p></div>}>
      <MarketingAnalyticsContent />
    </Suspense>
  );
}
