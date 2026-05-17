"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, MessageSquare, Phone, Package, Calendar, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { format } from "date-fns";

import { useSettings } from "@/lib/useSettings";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const orderNumber = searchParams.get("orderNumber");
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const whatsapp = settings?.general_settings?.whatsapp || "8801540707024";

  useEffect(() => {
    setMounted(true);
    if (orderNumber) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();
      
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const isBn = language === "bn";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-xl relative">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400" />
          
          <div className="p-6 md:p-10 text-center">
            {/* Success Icon */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
            >
              {isBn ? "অর্ডার সফল হয়েছে!" : "Order Confirmed!"}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-md mx-auto leading-relaxed"
            >
              {isBn 
                ? "আপনার পছন্দের পণ্যটি শীঘ্রই আপনার হাতে পৌঁছে যাবে। আমাদের সাথে থাকার জন্য ধন্যবাদ।" 
                : "Your order has been placed successfully and is being processed. Thank you for shopping with us!"}
            </motion.p>

            {/* Risk Badge UI */}
            {order?.risk_badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border mb-8 ${
                  order.risk_badge === 'Trusted Buyer' 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                    : order.risk_badge === 'Manual Verified Buyer'
                    ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20"
                    : "bg-slate-50 border-slate-100 text-slate-600 dark:bg-white/5 dark:border-white/10"
                }`}
              >
                <ShieldCheck size={14} className={order.risk_badge === 'Trusted Buyer' ? "text-emerald-500" : "text-amber-500"} />
                <span className="text-[10px] font-black uppercase tracking-widest">{order.risk_badge}</span>
              </motion.div>
            )}

            {/* Customer & Order Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              {/* Shipping Info */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
                  <Package size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isBn ? "শিপিং তথ্য" : "Shipping Info"}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "নাম" : "Customer"}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{order?.customer_name || "---"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "ফোন" : "Phone"}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{order?.phone || "---"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "ঠিকানা" : "Address"}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{order?.address || "---"}</p>
                  </div>
                </div>
              </motion.div>

              {/* Order Info */}
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
                  <Tag size={16} className="text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isBn ? "অর্ডার সামারি" : "Order Summary"}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "অর্ডার আইডি" : "Order ID"}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{order?.order_number || orderNumber}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "পেমেন্ট" : "Payment"}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white uppercase">COD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{isBn ? "সর্বমোট" : "Total"}</p>
                      <p className="text-xl font-black text-emerald-500 leading-none">৳{order?.total?.toLocaleString() || "---"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Items List */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden mb-8"
            >
              <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                <ShoppingBag size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isBn ? "অর্ডার করা পণ্য" : "Ordered Items"}
                </h3>
              </div>
              <div className="max-h-[200px] overflow-y-auto p-4 space-y-4">
                {order?.items?.map((item: any, idx: number) => {
                  const itemQty = Number(item.qty || item.quantity || 1);
                  const itemPrice = Number(item.price || 0);
                  return (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {isBn ? "পরিমাণ" : "Qty"}: {itemQty}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        ৳{(itemPrice * itemQty).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="flex-1 max-w-[240px]">
                <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-bold gap-2 group transition-all">
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                  {isBn ? "আরও কেনিকাটা করুন" : "Continue Shopping"}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="flex-1 max-w-[240px] h-12 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all shadow-sm"
                onClick={() => window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {isBn ? "হোয়াটসঅ্যাপ হেল্প" : "WhatsApp Help"}
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50/50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 p-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              {isBn 
                ? "অর্ডার সংক্রান্ত যে কোনো তথ্যের জন্য আমাদের কল করুন" 
                : "For any queries regarding your order, please call us"}
            </p>
          </div>
        </div>

        {/* Home Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            {isBn ? "হোম পেজে ফিরে যান" : "Back to Home"}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
