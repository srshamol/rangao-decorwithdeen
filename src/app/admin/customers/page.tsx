"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Search, Phone, ShoppingBag, 
  ChevronRight, Calendar, MapPin, 
  MessageSquare, ExternalLink, 
  User, CreditCard, Loader2, RefreshCw,
  X, Mail, Hash, History, ArrowRight,
  ArrowUpRight, Clock, CheckCircle2,
  Heart, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

interface CustomerOrder {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  district: string | null;
  address: string | null;
  total: number;
  created_at: string;
  status: string;
  items: any;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
  district: string | null;
  address: string | null;
  total_orders: number;
  total_spend: number;
  last_order_date: string;
  orders: CustomerOrder[];
}

function AdminCustomersContent() {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(bn ? "ডাটা লোড করা সম্ভব হয়নি" : "Failed to load data");
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const customers = useMemo(() => {
    const grouped: Record<string, Customer> = {};
    
    orders.forEach(order => {
      const phone = order.phone;
      if (!grouped[phone]) {
        grouped[phone] = {
          name: order.customer_name,
          phone: phone,
          email: order.email || "N/A",
          district: order.district,
          address: order.address,
          total_orders: 0,
          total_spend: 0,
          last_order_date: order.created_at,
          orders: []
        };
      }
      
      grouped[phone].total_orders += 1;
      grouped[phone].total_spend += Number(order.total || 0);
      grouped[phone].orders.push(order);
      
      if (new Date(order.created_at) > new Date(grouped[phone].last_order_date)) {
        grouped[phone].name = order.customer_name;
        grouped[phone].district = order.district;
        grouped[phone].address = order.address;
        grouped[phone].last_order_date = order.created_at;
      }
    });

    return Object.values(grouped);
  }, [orders]);

  const parseItems = (items: any) => {
    if (!items) return [];
    if (typeof items === 'string') {
      try { return JSON.parse(items); } catch { return []; }
    }
    return Array.isArray(items) ? items : [];
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );
  }, [customers, searchQuery]);

if (loading && orders.length === 0) return (
    <div className="space-y-6 pb-32 max-w-[1400px] mx-auto animate-pulse">
       <div className="h-24 bg-slate-100 rounded-xl" />
       <div className="h-[400px] bg-slate-100 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      
      {/* Welcome Banner / Header */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"><Users size={120}/></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">👥 {bn ? "কাস্টমার" : "Customers"} ({customers.length})</h1>
            <p className="text-sm text-white/70">{bn ? "আপনার স্টোরের সকল কাস্টমারের তালিকা" : "List of all customers in your store"}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                <input 
                  type="text" 
                  placeholder={bn ? "নাম বা ফোন..." : "Search name or phone..."} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="h-11 pl-11 pr-4 bg-white/10 border border-white/20 rounded-xl text-sm font-medium outline-none focus:bg-white/20 transition-all placeholder:text-white/40 min-w-[280px]" 
                />
             </div>
             <button onClick={loadData} className="w-11 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </div>
      
{/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: bn ? "মোট কাস্টমার" : "Total Customers", value: customers.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { label: bn ? "লোয়াল কাস্টমার" : "Repeat Customers", value: customers.filter(c => c.total_orders > 1).length, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
          { label: bn ? "মোট রেভিনিউ" : "Total Revenue", value: `৳${customers.reduce((s, c) => s + c.total_spend, 0).toLocaleString()}`, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
          { label: bn ? "অ্যাক্টিভ" : "Active", value: "Optimal", icon: Activity, color: "text-gold", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "কাস্টমার" : "Customer"}</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "ফোন" : "Phone"}</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "প্রোডাক্ট" : "Products"}</th>
                <th className="text-center px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "অর্ডার" : "Orders"}</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "মোট খরচ" : "Spend"}</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "শেষ অর্ডার" : "Last Order"}</th>
                <th className="text-right px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{bn ? "অ্যাকশন" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const allImages = Array.from(new Set(c.orders.flatMap((o) => parseItems(o.items).map((i: any) => i.image)).filter(Boolean)));
                return (
                <tr 
                  key={c.phone} 
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <p className="text-xs font-medium text-slate-700">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium text-slate-500 font-mono">{c.phone}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex -space-x-2">
                      {allImages.slice(0, 4).map((img: any, i) => (
                        <div key={i} className="inline-block h-6 w-6 rounded-xl ring-2 ring-white overflow-hidden bg-slate-100">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {allImages.length > 4 && (
                        <div className="flex items-center justify-center h-6 w-6 rounded-xl ring-2 ring-white bg-slate-100 text-[9px] font-medium text-slate-500">
                          +{allImages.length - 4}
                        </div>
                      )}
                      {allImages.length === 0 && (
                        <div className="h-6 w-6 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                           <ShoppingBag size={12} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-700 dark:text-white">{c.total_orders}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">৳{c.total_spend.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs text-slate-500">{new Date(c.last_order_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                  <td className="px-8 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                       <a href={`tel:${c.phone}`} className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 rounded-xl hover:scale-110 transition-transform">
                         <Phone size={14} />
                       </a>
                       <button onClick={() => setSelectedCustomer(c)} className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 rounded-xl hover:scale-110 transition-transform">
                         <History size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-2xl p-0 border-none bg-slate-50 dark:bg-slate-950 overflow-hidden rounded-xl shadow-2xl">
           <DialogHeader className="p-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 relative">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/20">
                    {selectedCustomer?.name[0]?.toUpperCase()}
                 </div>
                 <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{selectedCustomer?.name}</DialogTitle>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"><MapPin size={12}/> {selectedCustomer?.district}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-xl" />
                       <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"><Clock size={12}/> {bn ? "শেষ অর্ডার:" : "Last:"} {selectedCustomer?.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </DialogHeader>

           <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
              {/* Quick Info & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <a href={`tel:${selectedCustomer?.phone}`} className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider hover:bg-blue-50 hover:text-blue-600 transition-all">
                       <Phone size={16} /> {bn ? "কল করুন" : "Call Now"}
                    </a>
                    <a href={`https://wa.me/${selectedCustomer?.phone.replace(/\+/g, '')}`} target="_blank" className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-50 hover:text-primary transition-all">
                       <MessageSquare size={16} /> WhatsApp
                    </a>
                 </div>
                 <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-center shadow-lg shadow-slate-900/10">
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">{bn ? "মোট খরচ" : "Total LTV"}</p>
                    <p className="text-xl font-bold mt-0.5">৳{selectedCustomer?.total_spend.toLocaleString()}</p>
                 </div>
              </div>

              {/* Data Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><User size={14} className="text-primary"/> {bn ? "যোগাযোগ" : "Contact"}</h3>
                    <div className="space-y-4">
                       <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "ফোন" : "Phone"}</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedCustomer?.phone}</p></div>
                       <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "ইমেইল" : "Email"}</p><p className="text-sm font-semibold text-slate-500">{selectedCustomer?.email || 'N/A'}</p></div>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><MapPin size={14} className="text-primary"/> {bn ? "ঠিকানা" : "Address"}</h3>
                    <div className="space-y-4">
                       <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "জেলা" : "District"}</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedCustomer?.district}</p></div>
                       <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "বিস্তারিত" : "Details"}</p><p className="text-xs font-semibold text-slate-500 leading-relaxed">{selectedCustomer?.address}</p></div>
                    </div>
                 </div>
              </div>

              {/* History */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14} className="text-primary"/> {bn ? "অর্ডার ইতিহাস" : "Order History"} ({selectedCustomer?.total_orders})</h3>
                 </div>
                 <div className="space-y-2">
                    {selectedCustomer?.orders.map((order: CustomerOrder) => (
                       <div key={order.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><ShoppingBag size={18} /></div>
                             <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">#{order.id.split('-')[0].toUpperCase()}</p>
                                <p className="text-[10px] font-semibold text-slate-400">{new Date(order.created_at).toLocaleDateString(bn ? 'bn-BD' : 'en-US')}</p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                   {parseItems(order.items).map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] px-2 py-1 rounded-xl border border-slate-100 dark:border-white/5">
                                         {item.image && <img src={item.image} alt="" className="w-4 h-4 rounded-xl object-cover" />}
                                         <span className="text-[9px] font-semibold text-slate-500 truncate max-w-[100px]">{item.name}</span>
                                         <span className="text-[9px] font-bold text-primary">x{item.qty || item.quantity || 1}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-5">
                             <div className="text-right">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">৳{order.total.toLocaleString()}</p>
                                <span className="text-[9px] font-bold uppercase text-primary">{order.status}</span>
                             </div>
                             <button onClick={() => window.open(`/admin/orders?search=${order.id}`, '_blank')} className="p-2 text-slate-300 hover:text-primary transition-colors">
                                <ExternalLink size={14} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">{bn ? "রাঙাও অ্যাডমিন হাব" : "Rangao Admin Hub"}</p>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCustomers() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <AdminCustomersContent />
    </Suspense>
  );
}
