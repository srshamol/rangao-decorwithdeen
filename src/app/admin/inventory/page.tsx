"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, DollarSign, AlertCircle, Plus, Search, 
  History, ArrowUpRight, ArrowDownLeft, Settings2,
  Loader2, RefreshCw, X, Save, Box, ArrowRight,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language-context";

function InventoryManagementContent() {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockAmount, setStockAmount] = useState("1");
  const [stockNote, setStockNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const [role, setRole] = useState<string>('production');

  const loadData = async () => {
    setLoading(true);
    
    // Get user role
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      if (session.user.email === 'rangao.bd@gmail.com') {
        setRole('super_admin');
      } else {
        const { data: rData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
        if (rData) setRole(rData.role);
      }
    }

    const { data: pData, error: pError } = await supabase.from("products").select("*").order("name", { ascending: true });
    if (pError) toast.error(bn ? "প্রোডাক্ট লোড করা সম্ভব হয়নি" : "Failed to load products");
    else setProducts(pData || []);

    const { data: mData, error: mError } = await supabase.from("stock_movements").select(`*, products (name, name_bn, sku)`).order("created_at", { ascending: false }).limit(50);
    if (mError) toast.error(bn ? "মুভমেন্ট লগ লোড করা সম্ভব হয়নি" : "Failed to load movement logs");
    else setMovements(mData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock <= (p.inventory_threshold || 5)).length;
    return { totalProducts, totalValue, lowStockItems };
  }, [products]);

  const lowStockProducts = products.filter(p => p.stock <= (p.inventory_threshold || 5));

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (role === 'production') {
      toast.error(bn ? "আপনার এই কাজের অনুমতি নেই" : "You don't have permission to add stock");
      return;
    }
    setUpdating(true);
    const amount = Number(stockAmount);
    try {
      const { error: pError } = await supabase.from("products").update({ stock: selectedProduct.stock + amount } as any).eq("id", selectedProduct.id);
      if (pError) throw pError;
      await supabase.from("stock_movements").insert({ product_id: selectedProduct.id, type: 'in', quantity: amount, note: stockNote || "Manual Restock" } as any);
      toast.success(bn ? "স্টক সফলভাবে আপডেট করা হয়েছে" : "Stock updated successfully");
      setShowAddStock(false);
      loadData();
    } catch (error: any) {
      toast.error(bn ? "আপডেট করা সম্ভব হয়নি" : "Update failed: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && products.length === 0) return (
     <div className="space-y-8 pb-32 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-28 bg-slate-100 dark:bg-white/[0.03] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 dark:bg-white/[0.03] rounded-lg" />)}
        </div>
        <div className="h-96 bg-slate-100 dark:bg-white/[0.03] rounded-lg" />
     </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      
      {/* Welcome Banner / Header */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-lg p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-lg blur-3xl" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"><Box size={120}/></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">📦 {bn ? "ইনভেন্টরি ম্যানেজমেন্ট" : "Inventory Management"}</h1>
            <p className="text-sm text-white/70">{bn ? "স্টক এবং ইনভেন্টরি মুভমেন্ট নিয়ন্ত্রণ করুন" : "Control your stock and inventory movements"}</p>
          </div>
           <button onClick={loadData} className="w-11 h-11 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: bn ? "মোট প্রোডাক্ট" : "Total Products", value: stats.totalProducts, icon: Box, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100 dark:border-orange-500/10" },
           { label: bn ? "মোট স্টক মূল্য" : "Total Stock Value", value: `৳${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-emerald-50 dark:bg-primary/10", border: "border-emerald-100 dark:border-primary/10" },
            { label: bn ? "লো স্টক আইটেম" : "Low Stock Items", value: stats.lowStockItems, icon: AlertCircle, color: "text-gold", bg: "bg-amber-50 dark:bg-gold/10", border: "border-amber-100 dark:border-gold/10" },
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-slate-900/50 border ${stat.border} rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group`}>
               <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
                 <stat.icon size={24} className={stat.color} />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

       {/* Low Stock Items */}
       <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-lg shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-gold/10 flex items-center justify-center"><AlertCircle size={16} className="text-gold"/></div>
          <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "লো স্টক আইটেম" : "Low Stock Items"}</h3><p className="text-[10px] text-slate-400">{bn ? "স্টক ৫ এর নিচে" : "Items with less than 5 units"}</p></div>
        </div>
        <div className="overflow-x-auto min-h-[100px]">
          {lowStockProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <CheckCircle2 className="text-primary" size={32} />
              <p className="text-xs font-semibold text-slate-400">{bn ? "সব ঠিক আছে ✅" : "Everything is in order ✅"}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 dark:border-white/5">
                {[bn ? "প্রোডাক্ট" : "Product", "SKU", bn ? "বর্তমান স্টক" : "Current Stock", bn ? "মিনিমাম" : "Min", bn ? "অ্যাকশন" : "Action"].map((h,i)=>(
                  <th key={i} className={`text-left px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i===4?"text-right":""}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-4"><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{p.name_bn || p.name}</p></td>
                    <td className="px-8 py-4"><span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{p.sku || 'N/A'}</span></td>
                     <td className="px-8 py-4"><span className="px-2 py-1 bg-rose-50 text-rose-600 dark:bg-rose-500/10 rounded-lg text-[10px] font-bold">{p.stock}</span></td>
                     <td className="px-8 py-4 text-xs font-medium text-slate-400">{p.inventory_threshold || 5}</td>
                     <td className="px-8 py-4 text-right">
                       {role !== 'production' && (
                         <button onClick={() => { setSelectedProduct(p); setShowAddStock(true); }} className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 ml-auto shadow-md shadow-primary/20">
                           <Plus size={14} /> {bn ? "স্টক যোগ" : "Add Stock"}
                         </button>
                       )}
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

       {/* Movement Log */}
       <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-lg shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><History size={16} className="text-indigo-600"/></div>
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "স্টক মুভমেন্ট লগ" : "Stock Movement Log"}</h3><p className="text-[10px] text-slate-400">{bn ? "সর্বশেষ কার্যক্রম" : "Latest activities"}</p></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100 dark:border-white/5">
              {[bn ? "তারিখ" : "Date", bn ? "প্রোডাক্ট" : "Product", bn ? "টাইপ" : "Type", bn ? "পরিমাণ" : "Qty", bn ? "নোট" : "Note"].map((h,i)=>(
                <th key={i} className="text-left px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {movements.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 text-xs text-slate-500 font-medium">{new Date(log.created_at).toLocaleDateString(bn ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                   <td className="px-8 py-4"><div><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{log.products?.name_bn || log.products?.name}</p><p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{log.products?.sku}</p></div></td>
                   <td className="px-8 py-4"><span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${log.type === 'in' ? 'bg-emerald-50 text-primary' : 'bg-rose-50 text-rose-600'}`}>{log.type}</span></td>
                  <td className="px-8 py-4"><span className={`text-xs font-bold ${log.type === 'in' ? 'text-primary' : 'text-rose-600'}`}>{log.type === 'in' ? '+' : '-'}{Math.abs(log.quantity)}</span></td>
                  <td className="px-8 py-4 text-xs text-slate-400 max-w-[200px] truncate">{log.note || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Stock Dialog */}
       <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
         <DialogContent className="sm:max-w-md p-0 border-none bg-white dark:bg-slate-950 rounded-lg shadow-2xl">
            <DialogHeader className="p-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"><Plus size={22} /></div>
                 <div>
                    <DialogTitle className="text-lg font-bold">{bn ? "স্টক যোগ করুন" : "Add Stock"}</DialogTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedProduct?.sku}</p>
                 </div>
              </div>
           </DialogHeader>
           
            <form onSubmit={handleAddStock} className="p-8 space-y-6">
               <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "বর্তমান" : "Current"}</p><p className="text-xl font-bold">{selectedProduct?.stock || 0}</p></div>
                  <ArrowRight className="text-slate-300" size={20} />
                  <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{bn ? "নতুন" : "New"}</p><p className="text-xl font-bold text-primary">{(selectedProduct?.stock || 0) + Number(stockAmount)}</p></div>
               </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{bn ? "পরিমাণ *" : "Quantity *"}</label>
                 <input type="number" value={stockAmount} onChange={(e) => setStockAmount(e.target.value)} required min="1" className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-primary/20 text-center" />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{bn ? "নোট (ঐচ্ছিক)" : "Note (Optional)"}</label>
                 <textarea value={stockNote} onChange={(e) => setStockNote(e.target.value)} className="w-full h-24 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold outline-none resize-none" placeholder={bn ? "যেমন: নতুন শিপমেন্ট এসেছে..." : "e.g. New shipment arrived..."} />
              </div>

              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowAddStock(false)} className="flex-1 h-12 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">{bn ? "বাতিল" : "Cancel"}</button>
                 <button type="submit" disabled={updating} className="flex-[2] h-12 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                    {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {bn ? "আপডেট করুন" : "Update Stock"}
                 </button>
              </div>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InventoryManagement() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <InventoryManagementContent />
    </Suspense>
  );
}
