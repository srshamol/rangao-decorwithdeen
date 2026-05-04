"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { districts } from "@/lib/sample-data";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Smartphone, Ticket, KeySquare } from "lucide-react";
import { trackEvent, TRACKING_EVENTS } from "@/lib/tracking";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { language, t } = useLanguage();
  const router = useRouter();
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", address: "", district: "", payment: "cod" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const deliveryCharge = subtotal >= 3000 ? 0 : 80;
  const total = subtotal + deliveryCharge - discount;

  useEffect(() => {
    if (items.length > 0) {
      trackEvent(TRACKING_EVENTS.INITIATE_CHECKOUT, {
        num_items: items.length,
        value: total,
        currency: "BDT",
      });
    }
    checkBlacklist();
  }, []);

  const checkBlacklist = async () => {
    const { data: blockedNumbers } = await supabase.from("blocked_numbers").select("phone");
    if (blockedNumbers?.some((n: any) => n.phone === form.phone)) {
      setIsBlocked(true);
    }
  };

  const handleAbandonedCart = async () => {
    if ((form.phone.trim().length >= 5 || form.name.trim().length >= 3) && items.length > 0) {
      try {
        const { error } = await supabase.from("abandoned_carts").upsert({
          phone: form.phone.trim(),
          customer_name: form.name.trim(),
          address: form.address.trim(),
          items: items.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price, image: i.image })),
          total_amount: total,
          source_page: '/checkout'
        }, { onConflict: 'phone' });
        
        if (error) console.error("Abandoned Cart Save Error:", error);
      } catch (e) {
        console.error("Abandoned Cart Crash:", e);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleAbandonedCart, 2000);
    return () => clearTimeout(timer);
  }, [form.name, form.phone, form.address, items, total]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const { data, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !data) {
      setError(language === 'bn' ? "ভুল কুপন কোড!" : "Invalid coupon code!");
      setDiscount(0);
      return;
    }

    if (subtotal < (data.min_order_amount || 0)) {
      setError(language === 'bn' ? `মিনিমাম ৳${data.min_order_amount} অর্ডার প্রয়োজন!` : `Minimum order ৳${data.min_order_amount} required!`);
      return;
    }

    let discountVal = data.discount_type === 'fixed' ? data.discount_amount : (subtotal * data.discount_amount) / 100;
    if (data.max_discount_amount) discountVal = Math.min(discountVal, data.max_discount_amount);
    
    setDiscount(discountVal);
    setError("");
  };

  const sendOtp = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.district) {
      setError(language === 'bn' ? 'দয়া করে সব প্রয়োজনীয় ঘর পূরণ করুন।' : "Please fill all required fields.");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      setError(language === 'bn' ? 'দয়া করে সঠিক মোবাইল নাম্বার দিন।' : "Please enter a valid Bangladeshi phone number.");
      return;
    }

    // Check if blocked
    const { data: blockedResult } = await supabase.from("blocked_numbers").select("phone").eq("phone", form.phone.trim()).maybeSingle();
    if (blockedResult) {
      setError(language === 'bn' ? "দুঃখিত, আপনার নাম্বারটি ব্লক করা হয়েছে।" : "Sorry, your number is blocked.");
      return;
    }

    // Capture Abandoned Cart immediately before OTP
    try {
      await supabase.from("abandoned_carts").upsert({
        phone: form.phone.trim(),
        customer_name: form.name.trim(),
        items: items.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price, image: i.image })),
        total_amount: total
      }, { onConflict: 'phone' });
    } catch (e) {
      console.error("Cart Capture Error:", e);
    }

    // All validations passed — proceed directly to submit
    // OTP verification is disabled until a real SMS provider is configured
    setOtpStep(true); // Mark as validated
    setError("");
    
    // Auto-submit the form
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    const orderItems = items.map((i) => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price, image: i.image }));

    const { error: dbError } = await supabase.from("orders").insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      district: form.district,
      items: orderItems,
      subtotal,
      delivery_charge: deliveryCharge,
      discount: discount,
      total,
      payment_method: form.payment,
      status: "pending",
    });

    if (dbError) {
      console.error("Supabase Error:", dbError);
      setError(language === 'bn' ? `অর্ডার সাবমিট করতে সমস্যা হয়েছে: ${dbError.message}` : `Error submitting order: ${dbError.message}`);
      setSubmitting(false);
      return;
    }

    // Mark abandoned cart as recovered if exists
    await supabase.from("abandoned_carts").update({ is_recovered: true }).eq("phone", form.phone.trim());

    trackEvent(TRACKING_EVENTS.PURCHASE, {
      content_ids: items.map(i => i.id),
      value: total,
      currency: "BDT",
      num_items: items.length,
    });

    clearCart();
    setSubmitting(false);
    setSuccess(true);
  };

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (items.length === 0 && !success) {
    return (
      <div className="py-20 text-center px-4">
        <p className="text-muted-foreground">{language === 'bn' ? 'আপনার কার্টে কোনো পণ্য নেই।' : 'No items in cart.'}</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/shop">{language === 'bn' ? 'শপে ফিরে যান' : 'Go to Shop'}</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl border-2 border-primary/20 p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400 animate-gradient-x" />
          
          <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30"
            >
              <CheckCircle size={32} strokeWidth={3} />
            </motion.div>
            <div className="absolute inset-0 rounded-xl border-4 border-primary/20 animate-ping" />
          </div>

          <h1 className="text-3xl font-black font-heading text-foreground mb-4">
            {language === 'bn' ? 'অর্ডার সফল হয়েছে! 🎉' : 'Order Successful! 🎉'}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            {language === 'bn' 
              ? 'আপনার অর্ডারটি আমরা পেয়েছি। আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন। আপনার ঘর সাজানোর জন্য রাঙ্গাও-কে বেছে নেওয়ায় ধন্যবাদ।' 
              : 'Thank you for choosing Rangao. Our representative will contact you shortly to confirm your delivery details.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">{language === 'bn' ? 'প্রসেসিং' : 'Processing'}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Support</p>
              <p className="text-sm font-bold text-primary">{language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20">
              <Link href="/">{language === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
              <Link href="/account">{language === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Order'}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto min-h-[60vh]">
      <h1 className="text-2xl font-bold font-heading text-foreground mb-6">💳 {t('checkout')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!otpStep ? (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                {language === 'bn' ? 'কাস্টমার ইনফরমেশন' : 'Customer Information'}
              </h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}</label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={language === 'bn' ? "আপনার নাম" : "Your Name"}
                  className="rounded-xl"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{language === 'bn' ? 'মোবাইল নাম্বার *' : 'Phone Number *'}</label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  onBlur={handleAbandonedCart}
                  placeholder="01XXXXXXXXX"
                  className="rounded-xl"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{language === 'bn' ? 'ঠিকানা *' : 'Address *'}</label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={language === 'bn' ? "সম্পূর্ণ ঠিকানা" : "Full delivery address"}
                  className="rounded-xl"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{language === 'bn' ? 'জেলা *' : 'District *'}</label>
                <select
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-xl border p-5 space-y-3">
              <h2 className="font-heading font-semibold text-foreground">{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</h2>
              {[
                { value: "cod", label: language === 'bn' ? "💵 ক্যাশ অন ডেলিভারি" : "💵 Cash on Delivery", desc: language === 'bn' ? "পণ্য হাতে পেয়ে পেমেন্ট করুন" : "Pay when you receive" },
                { value: "bkash", label: "📱 bKash", desc: language === 'bn' ? "বিকাশ পেমেন্ট" : "Mobile payment" },
                { value: "nagad", label: "📱 Nagad", desc: language === 'bn' ? "নগদ পেমেন্ট" : "Mobile payment" },
              ].map((pm) => (
                <label
                  key={pm.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.payment === pm.value ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.value}
                    checked={form.payment === pm.value}
                    onChange={(e) => updateField("payment", e.target.value)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">{pm.label}</p>
                    <p className="text-xs text-muted-foreground">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Ticket size={18} className="text-primary" />
                {language === 'bn' ? 'ডিসকাউন্ট কুপন' : 'Discount Coupon'}
              </h2>
              <div className="flex gap-2">
                <Input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder={language === 'bn' ? "কুপন কোড দিন" : "Enter coupon code"}
                  className="rounded-xl uppercase"
                />
                <Button type="button" onClick={applyCoupon} variant="secondary" className="rounded-xl font-bold">
                  {language === 'bn' ? 'অ্যাপ্লাই' : 'Apply'}
                </Button>
              </div>
              {discount > 0 && (
                <p className="text-xs text-primary font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> {language === 'bn' ? `আপনি ৳${discount} ডিসকাউন্ট পেয়েছেন!` : `You saved ৳${discount}!`}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-xl border p-5 space-y-3">
              <h2 className="font-heading font-semibold text-foreground">{language === 'bn' ? 'অর্ডার সামারি' : 'Order Summary'}</h2>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === 'bn' ? item.name_bn : item.name} × {item.quantity}</span>
                  <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('delivery')}</span>
                  <span>{deliveryCharge === 0 ? (language === 'bn' ? "ফ্রি" : "Free") : `৳${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>{t('total')}</span>
                  <span className="text-primary">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button type="button" onClick={sendOtp} className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
              {language === 'bn' ? '👉 অর্ডার কনফার্ম করুন' : 'Confirm Order'}
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border-2 border-primary/20 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <KeySquare size={40} className="text-primary" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2">
              {language === 'bn' ? 'ওটিপি (OTP) যাচাই করুন' : 'Verify OTP'}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {language === 'bn' 
                ? `আমরা ${form.phone} নাম্বারে একটি ৪-সংখ্যার ওটিপি পাঠিয়েছি।` 
                : `We've sent a 4-digit code to ${form.phone}.`}
            </p>

            <div className="space-y-6">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="____"
                className="text-center text-3xl font-black tracking-[0.5em] h-20 rounded-xl border-2 border-border focus:border-primary transition-all"
                maxLength={4}
              />
              
              <Button type="submit" disabled={submitting} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                {submitting 
                  ? (language === 'bn' ? "অর্ডার সাবমিট হচ্ছে..." : "Placing Order...") 
                  : (language === 'bn' ? 'ভেরিফাই ও অর্ডার কনফার্ম' : 'Verify & Place Order')}
              </Button>

              <button 
                type="button" 
                onClick={() => setOtpStep(false)}
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-all underline underline-offset-4"
              >
                {language === 'bn' ? 'তথ্য পরিবর্তন করুন' : 'Change Information'}
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-4">
          <AlertTriangle size={14} className="shrink-0 text-gold" />
          <p>
            {language === 'bn' 
              ? "নিরাপত্তার স্বার্থে ফেক অর্ডার মনিটর করা হয়। সঠিক তথ্য দিয়ে আমাদের সহযোগিতা করুন।" 
              : "For security, fake orders are monitored. Please cooperate by providing correct information."}
          </p>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-sm text-destructive font-bold text-center bg-destructive/5 py-2 rounded-xl"
          >
            {error}
          </motion.p>
        )}
      </form>
    </div>
  );
}
