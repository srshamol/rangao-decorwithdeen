"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ShoppingCart, AlertTriangle, Info, CheckCircle2, X, Clock, Settings, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { bn as bnLocale } from "date-fns/locale";

interface Notification {
  id: string;
  type: "order" | "stock";
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
  bg: string;
  link: string;
}

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    // For now, we simulate notifications by fetching recent orders and low stock products
    const { data: orders } = await supabase
      .from("orders")
      .select("id, customer_name, total, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 10)
      .limit(3);

    const combined: Notification[] = [];

    orders?.forEach((o: { id: string, customer_name: string, total: number, created_at: string, status: string }) => {
      combined.push({
        id: `order-${o.id}`,
        type: "order",
        title: t("new_order"),
        description: bn 
          ? `${o.customer_name} এর কাছ থেকে ৳${o.total} টাকার একটি অর্ডার এসেছে।` 
          : `Received an order of ৳${o.total} from ${o.customer_name}.`,
        time: o.created_at,
        read: false,
        icon: ShoppingCart,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: `/admin/orders/${o.id}`
      });
    });

    lowStock?.forEach((p: { id: string, name: string, stock: number }) => {
      combined.push({
        id: `stock-${p.id}`,
        type: "stock",
        title: t("low_stock_alert"),
        description: bn 
          ? `${p.name} এর স্টক মাত্র ${p.stock} টি আছে।` 
          : `Stock for ${p.name} is low (${p.stock} remaining).`,
        time: new Date().toISOString(), // Simplified
        read: false,
        icon: AlertTriangle,
        color: "text-gold",
        bg: "bg-gold/10",
        link: `/admin/inventory`
      });
    });

    // Sort by time
    combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    // Filter out read notifications
    const filtered = combined.filter(n => !readIds.includes(n.id));
    
    setNotifications(filtered);
    setUnreadCount(filtered.length);
  };

  const markAsRead = (id: string) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem("admin_read_notifs", JSON.stringify(newReadIds));
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => prev - 1);
  };

  const clearAll = () => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = [...readIds, ...allIds];
    setReadIds(newReadIds);
    localStorage.setItem("admin_read_notifs", JSON.stringify(newReadIds));
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Listen for new orders
    const channel = supabase
      .channel('admin-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [language, readIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary transition-all group relative bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
      >
        <Bell size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 bg-rose-500 rounded-full border-2 border-white dark:border-[#0c0c0c] z-20 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-rose-500/20 animate-in zoom-in duration-300">
            {unreadCount}
          </span>
        )}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-[380px] bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/2">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter ">
                  {t("notifications")}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {unreadCount} {t("new_alerts")}
                </p>
              </div>
              <button 
                onClick={clearAll}
                className="px-3 py-1.5 flex items-center gap-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-bold uppercase tracking-wider border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                title={t("clear_all")}
              >
                <CheckCircle2 size={12} />
                {t("clear_all")}
              </button>
            </div>

            {/* List */}
            <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="group/item relative"
                  >
                    <Link 
                      href={notif.link}
                      onClick={() => {
                        setIsOpen(false);
                        markAsRead(notif.id);
                      }}
                      className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/3 transition-all group relative border-b border-slate-50 dark:border-white/2 last:border-0"
                    >
                      <div className={`w-12 h-12 shrink-0 rounded-lg ${notif.bg} flex items-center justify-center ${notif.color} group-hover:scale-110 transition-transform`}>
                        <notif.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{notif.title}</p>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notif.time), { 
                              addSuffix: true, 
                              locale: bn ? bnLocale : undefined 
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {notif.description}
                        </p>
                      </div>
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        markAsRead(notif.id);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 dark:hover:border-rose-500/20 opacity-0 group-hover/item:opacity-100 transition-all shadow-sm z-10"
                      title={t("dismiss")}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4  font-black text-4xl">!</div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t("no_notifications")}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 ">
                    {t("smooth_running")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
              <Link 
                href="/admin/notifications" 
                onClick={() => setIsOpen(false)}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all  group"
              >
                {t("view_all")}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
