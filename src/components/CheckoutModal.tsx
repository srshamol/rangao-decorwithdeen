import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, MapPin, Tag, CheckCircle, Loader2, X, AlertCircle, ShieldCheck, Truck, ShoppingBag, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, TRACKING_EVENTS } from "@/lib/tracking";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: any[];
  total?: number;
  onSuccess?: () => void;
  directCheckout?: boolean;
  fixedProduct?: any;
  initialQuantity?: number;
}



export function CheckoutModal({ 
  isOpen, 
  onClose, 
  items: propItems, 
  total: propSubtotal, 
  onSuccess,
  directCheckout = false,
  fixedProduct,
  initialQuantity = 1
}: CheckoutModalProps) {
  const { language, t } = useLanguage();
  const [quantity, setQuantity] = useState(initialQuantity);

  const items = fixedProduct ? [{
    id: fixedProduct.id,
    name: fixedProduct.name,
    name_bn: fixedProduct.name_bn,
    price: fixedProduct.price,
    image: fixedProduct.images?.[0] || fixedProduct.image,
    quantity: quantity
  }] : propItems || [];

  const subtotal = fixedProduct ? fixedProduct.price * quantity : (propSubtotal || 0);
  
  const SHIPPING_METHODS = [
    { id: "dhaka_inside", label: t("inside_dhaka"), price: 70 },
    { id: "ctg_inside", label: t("inside_ctg"), price: 70 },
    { id: "outside", label: t("outside_dhaka_ctg"), price: 130 },
  ];

  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "", coupon: "" });
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const isCombo = fixedProduct?.is_combo || items.some(i => i.is_combo || i.id === 'p6');
  const deliveryCharge = isCombo ? 0 : shippingMethod.price;
  const total = subtotal + deliveryCharge;

  // Validation States for Micro-interactions
  const isNameValid = useMemo(() => form.name.trim().length > 2, [form.name]);
  const isPhoneValid = useMemo(() => /^01[3-9]\d{8}$/.test(form.phone.trim()), [form.phone]);
  const isAddressValid = useMemo(() => form.address.trim().length > 5, [form.address]);

  // Abandoned Cart Logic: Save as 'incomplete' when user starts typing
  useEffect(() => {
    const saveIncompleteOrder = async () => {
      // Only save if we have basic info and not already submitted
      if (form.name.trim().length > 2 && form.phone.trim().length >= 11 && !success && !submitting && isOpen) {
        try {
          const { error: abandonedError } = await supabase.from("abandoned_carts").upsert({
            phone: form.phone.trim(),
            customer_name: form.name.trim(),
            address: form.address.trim() || "Address Pending",
            items: items.map((i) => ({ 
              id: i.id, 
              name: i.name, 
              image: i.image || (i.images && i.images[0]),
              qty: i.quantity || 1, 
              price: i.price 
            })),
            total_amount: total,
            source_page: window.location.pathname,
            is_recovered: false
          }, { 
            onConflict: 'phone' 
          });

          if (abandonedError) {
            console.warn("Silent Abandoned Cart Error:", abandonedError);
          }
        } catch (e) {
          console.error("Abandoned Cart Save Crash:", e);
        }
      }
    };

    const debounceTimer = setTimeout(saveIncompleteOrder, 2000);
    return () => clearTimeout(debounceTimer);
  }, [form.name, form.phone, form.address, shippingMethod, isOpen, items, total, success, submitting]);

  // Load saved info on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem("rangao_customer_info");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setForm(prev => ({
          ...prev,
          name: parsed.name || "",
          phone: parsed.phone || "",
          address: parsed.address || ""
        }));
      } catch (e) {
        console.error("Error parsing saved info", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError("");
      setCurrentOrderId(null); // Reset for new session
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid || !isPhoneValid || !isAddressValid) {
      setError(t("fill_all_fields"));
      return;
    }

    setSubmitting(true);
    setError("");

    // Save recent info for next time
    localStorage.setItem("rangao_customer_info", JSON.stringify({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim()
    }));

    const orderItems = items.map((i) => ({ 
      id: i.id, 
      name: i.name, 
      qty: i.quantity || 1, 
      price: i.price 
    }));

    const orderData = {
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      district: shippingMethod.label,
      items: orderItems,
      subtotal,
      delivery_charge: deliveryCharge,
      total,
      payment_method: "cod",
      status: "pending",
      coupon_code: form.coupon.trim() || null,
      order_number: await (async () => {
        const now = new Date();
        const ddmmyy = format(now, 'ddMMyy');
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const { count } = await supabase
          .from("orders")
          .select("*", { count: 'exact', head: true })
          .gte("created_at", startOfDay);
        const sequence = (count || 0) + 1;
        return `Order # ${ddmmyy}-${String(sequence).padStart(4, '0')}`;
      })()
    };

    try {
      const { error: dbError } = await supabase.from("orders").insert(orderData);

      if (dbError) {
        console.error("Supabase Order Error:", dbError);
        setError(language === 'bn' ? `অর্ডার সাবমিট করতে সমস্যা হয়েছে: ${dbError.message}` : `Error submitting order: ${dbError.message}`);
        setSubmitting(false);
        return;
      }

      // Mark abandoned cart as recovered
      await supabase
        .from("abandoned_carts")
        .update({ is_recovered: true })
        .eq("phone", form.phone.trim());

      setSubmitting(false);
      setSuccess(true);
      toast.success(t("order_placed_success"));

      trackEvent(TRACKING_EVENTS.PURCHASE, {
        content_ids: items.map(i => i.id),
        value: total,
        currency: "BDT",
        num_items: items.length,
      });

      if (onSuccess) onSuccess();
      // Auto close modal if not direct checkout
      if (!directCheckout) {
        setTimeout(() => {
          onClose();
        }, 5000);
      }
    } catch (err: any) {
      console.error("Order Submit Crash:", err);
      setError(language === 'bn' ? "সিস্টেমে সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "System error. Please try again.");
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (directCheckout) {
    return (
      <div id="checkout-form" className="w-full scroll-mt-24">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success-direct"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-primary text-white rounded-xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <CheckCircle size={40} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-heading text-slate-900">{t("order_placed_success")}</h2>
                <p className="text-sm text-slate-500 font-medium">{t("order_success_msg")}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form-direct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
              {fixedProduct && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                    <img src={fixedProduct.images?.[0] || fixedProduct.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{language === 'bn' ? fixedProduct.name_bn : fixedProduct.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-primary font-black text-sm">৳{fixedProduct.price.toLocaleString()}</span>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-0.5 px-2">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-primary transition-colors font-bold">-</button>
                        <span className="text-[11px] font-black w-4 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-primary transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("full_name_label")}</label>
                    <div className="relative group">
                      <Input 
                        placeholder={t("your_name_placeholder")}
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("phone_number_label")}</label>
                    <div className="relative group">
                      <Input 
                        placeholder="017XXXXXXXX"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm"
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("address_label")}</label>
                  <div className="relative group">
                    <Input 
                      placeholder={t("address_placeholder")}
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm"
                    />
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("delivery_area")}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SHIPPING_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setShippingMethod(method)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                          shippingMethod.id === method.id 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/5" 
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <span className={`text-[10px] font-black text-center leading-tight ${shippingMethod.id === method.id ? 'text-primary' : 'text-slate-500'}`}>{method.label}</span>
                        <span className="text-[11px] font-black text-slate-400">{isCombo ? t("free") : `৳${method.price}`}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("total_payment")}</p>
                    <p className="text-2xl font-black text-primary font-heading leading-none">৳{total.toLocaleString()}</p>
                  </div>
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="h-14 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : t("proceed_to_checkout")}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <VisuallyHidden>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Enter your shipping details to complete your order</DialogDescription>
        </VisuallyHidden>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="py-20 text-center px-10 bg-white/50 dark:bg-slate-900/50"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-8 relative"
              >
                <CheckCircle size={48} className="text-primary" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 rounded-xl bg-primary/20"
                />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 font-heading">{t("thank_you")}</h2>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-6 font-body">
                {t("order_received")}
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
                  {t("rep_contact")}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-h-[92vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col items-center bg-white/50 dark:bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <ShoppingBag className="text-primary" size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-heading">
                  {t("confirm_order")}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-body">
                  {t("cod_info")}
                </p>
                <button 
                  onClick={onClose} 
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50/50 dark:bg-primary/5 rounded-xl border border-emerald-100/50 dark:border-primary/10">
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {t("secure_checkout")}
                  </span>
                </div>

                {/* Customer Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-primary" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t("delivery_info")}</h3>
                  </div>

                  <div className="grid gap-4">
                    <motion.div layout>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 block font-body">{t("full_name_label")} *</label>
                      <div className="relative">
                        <Input
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder={t("your_name_placeholder")}
                          className={`pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 h-12 text-sm font-medium focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${isNameValid ? 'border-primary/50 bg-emerald-50/5 dark:bg-primary/5' : ''}`}
                        />
                        {isNameValid && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div layout>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 block font-body">{t("phone_number_label")} *</label>
                      <div className="relative">
                        <Input
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className={`pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 h-12 text-sm font-medium focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${isPhoneValid ? 'border-primary/50 bg-emerald-50/5 dark:bg-primary/5' : ''}`}
                        />
                        {isPhoneValid && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div layout>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 block font-body">{t("address_label")} *</label>
                      <div className="relative">
                        <textarea
                          value={form.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          placeholder={t("address_placeholder")}
                          className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 h-24 text-sm font-medium focus-visible:ring-primary/20 focus-visible:border-primary transition-all outline-none resize-none font-body ${isAddressValid ? 'border-primary/50 bg-emerald-50/5 dark:bg-primary/5' : ''}`}
                        />
                        {isAddressValid && (
                          <div className="absolute right-3 top-4 text-primary">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Shipping Method Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-primary" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t("shipping_area")}</h3>
                  </div>
                  <div className="grid gap-2.5">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                          shippingMethod.id === method.id 
                          ? "border-primary bg-primary/[0.03] dark:bg-primary/[0.06] ring-4 ring-primary/5 shadow-sm" 
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-4 z-10">
                          <div className={`w-5 h-5 rounded-xl border-2 flex items-center justify-center transition-colors ${
                            shippingMethod.id === method.id ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {shippingMethod.id === method.id && (
                              <div className="w-1.5 h-1.5 rounded-xl bg-white" />
                            )}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${
                            shippingMethod.id === method.id ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          }`}>{method.label}</span>
                        </div>
                        <span className={`text-sm font-black z-10 transition-colors ${
                          shippingMethod.id === method.id ? "text-primary" : "text-slate-500 dark:text-slate-500"
                        }`}>৳{method.price}</span>
                        
                        {/* Subtle background glow on selection */}
                        {shippingMethod.id === method.id && (
                          <motion.div 
                            layoutId="shippingGlow"
                            className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" 
                          />
                        )}
                        <input
                          type="radio"
                          className="hidden"
                          checked={shippingMethod.id === method.id}
                          onChange={() => setShippingMethod(method)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input
                      value={form.coupon}
                      onChange={(e) => updateField("coupon", e.target.value)}
                      placeholder={t("coupon_placeholder")}
                      className="pl-9 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 h-11 text-xs font-bold"
                    />
                  </div>
                  <Button type="button" variant="outline" className="rounded-xl h-11 px-6 text-xs font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
                    {t("apply")}
                  </Button>
                </div>

                {/* Order Summary Card */}
                <div className="rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 p-5 space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shrink-0">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                <ShoppingBag size={20} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name_bn || item.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">৳{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 font-body">{t("subtotal")}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 font-body">{t("delivery_charge")}</span>
                      <span className={`font-bold ${deliveryCharge === 0 ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                        {deliveryCharge === 0 ? t("free") : `৳${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">সর্বমোট</span>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary font-heading leading-none">৳{total.toLocaleString()}</p>
                        <p className="text-[10px] text-primary font-bold mt-1">{t("cash_on_delivery")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1 block font-body">{t("order_note")}</label>
                  <Input
                    value={form.note}
                    onChange={(e) => updateField("note", e.target.value)}
                    placeholder={t("order_note_placeholder")}
                    className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 h-11 text-xs font-medium"
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/20"
                  >
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold leading-tight">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button Section */}
                <div className="space-y-4 pt-2">
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98] relative overflow-hidden group"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span className="relative z-10">{t("confirm_order")}</span>
                        <motion.div 
                          className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[20deg]"
                        />
                      </>
                    )}
                  </Button>

                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xs text-slate-400 font-medium font-body flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-slate-300" />
                      {t("data_safe")}
                    </p>
                    
                    <a 
                      href="https://wa.me/880123456789" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-emerald-700 transition-colors bg-emerald-50 dark:bg-primary/5 px-4 py-2 rounded-xl"
                    >
                      <MessageSquare size={14} />
                      {t("need_help_whatsapp")}
                    </a>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

const Package = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);
