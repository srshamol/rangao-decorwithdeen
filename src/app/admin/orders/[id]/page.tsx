
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronLeft, Calendar, CreditCard, Package, Truck, 
  MapPin, Printer, Phone, MessageSquare, X, 
  CheckCircle2, Clock, History, LayoutDashboard,
  ExternalLink, Copy, Bell, RotateCcw, Pencil,
  AlertCircle, Send, Check, Save, ShieldCheck, Zap, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || "overview";
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  // Delivery/Tracking States
  const [failureReason, setFailureReason] = useState("ঠিকানা পাওয়া যায়নি");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [confirmationNote, setConfirmationNote] = useState("");
  
  // Fraud Check States
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [isFraudChecking, setIsFraudChecking] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id as string)
      .single();

    if (error) {
      toast.error("অর্ডারটি খুঁজে পাওয়া যায়নি");
      router.push("/admin/orders");
    } else {
      setOrder(data);
      setEditData({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email,
        district: data.district,
        address: data.address
      });
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("store_configs")
      .select("value")
      .eq("id", "general_settings")
      .single();
    
    if (data?.value) {
      setSettings(data.value);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchSettings();
    // Auto-print if param is present
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 1000); // Wait for data to render
    }
  }, [id, router]);

  useEffect(() => {
    if (order?.phone) {
      handleFraudCheck(order.phone);
    }
  }, [order?.phone]);

  const updateStatus = async (newStatus: string, label: string, desc: string) => {
    setIsUpdating(true);
    const loadingToast = toast.loading("স্ট্যাটাস আপডেট করা হচ্ছে...");
    
    const newTimelineEvent = {
      status: newStatus,
      label: label,
      time: new Date().toISOString(),
      desc: desc || confirmationNote
    };

    const updatedTimeline = [...(order.timeline || []), newTimelineEvent];

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: newStatus,
        timeline: updatedTimeline
      })
      .eq("id", id);

    if (error) {
      toast.error("আপডেট করা সম্ভব হয়নি", { id: loadingToast });
    } else {
      toast.success("সফলভাবে আপডেট করা হয়েছে", { id: loadingToast });
      setConfirmationNote("");
      fetchOrder();
    }
    setIsUpdating(false);
  };

  const handleCourierBooking = async (courier: string) => {
    const loadingToast = toast.loading(`${courier.toUpperCase()} এ বুক করা হচ্ছে...`);
    try {
      const res = await fetch(`/api/admin/orders/${id}/courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`সফল! ট্র্যাকিং: ${data.trackingNumber}`, { id: loadingToast });
        fetchOrder();
        setActiveTab("tracking");
      } else {
        toast.error(data.message || "বুকিং ব্যর্থ হয়েছে", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const saveCustomerInfo = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update(editData)
      .eq("id", id);

    if (error) {
      toast.error("সেভ করা সম্ভব হয়নি");
    } else {
      toast.success("কাস্টমার তথ্য আপডেট করা হয়েছে");
      setIsEditModalOpen(false);
      fetchOrder();
    }
    setIsUpdating(false);
  };

  const handleFraudCheck = async (phone: string) => {
    if (!phone) return;
    setIsFraudChecking(true);
    try {
      const res = await fetch('/api/admin/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setFraudResult(data);
        if (data.risk_level === 'high') {
          toast.error("সতর্কতা: এই কাস্টমারের ফ্রড রিস্ক অনেক বেশি!", { duration: 5000 });
        }
      } else {
        toast.error(data.message || "Fraud check failed");
      }
    } catch (err: any) {
      console.error("Fraud check error:", err);
    }
    setIsFraudChecking(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      toast.error("রী-ডেলিভারির তারিখ সিলেক্ট করুন");
      return;
    }
    const desc = `ডেলিভারি ব্যর্থ। কারণ: ${failureReason}। পরবর্তী তারিখ: ${rescheduleDate}`;
    updateStatus('on_hold', 'Rescheduled', desc);
  };

  const handleSyncStatus = async () => {
    const loadingToast = toast.loading("কুরিয়ার থেকে লাইভ স্ট্যাটাস আনা হচ্ছে...");
    try {
      const res = await fetch(`/api/admin/orders/${id}/courier/sync`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.updated) {
          toast.success(`স্ট্যাটাস আপডেট করা হয়েছে: ${data.status}`, { id: loadingToast });
          fetchOrder();
        } else {
          toast.info(data.message || "স্ট্যাটাস ইতিমধ্যে আপ-টু-ডেট আছে", { id: loadingToast });
        }
      } else {
        toast.error(data.message || "লাইভ আপডেট আনতে সমস্যা হয়েছে", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const getTrackingUrl = (courier: string, trackingId: string) => {
    if (!trackingId) return null;
    const c = courier?.toLowerCase() || "";
    if (c.includes("steadfast")) return `https://steadfast.com.bd/t/${trackingId}`;
    if (c.includes("pathao")) return `https://pathao.com/courier/tracking?consignment_id=${trackingId}`;
    if (c.includes("redx")) return `https://redx.com.bd/tracking/?trackingId=${trackingId}`;
    if (c.includes("paperfly")) return `https://paperfly-bd.com/tracking?id=${trackingId}`;
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gold/10 text-gold border-gold/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'processing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'shipped': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'delivered': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'on_hold': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const trackingSteps = useMemo(() => {
    const status = order?.status;
    return [
      { label: "পিকআপ", completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) },
      { label: "হাব", completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { label: "পথে", completed: ['shipped', 'delivered'].includes(status), current: status === 'shipped' },
      { label: "আউট ফর ডেলিভারি", completed: ['out_for_delivery', 'delivered'].includes(status), current: status === 'out_for_delivery' },
      { label: "ডেলিভারড", completed: status === 'delivered' },
    ];
  }, [order?.status]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const timeline = Array.isArray(order.timeline) ? order.timeline : [
    { status: 'pending', label: 'Order Placed', time: order.created_at, desc: 'নতুন অর্ডার রিসিভ হয়েছে' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Print-Only Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }
          /* Show the invoice and all its ancestors */
          #invoice-container, 
          #invoice-container *,
          html, body, main, #invoice-container-ancestor {
            visibility: visible !important;
          }
          /* Force hide specific UI elements */
          nav, aside, header, footer, .no-print, button, [role="tablist"] {
            display: none !important;
          }
          /* Position invoice at the top left */
          #invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 20mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Fix for A4 page breaks */
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
          }
        }
      `}} />

      {/* Hidden Invoice Component for Printing */}
      <div id="invoice-container" className="hidden print:block text-slate-900 bg-white min-h-screen font-sans">
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               {settings?.logo ? (
                 <div className="h-10 w-auto flex items-center">
                   <img src={settings.logo} alt="Logo" className="h-full w-auto object-contain" />
                 </div>
               ) : (
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                   <Package className="text-white" size={20} />
                 </div>
               )}
               <div>
                 <h1 className="text-3xl font-black tracking-tighter leading-none text-slate-900">
                   {settings?.store_name || "RANGAO"}
                 </h1>
                 <p className="text-[11px] font-black text-primary tracking-[0.3em] uppercase mt-1">
                   {settings?.store_tagline || "Premium Islamic Decor"}
                 </p>
               </div>
            </div>
            <div className="space-y-1 pl-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Information</p>
              <p className="text-[13px] font-bold text-slate-600">{settings?.address || "Uttara, Dhaka"}</p>
              <p className="text-[13px] font-bold text-slate-600">{settings?.phone || "+880 XXXXX XXXX"}</p>
              <p className="text-[13px] font-bold text-slate-600">{settings?.email || "info@rangao.com"}</p>
            </div>
          </div>
          
          <div className="text-right space-y-6">
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">INVOICE</h3>
              <p className="text-lg font-black text-primary">{order.order_number || `#${order.id.slice(0, 10).toUpperCase()}`}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Invoice To</p>
                <h2 className="text-xl font-black text-slate-900">{order.customer_name}</h2>
                <p className="text-sm font-medium text-slate-500">{order.phone}</p>
                <p className="text-sm font-medium text-slate-500 max-w-[200px] ml-auto">{order.address}, {order.district}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Date Issued</p>
                <p className="text-sm font-black text-slate-900">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                <th className="py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Price</th>
                <th className="py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center w-20">Qty</th>
                <th className="py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any, i: number) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.qty || item.quantity || 0);
                const total = price * qty;
                return (
                  <tr key={i}>
                    <td className="py-6">
                      <p className="text-base font-black text-slate-900">{item.name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">Variant: {item.color || 'Default'}</p>
                    </td>
                    <td className="py-6 text-center font-bold text-slate-600">৳{price.toLocaleString()}</td>
                    <td className="py-6 text-center font-bold text-slate-600">{qty}</td>
                    <td className="py-6 text-right font-black text-slate-900">৳{total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-8 border-t-2 border-slate-900">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="font-black text-slate-900">৳{Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Shipping Fee</span>
              <span className="font-black text-slate-900">৳{Number(order.delivery_charge || 0).toLocaleString()}</span>
            </div>
            {Number(order.discount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Discount</span>
                <span className="font-black text-rose-600">-৳{Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-100">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-primary tracking-tight">৳{Number(order.total || 0).toLocaleString()}</span>
            </div>
            <div className="pt-4 px-4 py-3 bg-slate-50 rounded-xl">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Payment Method</p>
               <p className="text-sm font-black text-slate-900 text-center uppercase">
                 {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method || 'Cash on Delivery'}
               </p>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center space-y-4">
          <div className="flex justify-center gap-12">
             <div className="text-center">
                <div className="w-32 border-b border-slate-200 mb-2 mx-auto"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Signature</p>
             </div>
             <div className="text-center">
                <div className="w-32 border-b border-slate-200 mb-2 mx-auto"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized By</p>
             </div>
          </div>
          <div className="pt-8">
            <p className="text-base font-black text-slate-900">"May Allah bless your home with our products."</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Thank you for shopping with Rangao</p>
          </div>
        </div>
      </div>

      {/* Header (No-Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            ফিরে যান
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">অর্ডার: {order.order_number || order.id.slice(0, 12).toUpperCase()}</h1>
            <Badge className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </Badge>
            {(order.risk_badge || fraudResult?.risk_badge) && (
              <Badge className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border uppercase ${
                (order.risk_badge || fraudResult?.risk_badge) === 'Trusted Buyer' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                (order.risk_badge || fraudResult?.risk_badge) === 'Manual Verified Buyer' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                (order.risk_badge || fraudResult?.risk_badge) === 'COD Risk' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
                {order.risk_badge || fraudResult?.risk_badge}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Clock size={14} />
            তারিখ: {formatDate(order.created_at)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.status !== 'cancelled' && (
            <Button 
              variant="outline" 
              onClick={() => updateStatus('cancelled', 'Cancelled', 'অর্ডারটি ক্যান্সেল করা হয়েছে')}
              disabled={isUpdating}
              className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 h-11 px-6 font-bold gap-2"
            >
              <X size={18} /> ক্যান্সেল
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("tracking")}
            className="rounded-xl border-blue-200 text-blue-500 hover:bg-blue-50 h-11 px-6 font-bold gap-2"
          >
            <Truck size={18} /> ট্র্যাক
          </Button>
          <Button 
            onClick={() => window.print()}
            className="rounded-xl bg-slate-900 text-white hover:bg-black h-11 px-8 font-black gap-2 shadow-xl shadow-slate-200"
          >
            <Printer size={18} /> প্রিন্ট
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} className="space-y-8" onValueChange={setActiveTab}>
        <div className="border-b border-slate-100 dark:border-white/5 pb-px">
          <TabsList className="bg-transparent h-12 p-0 gap-8 overflow-x-auto flex-nowrap scrollbar-hide">
            {[
              { id: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
              { id: "confirmation", label: "কনফার্মেশন", icon: CheckCircle2 },
              { id: "courier", label: "কুরিয়ার", icon: Send },
              { id: "tracking", label: "ট্র্যাকিং", icon: MapPin },
              { id: "delivery", label: "ডেলিভারি", icon: Truck },
              { id: "history", label: "হিস্টোরি", icon: History },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-xl h-12 px-0 text-sm font-bold text-slate-500 transition-all gap-2"
              >
                <tab.icon size={16} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "তারিখ", value: formatDate(order.created_at), icon: Calendar },
                  { label: "পেমেন্ট মেথড", value: order.payment_method === 'cod' ? 'কাশ অন ডেলিভারি' : order.payment_method, icon: CreditCard },
                  { label: "পেমেন্ট স্ট্যাটাস", value: order.payment_status || 'Unpaid', icon: CheckCircle2 },
                  { label: "টোটাল", value: `৳${order.total}`, icon: Package, color: "text-primary" },
                ].map((item, i) => (
                  <Card key={i} className="border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <item.icon size={12} />
                        {item.label}
                      </div>
                      <div className={`text-sm font-black ${item.color || 'text-slate-900 dark:text-white'}`}>
                        {item.value}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Analysis */}
                <Card className="lg:col-span-1 border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden relative">
                  {(order.risk_score || fraudResult?.risk_score) !== undefined && (
                    <div className="absolute top-0 right-0 p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${
                        (order.risk_score || fraudResult?.risk_score) >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                        (order.risk_score || fraudResult?.risk_score) >= 50 ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>
                        {order.risk_score || fraudResult?.risk_score}%
                      </div>
                    </div>
                  )}
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight">রিস্ক এনালাইসিস</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Courier Success Profile</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">মোট ডেলিভারি</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {fraudResult?.details?.delivered_orders ?? (order.risk_score ? 'N/A' : '...')}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ক্যান্সেল/রিটার্ন</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {fraudResult?.details ? (fraudResult.details.cancelled_orders + fraudResult.details.returned_orders) : (order.risk_score ? 'N/A' : '...')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OTP ভেরিফিকেশন</p>
                        {order.otp_verified ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                            <Check size={12} strokeWidth={3} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                            <X size={12} strokeWidth={3} /> Not Verified
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Success Probability</p>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{order.risk_score || fraudResult?.risk_score || 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${order.risk_score || fraudResult?.risk_score || 0}%` }}
                            className={`h-full ${
                              (order.risk_score || fraudResult?.risk_score) >= 80 ? 'bg-emerald-500' :
                              (order.risk_score || fraudResult?.risk_score) >= 50 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {order.system_recommendation && (
                      <div className={`mt-6 p-4 rounded-xl border ${
                        order.system_recommendation.includes('TRUSTED') 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-500/10 dark:text-emerald-400' 
                          : order.system_recommendation.includes('ALERT') || order.system_recommendation.includes('RISK')
                          ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-500/5 dark:border-rose-500/10 dark:text-rose-400'
                          : 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-500/5 dark:border-amber-500/10 dark:text-amber-400'
                      }`}>
                        <div className="flex items-center gap-3 mb-1">
                          <Zap size={14} className="animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">System Recommendation</p>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{order.system_recommendation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card className="lg:col-span-1 border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black tracking-tight">কাস্টমার ইনফরমেশন</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsEditModalOpen(true)}
                        className="rounded-xl bg-slate-50 text-slate-400 hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">নাম</p>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">{order.customer_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ফোন</p>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">{order.phone}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ইমেইল</p>
                          <p className="text-sm font-bold text-slate-500 truncate">{order.email || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">জেলা</p>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">{order.district || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ঠিকানা</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{order.address}</p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                              <Globe size={18} />
                           </div>
                           <div className="flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Device Intelligence</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                                 {order.ip_address || "No IP logged"}
                              </p>
                           </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">User Agent</p>
                           <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                              {order.user_agent || "No device metadata available"}
                           </p>
                        </div>
                      </div>

                      {/* Fraud Check Result Badge */}
                      {fraudResult && (
                        <div className={`p-4 rounded-xl border ${
                          fraudResult.risk_level === 'high' ? 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' :
                          fraudResult.risk_level === 'medium' ? 'bg-amber-50 border-amber-100 dark:bg-gold/10 dark:border-gold/20' :
                          'bg-emerald-50 border-emerald-100 dark:bg-primary/10 dark:border-primary/20'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={14} className={
                                fraudResult.risk_level === 'high' ? 'text-rose-500' :
                                fraudResult.risk_level === 'medium' ? 'text-gold' :
                                'text-primary'
                              } />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">ফ্রড চেক (BD Courier)</span>
                            </div>
                            <Badge className={`text-[9px] font-black uppercase tracking-tighter ${
                              fraudResult.risk_level === 'high' ? 'bg-rose-500 text-white' :
                              fraudResult.risk_level === 'medium' ? 'bg-gold text-white' :
                              'bg-primary text-white'
                            }`}>
                              {fraudResult.risk_level === 'high' ? 'High Risk' :
                               fraudResult.risk_level === 'medium' ? 'Medium Risk' : 'Safe'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Success Ratio</p>
                              <p className={`text-sm font-black ${
                                parseFloat(fraudResult.summary?.success_ratio) < 70 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'
                              }`}>{fraudResult.summary?.success_ratio || '0'}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Parcels</p>
                              <p className="text-sm font-black text-slate-700 dark:text-slate-300">{fraudResult.summary?.total_parcel || 0}</p>
                            </div>
                          </div>
                          {fraudResult.reports?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
                              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">Negative Reports: {fraudResult.reports.length}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{fraudResult.reports[0].details}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!fraudResult && isFraudChecking && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-xl h-4 w-4 border-2 border-primary border-t-transparent" />
                          <span className="text-xs font-bold text-slate-400">ফ্রড চেক করা হচ্ছে...</span>
                        </div>
                      )}

                      {!fraudResult && !isFraudChecking && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleFraudCheck(order.phone)}
                          className="w-full rounded-xl border-slate-200 dark:border-white/10 h-10 font-bold text-[11px] gap-2"
                        >
                          <AlertCircle size={14} /> ফ্রড চেক করুন
                        </Button>
                      )}
                      <div className="pt-2 flex items-center gap-3">
                        <Button 
                          onClick={() => window.open(`tel:${order.phone}`)}
                          className="flex-1 rounded-xl bg-primary hover:bg-primary text-white font-bold h-11 gap-2"
                        >
                          <Phone size={16} /> কল
                        </Button>
                        <Button 
                          onClick={() => window.open(`https://wa.me/88${order.phone}?text=Hello ${order.customer_name}, Your order ${order.id.slice(0, 8)} at Rangao is being processed.`)}
                          className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold h-11 gap-2"
                        >
                          <MessageSquare size={16} /> WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Table */}
                <Card className="lg:col-span-2 border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-8 pb-4">
                      <h3 className="text-lg font-black tracking-tight">প্রোডাক্ট ইনফরমেশন</h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                          <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">প্রোডাক্ট</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">ইউনিট প্রাইস</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">পরিমাণ</TableHead>
                          <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">টোটাল</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item: any, idx: number) => {
                          const quantity = item.quantity || item.qty || 1;
                          const price = Number(item.price) || 0;
                          return (
                            <TableRow key={idx} className="border-slate-50 dark:border-white/5 hover:bg-slate-50/30 dark:hover:bg-white/[0.01]">
                              <TableCell className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex-shrink-0">
                                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />}
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.variant || 'Standard'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-bold text-slate-600 dark:text-slate-400">৳{price}</TableCell>
                              <TableCell className="text-sm font-bold text-slate-900 dark:text-white">{quantity}x</TableCell>
                              <TableCell className="px-8 py-4 text-right text-sm font-black text-slate-900 dark:text-white">৳{price * quantity}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="p-8 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex justify-between w-full max-w-[240px] text-sm">
                           <span className="text-slate-400 font-bold">সাবটোটাল</span>
                           <span className="font-black text-slate-700 dark:text-slate-300">৳{order.subtotal || order.total - (order.delivery_charge || 0)}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-[240px] text-sm">
                           <span className="text-slate-400 font-bold">ডেলিভারি চার্জ</span>
                           <span className="font-black text-slate-700 dark:text-slate-300">+ ৳{order.delivery_charge || 0}</span>
                        </div>
                        <div className="w-full max-w-[240px] h-px bg-slate-200 dark:bg-white/10 my-2" />
                        <div className="flex justify-between w-full max-w-[240px] text-lg font-black text-primary">
                          <span>মোট</span>
                          <span>৳{order.total}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="confirmation" className="mt-0">
               {order.status !== 'pending' ? (
                 <Card className="border-slate-100 dark:border-white/5 rounded-xl p-12 text-center space-y-6 bg-slate-50/30 dark:bg-white/[0.01]">
                   <div className="w-20 h-20 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                      <Check size={40} strokeWidth={3} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black">অর্ডারটি কনফার্ম করা হয়েছে</h3>
                      <p className="text-slate-400 text-sm font-medium">এই অর্ডারটি বর্তমানে {order.status} পর্যায়ে আছে।</p>
                   </div>
                   <Button onClick={() => setActiveTab("courier")} className="rounded-xl bg-primary text-white px-8 h-12 font-black text-xs gap-2">
                     কুরিয়ার সেকশনে যান <Send size={16} />
                   </Button>
                 </Card>
               ) : (
                 <Card className="border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden">
                    <div className="bg-primary/10 p-8 border-b border-primary/10">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-primary">অর্ডার কনফার্ম করুন</h3>
                             <p className="text-primary/60 text-xs font-bold uppercase tracking-widest">Verify information and move to processing</p>
                          </div>
                       </div>
                    </div>
                    <CardContent className="p-8 space-y-8">
                       <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">অর্ডার আইডি ও কাস্টমার</p>
                             <p className="text-sm font-black">{order.id.slice(0, 12).toUpperCase()} — {order.customer_name}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">টোটাল ও পেমেন্ট</p>
                             <p className="text-sm font-black text-primary">৳{order.total} • {order.payment_method === 'cod' ? 'কাশ অন ডেলিভারি' : 'অনলাইন পেমেন্ট'}</p>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Pencil size={12} /> নোট (ঐচ্ছিক)
                          </label>
                          <textarea 
                            value={confirmationNote}
                            onChange={(e) => setConfirmationNote(e.target.value)}
                            placeholder="অর্ডার সম্পর্কে কোনো বিশেষ নোট থাকলে এখানে লিখুন..."
                            className="w-full min-h-[120px] p-6 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-sm font-medium resize-none"
                          />
                       </div>

                       <div className="flex items-center gap-4 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => updateStatus('cancelled', 'Cancelled', 'অর্ডারটি রিজেক্ট করা হয়েছে')}
                            disabled={isUpdating}
                            className="flex-1 h-14 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-xs gap-2"
                          >
                             <X size={18} /> ক্যান্সেল করুন
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => updateStatus('on_hold', 'On Hold', 'অর্ডারটি হোল্ডে রাখা হয়েছে')}
                            disabled={isUpdating}
                            className="flex-1 h-14 rounded-xl border-slate-200 text-slate-400 font-black uppercase tracking-widest text-xs gap-2"
                          >
                             <Clock size={18} /> হোল্ড করুন
                          </Button>
                          <Button 
                            onClick={() => updateStatus('confirmed', 'Confirmed', 'অর্ডারটি কনফার্ম করা হয়েছে')}
                            disabled={isUpdating}
                            className="flex-[2] h-14 rounded-xl bg-slate-900 text-white hover:bg-black font-black uppercase tracking-[0.2em] text-xs gap-2 shadow-xl shadow-slate-200"
                          >
                             <Check size={18} strokeWidth={3} /> কনফার্ম অর্ডার
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               )}
            </TabsContent>

            <TabsContent value="courier" className="mt-0">
               {!order.tracking_number ? (
                 <Card className="border-slate-100 dark:border-white/5 rounded-xl p-12 text-center space-y-8 bg-slate-50/30 dark:bg-white/[0.01]">
                   <div className="space-y-2">
                     <h3 className="text-xl font-black">কুরিয়ার সিলেক্ট করুন</h3>
                     <p className="text-slate-400 text-sm font-medium">অর্ডারটি ডেলিভারি করার জন্য আপনার পছন্দের কুরিয়ার সার্ভিসটি বেছে নিন।</p>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                     {['Steadfast', 'Pathao', 'RedX', 'Paperfly'].map((courier) => (
                       <Button 
                        key={courier} 
                        variant="outline" 
                        onClick={() => handleCourierBooking(courier.toLowerCase())}
                        disabled={isUpdating}
                        className="h-32 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-primary hover:bg-primary/5 transition-all flex flex-col gap-3 group shadow-sm"
                       >
                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Truck className="text-slate-400 group-hover:text-primary" />
                          </div>
                          <span className="font-black text-sm tracking-tight">{courier}</span>
                       </Button>
                     ))}
                   </div>
                 </Card>
               ) : (
                 <Card className="border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden">
                   <div className="bg-primary p-8 text-white flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">বুকিং সম্পন্ন হয়েছে</h3>
                          <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Order has been successfully dispatched</p>
                        </div>
                      </div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
                        Booked
                      </Badge>
                   </div>
                   <CardContent className="p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                          { label: "কুরিয়ার নেম", value: order.courier_name?.toUpperCase() || 'N/A', icon: Truck },
                          { label: "পার্সেল আইডি", value: order.id.slice(0, 8).toUpperCase(), icon: Package },
                          { label: "ট্র্যাকিং নম্বর", value: order.tracking_number, icon: MapPin, canCopy: true },
                          { label: "বুকিং সময়", value: formatDate(order.created_at), icon: Clock },
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                               <item.icon size={12} />
                               {item.label}
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-base font-black text-slate-800 dark:text-slate-200">{item.value}</span>
                               {item.canCopy && (
                                 <button onClick={() => {
                                   navigator.clipboard.writeText(item.value);
                                   toast.success("কপি করা হয়েছে");
                                 }} className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                   <Copy size={14} />
                                 </button>
                               )}
                             </div>
                          </div>
                        ))}
                     </div>
                   </CardContent>
                 </Card>
               )}
            </TabsContent>

            <TabsContent value="tracking" className="space-y-8 mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50">
                    <CardContent className="p-8 space-y-12">
                       <div className="flex items-center justify-between">
                         <h3 className="text-lg font-black tracking-tight">শিপমেন্ট প্রোগ্রেস</h3>
                         <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              onClick={handleSyncStatus}
                              className="rounded-xl border-slate-200 h-10 font-bold gap-2 text-xs"
                            >
                              <RotateCcw size={14} /> লাইভ স্ট্যাটাস চেক
                            </Button>
                            <Button className="rounded-xl bg-primary text-white h-10 font-bold gap-2 text-xs">
                              <Bell size={14} /> কাস্টমারকে নোটিফাই
                            </Button>
                         </div>
                       </div>

                       {/* Progress Steps */}
                       <div className="relative pt-8 pb-4">
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-white/5 -translate-y-1/2 rounded-xl" />
                          <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-xl transition-all duration-1000" style={{ 
                            width: `${(trackingSteps.filter(s => s.completed).length / trackingSteps.length) * 100}%` 
                          }} />
                          <div className="flex justify-between items-center relative">
                             {trackingSteps.map((step, i) => (
                               <div key={i} className="flex flex-col items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-900 transition-all z-10 ${
                                    step.completed ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                                  }`}>
                                     {step.completed ? <Check size={18} strokeWidth={4} /> : <div className="w-2 h-2 rounded-xl bg-slate-300" />}
                                     {step.current && (
                                       <div className="absolute inset-0 rounded-xl border-4 border-primary animate-ping opacity-50" />
                                     )}
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {step.label}
                                  </span>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Tracking Details Grid */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">কুরিয়ার</p>
                             <p className="text-sm font-black text-slate-800 dark:text-slate-200">{order.courier_name?.toUpperCase() || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ট্র্যাকিং নম্বর</p>
                             <div className="flex items-center gap-2">
                                <a 
                                  href={getTrackingUrl(order.courier_name, order.tracking_number) || "#"} 
                                  target="_blank"
                                  className="text-sm font-black text-slate-800 dark:text-slate-200 underline decoration-primary/30 hover:text-primary transition-colors"
                                >
                                  {order.tracking_number || 'N/A'}
                                </a>
                                {order.tracking_number && (
                                  <button onClick={() => {
                                    navigator.clipboard.writeText(order.tracking_number);
                                    toast.success("কপি করা হয়েছে");
                                  }} className="text-slate-400 hover:text-primary"><Copy size={12}/></button>
                                )}
                             </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">স্ট্যাটাস</p>
                             <Badge className="bg-indigo-500 text-white border-none rounded-xl text-[9px] font-black uppercase tracking-tighter">
                               {order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'In Transit' : 'Processing'}
                             </Badge>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">শেষ আপডেট</p>
                             <p className="text-sm font-bold text-slate-500">{formatDate(order.created_at)}</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 {/* Vertical Event Log */}
                 <Card className="lg:col-span-1 border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50">
                    <CardContent className="p-8 space-y-6">
                       <h3 className="text-lg font-black tracking-tight">ট্র্যাকিং টাইমলাইন</h3>
                       <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                          {timeline.slice().reverse().map((event: any, i: number) => (
                            <div key={i} className="flex gap-6 relative">
                               <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 z-10 shrink-0 ${getStatusColor(event.status).split(' ')[0].replace('bg-', '') === 'bg-slate-500/10' ? 'bg-slate-400' : getStatusColor(event.status).split(' ')[0]}`}>
                                  {event.status === 'delivered' ? <Check size={12} /> : <Clock size={12} />}
                               </div>
                               <div className="space-y-1">
                                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{event.label || event.status}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={10} /> {formatDate(event.time)}
                                  </p>
                                  {event.desc && <p className="text-xs font-medium text-slate-500">{event.desc}</p>}
                               </div>
                            </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
               </div>
            </TabsContent>

            <TabsContent value="delivery" className="mt-0 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden group">
                    <CardContent className="p-12 text-center space-y-6 bg-emerald-50/50 dark:bg-primary/5 transition-colors">
                       <div className="w-20 h-20 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform">
                          <Check size={40} strokeWidth={3} />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-xl font-black">ডেলিভারি কনফার্ম করুন</h3>
                          <p className="text-slate-500 text-sm font-medium">কাস্টমার পণ্যটি হাতে পেয়েছে এবং পেমেন্ট সম্পন্ন করেছে?</p>
                       </div>
                       <Button 
                        onClick={() => updateStatus('delivered', 'Delivered', 'অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে')}
                        disabled={isUpdating}
                        className="w-full h-16 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-slate-300"
                       >
                         ✅ ডেলিভারি সম্পন্ন
                       </Button>
                    </CardContent>
                 </Card>

                 <Card className="border-rose-100 dark:border-rose-500/10 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden border-2 border-dashed">
                    <CardContent className="p-8 space-y-6">
                       <div className="flex items-center gap-3 text-rose-500">
                          <AlertCircle size={24} />
                          <h3 className="text-lg font-black tracking-tight">ডেলিভারি ব্যর্থ</h3>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ব্যর্থতার কারণ</label>
                            <select 
                              value={failureReason}
                              onChange={(e) => setFailureReason(e.target.value)}
                              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border-none text-sm font-bold focus:ring-2 focus:ring-rose-500/20"
                            >
                               <option>ঠিকানা পাওয়া যায়নি</option>
                               <option>কাস্টমার ফোন ধরেনি</option>
                               <option>পণ্য প্রত্যাখ্যান</option>
                               <option>অন্যান্য</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">রী-ডেলিভারির তারিখ</label>
                            <input 
                              type="date" 
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border-none text-sm font-bold focus:ring-2 focus:ring-rose-500/20" 
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <Button 
                              variant="outline" 
                              onClick={handleReschedule}
                              disabled={isUpdating}
                              className="flex-1 rounded-xl border-slate-200 h-12 font-black text-xs gap-2"
                            >
                              <RotateCcw size={16} /> রী-শিডিউল
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => window.open(`tel:${order.phone}`)}
                              className="flex-1 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 h-12 font-black text-xs gap-2"
                            >
                              <Phone size={16} /> কাস্টমারকে কল
                            </Button>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
               <Card className="border-slate-100 dark:border-white/5 rounded-xl shadow-xl shadow-slate-100/50 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <h3 className="text-lg font-black tracking-tight">অর্ডার হিস্টোরি</h3>
                  </div>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                          <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">তারিখ ও সময়</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">অ্যাকশন / স্ট্যাটাস</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">নোট</TableHead>
                          <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">অ্যাডমিন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeline.slice().reverse().map((event: any, i: number) => (
                          <TableRow key={i} className="border-slate-50 dark:border-white/5">
                            <TableCell className="px-8 py-5 text-sm font-bold text-slate-500">{formatDate(event.time)}</TableCell>
                            <TableCell className="py-5">
                               <Badge className={`px-3 py-1 rounded-xl text-[9px] font-black tracking-widest border uppercase ${getStatusColor(event.status)}`}>
                                 {event.label || event.status}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{event.desc || 'N/A'}</TableCell>
                            <TableCell className="px-8 py-5 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <div className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black">R</div>
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
               </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="rounded-xl p-8 max-w-md border-slate-100 dark:border-white/5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">কাস্টমার তথ্য এডিট করুন</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">নাম</Label>
              <Input value={editData.customer_name} onChange={(e) => setEditData({...editData, customer_name: e.target.value})} className="rounded-xl border-slate-100 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ফোন</Label>
              <Input value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="rounded-xl border-slate-100 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ইমেইল</Label>
              <Input value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="rounded-xl border-slate-100 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">জেলা</Label>
              <Input value={editData.district} onChange={(e) => setEditData({...editData, district: e.target.value})} className="rounded-xl border-slate-100 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ঠিকানা</Label>
              <Input value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} className="rounded-xl border-slate-100 h-12 font-bold" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-12 px-8 font-black text-xs">বাতিল</Button>
            <Button onClick={saveCustomerInfo} disabled={isUpdating} className="rounded-xl h-12 px-8 bg-primary text-white font-black text-xs gap-2">
              <Save size={16} /> সেভ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
