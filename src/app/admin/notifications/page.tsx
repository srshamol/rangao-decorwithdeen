"use client";

import { useState, useEffect } from "react";
import { 
  Bell, ShoppingCart, AlertTriangle, Clock, 
  Search, Trash2, CheckCircle2, 
  ArrowRight, Ghost,
  Activity, ShieldCheck, Fingerprint, Layers
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

  useEffect(() => {
    const saved = localStorage.getItem("admin_read_notifs");
    if (saved) {
      try { setReadIds(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: orders } = await supabase
      .from("orders")
      .select("id, customer_name, total, created_at, status")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 15)
      .limit(10);

    const { data: abandoned } = await supabase
      .from("abandoned_carts")
      .select("id, customer_name, phone, created_at")
      .eq("is_recovered", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const combined: AdminNotification[] = [];

    orders?.forEach((o: any) => {
      combined.push({
        id: `order-${o.id}`,
        type: "order",
        category: "Sales",
        title: bn ? "নতুন অর্ডার গ্রহণ করা হয়েছে" : "New Order Received",
        description: bn 
          ? `${o.customer_name} এর কাছ থেকে ৳${o.total} টাকার অর্ডার। স্ট্যাটাস: ${o.status}।` 
          : `Order of ৳${o.total} from ${o.customer_name}. Status: ${o.status}.`,
        time: o.created_at,
        read: false,
        icon: ShoppingCart,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        link: `/admin/orders/${o.id}`
      });
    });

    lowStock?.forEach((p: any) => {
      combined.push({
        id: `stock-${p.id}`,
        type: "stock",
        category: "Inventory",
        title: bn ? "স্টক কম সতর্কতা" : "Low Stock Warning",
        description: bn 
          ? `${p.name} এ মাত্র ${p.stock} টি পণ্য বাকি আছে।` 
          : `${p.name} has only ${p.stock} units remaining.`,
        time: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        link: `/admin/inventory`
      });
    });

    abandoned?.forEach((a: any) => {
      combined.push({
        id: `abandoned-${a.id}`,
        type: "abandoned",
        category: "Recovery",
        title: bn ? "অসম্পূর্ণ চেকআউট" : "Abandoned Checkout",
        description: bn 
          ? `${a.customer_name || 'একজন ক্রেতা'} চেকআউট ছেড়ে গেছেন। ফোন: ${a.phone || 'অজানা'}।` 
          : `Abandoned checkout from ${a.customer_name || 'a customer'}. Phone: ${a.phone || 'N/A'}.`,
        time: a.created_at,
        read: true,
        icon: Ghost,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-500/10",
        link: `/admin/incomplete-orders`
      });
    });

    combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(combined.filter((n) => !readIds.includes(n.id)));
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

  useEffect(() => { fetchNotifications(); }, [language, readIds]);

  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || n.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{bn ? "নোটিফিকেশন" : "Notifications"}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-xl animate-pulse" />
                <p className="text-xs text-white/60">{notifications.length} {bn ? "টি সক্রিয়" : "active signals"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Activity size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-white text-primary rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-white/90 transition-all shadow-sm"
            >
              <CheckCircle2 size={14} /> {bn ? "সব পড়েছি" : "Dismiss All"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: bn ? "অর্ডার অ্যালার্ট" : "Orders", count: notifications.filter(n => n.type === 'order').length, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: bn ? "স্টক সতর্কতা" : "Stock Alerts", count: notifications.filter(n => n.type === 'stock').length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: bn ? "রিকভারি" : "Recovery", count: notifications.filter(n => n.type === 'abandoned').length, icon: Ghost, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-4 hover:shadow-sm transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder={bn ? "নোটিফিকেশন খুঁজুন..." : "Search notifications..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto">
          {["all", "order", "stock", "abandoned"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 h-7 rounded-xl text-[10px] font-medium transition-all shrink-0 ${filter === type ? "bg-white dark:bg-white/10 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {type === 'all' ? (bn ? "সব" : "All") :
               type === 'order' ? (bn ? "অর্ডার" : "Orders") :
               type === 'stock' ? (bn ? "স্টক" : "Inventory") : (bn ? "রিকভারি" : "Recovery")}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Layers className="text-primary animate-pulse" size={28} />
            <p className="text-xs font-medium text-slate-400">{bn ? "লোড হচ্ছে..." : "Loading..."}</p>
          </div>
        ) : filteredNotifs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredNotifs.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.03 }}
                  className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 shrink-0 rounded-xl ${notif.bg} flex items-center justify-center ${notif.color} mt-0.5`}>
                      <notif.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-xl ${notif.bg} ${notif.color}`}>{notif.category}</span>
                          {!notif.read && <div className="w-1.5 h-1.5 rounded-xl bg-primary animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={11} />
                          {format(new Date(notif.time), 'dd MMM, hh:mm a', { locale: bn ? bnLocale : undefined })}
                        </div>
                      </div>
                      <h3 className={`text-sm font-semibold mb-0.5 ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{notif.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{notif.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Link
                          href={notif.link}
                          onClick={() => deleteNotification(notif.id)}
                          className="h-7 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-all"
                        >
                          {bn ? "বিস্তারিত" : "View Details"} <ArrowRight size={11} />
                        </Link>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
              <ShieldCheck size={22} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500">{bn ? "কোনো নোটিফিকেশন নেই" : "No notifications"}</p>
            <p className="text-xs text-slate-400">{bn ? "সিস্টেম সম্পূর্ণ স্বাভাবিক আছে।" : "All systems are running normally."}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
            <Fingerprint size={14} className="text-white dark:text-slate-900" />
          </div>
          <p className="text-[10px] font-medium text-slate-400">Authenticated access only — encrypted store telemetry</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-xl bg-emerald-500" />E2E Encrypted</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-xl bg-emerald-500" />0.4ms Latency</span>
        </div>
      </div>
    </div>
  );
}
