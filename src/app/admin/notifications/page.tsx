"use client";

import { useState, useEffect } from "react";
import { 
  Bell, ShoppingCart, AlertTriangle, Clock, 
  Search, Filter, Trash2, CheckCircle2, 
  ArrowRight, MoreVertical, Mail, Ghost
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import { format } from "date-fns";
import { bn as bnLocale } from "date-fns/locale";

interface AdminNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
  bg: string;
  link: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [readIds, setReadIds] = useState<string[]>([]);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin_read_notifs");
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing read notifs", e);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    // Simulating rich notifications from existing data
    const { data: orders } = await supabase
      .from("orders")
      .select("id, customer_name, total, created_at, status")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 10)
      .limit(10);

    const { data: abandoned } = await supabase
      .from("abandoned_carts")
      .select("id, customer_name, phone, created_at")
      .eq("is_recovered", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const combined: AdminNotification[] = [];

    orders?.forEach((o) => {
      combined.push({
        id: `order-${o.id}`,
        type: "order",
        category: "Sales",
        title: bn ? "নতুন অর্ডার সফলভাবে গ্রহণ করা হয়েছে" : "New Order Successfully Received",
        description: bn 
          ? `${o.customer_name} এর কাছ থেকে ৳${o.total} টাকার একটি নতুন অর্ডার পাওয়া গেছে। অর্ডারের বর্তমান অবস্থা: ${o.status}।` 
          : `A new order of ৳${o.total} has been placed by ${o.customer_name}. Current status: ${o.status}.`,
        time: o.created_at,
        read: false,
        icon: ShoppingCart,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: `/admin/orders/${o.id}`
      });
    });

    lowStock?.forEach((p) => {
      combined.push({
        id: `stock-${p.id}`,
        type: "stock",
        category: "Inventory",
        title: bn ? "প্রোডাক্ট স্টক অনেক কম" : "Critical Low Stock Warning",
        description: bn 
          ? `${p.name} এর স্টক দ্রুত শেষ হয়ে যাচ্ছে। বর্তমানে মাত্র ${p.stock} টি পণ্য আছে। অনুগ্রহ করে ইনভেন্টরি আপডেট করুন।` 
          : `Inventory for ${p.name} is critically low with only ${p.stock} units left. Please restock soon.`,
        time: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        icon: AlertTriangle,
        color: "text-gold",
        bg: "bg-gold/10",
        link: `/admin/inventory`
      });
    });

    abandoned?.forEach((a) => {
      combined.push({
        id: `abandoned-${a.id}`,
        type: "abandoned",
        category: "Recovery",
        title: bn ? "অসম্পূর্ণ চেকআউট সনাক্ত করা হয়েছে" : "Abandoned Checkout Detected",
        description: bn 
          ? `${a.customer_name || 'একজন ক্রেতা'} চেকআউট পেজ থেকে ফিরে গেছেন। ফোন: ${a.phone || 'অজানা'}।` 
          : `An abandoned checkout was detected from ${a.customer_name || 'a customer'}. Phone: ${a.phone || 'N/A'}.`,
        time: a.created_at,
        read: true,
        icon: Ghost,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        link: `/admin/incomplete-orders`
      });
    });

    combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    // Filter out read/dismissed notifications
    const filtered = combined.filter((n) => !readIds.includes(n.id));
    
    setNotifications(filtered);
    setLoading(false);
  };

  const deleteNotification = (id: string) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem("admin_read_notifs", JSON.stringify(newReadIds));
    setNotifications(prev => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const newReadIds = [...readIds, ...allIds];
    setReadIds(newReadIds);
    localStorage.setItem("admin_read_notifs", JSON.stringify(newReadIds));
    setNotifications([]);
  };

  useEffect(() => {
    fetchNotifications();
  }, [language, readIds]);

  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || n.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Premium Dashboard Header */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-lg p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-lg -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                 <Bell size={28} />
              </div>
              <div>
                 <h1 className="text-2xl font-black uppercase tracking-tight">
                   {bn ? "নোটিফিকেশন সেন্টার" : "Notification Center"}
                 </h1>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-xl animate-pulse" />
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                       {bn ? "রিয়েল-টাইম স্টোর অ্যালার্ট এবং অ্যাকশন" : "Real-time store alerts and intelligence"}
                    </p>
                 </div>
              </div>
           </div>
           <button 
             onClick={markAllAsRead}
             className="px-6 h-12 bg-white text-primary rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-xl"
           >
             <CheckCircle2 size={18} />
             {bn ? "সব পড়েছি" : "Mark All as Read"}
           </button>
        </div>
      </div>

      {/* Standardized Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: bn ? "অর্ডার অ্যালার্ট" : "Order Alerts", count: notifications.filter((n: any) => n.type === 'order').length, color: "text-blue-500", bg: "bg-blue-500/10", icon: ShoppingCart },
          { label: bn ? "স্টক ওয়ার্নিং" : "Stock Warnings", count: notifications.filter((n: any) => n.type === 'stock').length, color: "text-gold", bg: "bg-gold/10", icon: AlertTriangle },
          { label: bn ? "রিকভারি সুযোগ" : "Recovery Leads", count: notifications.filter((n: any) => n.type === 'abandoned').length, color: "text-rose-500", bg: "bg-rose-500/10", icon: Ghost },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Standardized Filters */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 p-4 rounded-lg shadow-sm flex flex-col lg:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={bn ? "নোটিফিকেশন খুঁজুন..." : "Search alerts..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
            />
         </div>
         <div className="flex bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-100 dark:border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["all", "order", "stock", "abandoned"].map((type) => (
               <button 
                 key={type}
                 onClick={() => setFilter(type)}
                 className={`px-6 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === type ? "bg-white dark:bg-slate-800 text-primary shadow-md" : "text-slate-400 hover:text-slate-600"}`}
               >
                 {type === 'all' ? (bn ? "সব" : "All") : 
                  type === 'order' ? (bn ? "অর্ডার" : "Orders") : 
                  type === 'stock' ? (bn ? "স্টক" : "Stock") : (bn ? "রিকভারি" : "Recovery")}
               </button>
            ))}
         </div>
      </div>

      {/* High-Performance Main List */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-lg animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{bn ? "নোটিফিকেশন লোড হচ্ছে..." : "Syncing Notifications..."}</p>
          </div>
        ) : filteredNotifs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredNotifs.map((notif, idx) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-7 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer relative ${!notif.read ? 'bg-primary/[0.01]' : ''}`}
                >
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  )}
                  <div className="flex flex-col md:flex-row gap-7 items-start">
                    <div className={`w-14 h-14 shrink-0 rounded-lg ${notif.bg} flex items-center justify-center ${notif.color} group-hover:scale-110 transition-transform shadow-inner`}>
                      <notif.icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${notif.bg} ${notif.color}`}>
                            {notif.category}
                          </span>
                          <h3 className={`text-base font-black tracking-tight ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {notif.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={12} />
                          {format(new Date(notif.time), 'dd MMM yyyy, hh:mm a', { locale: bn ? bnLocale : undefined })}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {notif.description}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <Link 
                          href={notif.link}
                          onClick={() => deleteNotification(notif.id)}
                          className="h-9 px-5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                        >
                          {bn ? "বিস্তারিত দেখুন" : "View Intelligence"}
                          <ArrowRight size={14} />
                        </Link>
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 rotate-12">
              <Bell size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "নোটিফিকেশন নেই" : "Operational Tranquility"}</h2>
            <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto mt-3 leading-relaxed">
              {bn ? "বর্তমানে আপনার স্টোরে কোনো নতুন নোটিফিকেশন নেই। সবকিছু ঠিকঠাক চলছে!" : "No active alerts in the system. Everything is running smoothly."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
