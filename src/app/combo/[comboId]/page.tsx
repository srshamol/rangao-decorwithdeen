"use client"; // Deployment Sync Trigger

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingCart, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Clock, 
  Check, 
  Play, 
  Zap,
  TrendingUp,
  StarHalf,
  ArrowRight,
  User,
  Heart,
  Lock,
  ChevronLeft,
  Sparkles,
  TrendingDown,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/CheckoutModal";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export default function ComboLandingPage() {
  const { comboId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { addItem } = useCart();
  const [relatedCombos, setRelatedCombos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCombo() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_combo", true)
        .or(`id.eq.${comboId},slug.eq.${comboId}`)
        .single();

      if (data) {
        setProduct(data);
        const { data: others } = await supabase
          .from("products")
          .select("*")
          .eq("is_combo", true)
          .neq("id", data.id)
          .limit(4);
        if (others) setRelatedCombos(others);
      }
      setLoading(false);
    }
    fetchCombo();
  }, [comboId]);

  useEffect(() => {
    if (!product?.landing_page_config) return;
    const config = product.landing_page_config;

    // SEO Meta Management
    if (config.seo_title) document.title = config.seo_title;
    if (config.seo_description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', config.seo_description);
    }

    // Tracking Pixels & Scripts
    const cleanup: (() => void)[] = [];

    // Facebook Pixel
    if (config.facebook_pixel_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      cleanup.push(() => document.head.removeChild(script));
    }

    // TikTok Pixel
    if (config.tiktok_pixel_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${config.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
      cleanup.push(() => document.head.removeChild(script));
    }

    // Google Tag Manager (GTM)
    if (config.gtm_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${config.gtm_id}');
      `;
      document.head.appendChild(script);
      cleanup.push(() => document.head.removeChild(script));
    }

    // GA4
    if (config.ga4_id) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4_id}`;
      document.head.appendChild(script1);
      
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.ga4_id}');
      `;
      document.head.appendChild(script2);
      
      cleanup.push(() => {
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      });
    }

    // Custom CSS Injection
    if (config.custom_css) {
      const style = document.createElement('style');
      style.innerHTML = config.custom_css;
      document.head.appendChild(style);
      cleanup.push(() => document.head.removeChild(style));
    }

    // Header Scripts Injection
    if (config.header_scripts) {
      const div = document.createElement('div');
      div.innerHTML = config.header_scripts;
      const scripts = div.querySelectorAll('script');
      scripts.forEach(s => {
        const newScript = document.createElement('script');
        if (s.src) newScript.src = s.src;
        newScript.innerHTML = s.innerHTML;
        document.head.appendChild(newScript);
        cleanup.push(() => document.head.removeChild(newScript));
      });
    }

    return () => cleanup.forEach(c => c());
  }, [product]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
       <h1 className="text-2xl font-bold text-slate-900">পণ্যটি পাওয়া যায়নি</h1>
       <Button asChild>
         <Link href="/combo">সব কম্বো দেখুন</Link>
       </Button>
    </div>
  );

  const images = product.images || ["/placeholder.jpg"];
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const config = product.landing_page_config || {};
  const bn = true;
  const includedItems = config.included_products || [];

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, name_bn: product.name_bn, price: product.price, image: images[0] }, 1);
    toast.success("কার্টে যোগ করা হয়েছে");
  };

  const handleOrderNow = () => {
    setIsCheckoutOpen(true);
  };

  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  useEffect(() => {
    if (config.show_countdown !== false && config.countdown_timer) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date();
        target.setHours(target.getHours() + (config.countdown_timer.hours || 2));
        target.setMinutes(target.getMinutes() + (config.countdown_timer.minutes || 0));
        target.setHours(target.getHours() + (config.countdown_timer.hours || 0));
        target.setMinutes(target.getMinutes() + (config.countdown_timer.minutes || 1));
        target.setSeconds(target.getSeconds() + (config.countdown_timer.seconds || 0));
        
        const distance = target.getTime() - now;
        if (distance < 0) {
          setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
          clearInterval(timer);
          return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [config.countdown_timer, config.show_countdown]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] pb-24 font-sans">
      <div className="bg-[#064E3B] text-white py-2.5 px-4 overflow-hidden relative">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] md:text-sm font-medium">
          <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-amber-400 animate-pulse" />
             {config.top_banner_text || (bn ? "রমজান অফার! সকল কম্বোতে ৪০% পর্যন্ত ছাড় চলছে" : "Ramadan Offer! Up to 40% discount on all combos")}
          </div>
          <div className="flex items-center gap-4 text-[10px] md:text-xs opacity-90">
             <span className="flex items-center gap-1">সাহায্য প্রয়োজন? <a href="tel:01712345678" className="font-bold">০১৭১২-৩৪৫৬৭৮</a></span>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
             <Link href="/" className="hover:text-primary flex items-center gap-1"><div className="w-5 h-5 flex items-center justify-center"><RefreshCw size={14} className="rotate-45" /></div>হোম</Link>
             <ChevronRight size={14} className="text-slate-300" />
             <Link href="/combo" className="hover:text-primary">কম্বো অফার</Link>
             <ChevronRight size={14} className="text-slate-300" />
             <span className="text-slate-400 font-normal">{bn ? product.name_bn : product.name}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-slate-100 group">
              <AnimatePresence mode="wait">
                <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              </AnimatePresence>
              {discount > 0 && <div className="absolute top-4 left-4 bg-[#064E3B] text-white font-bold text-xs px-3 py-1.5 rounded-lg z-10">{discount}% OFF</div>}
              <button onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-all z-20"><ChevronLeft size={20} /></button>
              <button onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-all z-20"><ChevronRight size={20} /></button>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded z-10">{activeImage + 1} / {images.length}</div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center"><div className="px-3 py-1 bg-emerald-50 text-[#064E3B] rounded-full text-xs font-bold border border-emerald-100">বেস্ট সেলার</div><div className="flex items-center gap-2 text-slate-600 text-xs font-bold"><TrendingUp size={16} className="text-orange-500 fill-orange-500" />১৬০+ জন এই কম্বোটি কিনেছেন</div></div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{config.hero_title || (bn ? product.name_bn : product.name)}</h1>
              <div className="flex items-center gap-4 flex-wrap"><div className="flex items-center gap-1 text-amber-400">{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= 4 ? "currentColor" : "none"} strokeWidth={s <= 4 ? 0 : 2} />)}</div><span className="text-base font-bold text-slate-900">4.8</span><span className="text-slate-400 text-xs font-medium">({(config.reviews?.length || 120)} রিভিউ)</span><div className="h-4 w-[1px] bg-slate-200" /><div className="text-xs font-medium text-slate-400 uppercase tracking-wider">SKU: <span className="text-slate-900">{product.sku || "RC-001"}</span></div></div>
            </div>

            <div className="bg-[#F0FDF4] border border-emerald-50 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[#065F46] leading-tight mb-1">{bn ? "আল্লাহর স্মরণে সাজান আপনার ঘর" : "Decorate your home in remembrance of Allah"}</h3>
              <p className="text-sm font-medium text-emerald-800/70">{config.hero_desc || (bn ? "ইসলামিক এটি প্রিমিয়াম প্রোডাক্টের পারফেক্ট কম্বো" : "The perfect combo of premium Islamic products")}</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-4xl font-bold text-[#064E3B]">৳ {product.price}</span>
              {product.old_price && <span className="text-xl font-medium text-slate-300 line-through">৳ {product.old_price}</span>}
              {discount > 0 && <div className="bg-[#DCFCE7] text-[#166534] px-4 py-2 rounded-lg text-xs font-bold border border-emerald-50">আপনি সেভ করছেন ৳ {product.old_price - product.price} ({discount}%)</div>}
            </div>

            {config.show_countdown !== false && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                <div className="flex items-center gap-4 relative z-10"><div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center animate-bounce-slow"><Clock size={24} /></div><div><h4 className="font-black text-slate-900 text-base">{bn ? "অফার শেষ হতে বাকি" : "Offer Ends In"}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "দ্রুত অর্ডার করুন!" : "Order fast before it ends!"}</p></div></div>
                <div className="flex gap-3 relative z-10">{[{ v: timeLeft.hours, l: bn ? "ঘণ্টা" : "HRS" }, { v: timeLeft.minutes, l: bn ? "মিনিট" : "MIN" }, { v: timeLeft.seconds, l: bn ? "সেকেন্ড" : "SEC" }].map((time, i) => (<div key={i} className="flex flex-col items-center"><div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg">{time.v}</div><span className="text-[9px] font-bold text-slate-400 mt-2 tracking-widest">{time.l}</span></div>))}</div>
              </div>
            )}

            <div className="grid grid-cols-4 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
               {[{ icon: Truck, l: "ফ্রি ডেলিভারি", s: "৳৯৯৯+ অর্ডারে" }, { icon: RefreshCw, l: "৭ দিন রিটার্ন", s: "সহজ রিটার্ন পলিসি" }, { icon: CreditCard, l: "ক্যাশ অন ডেলিভারি", s: "সারা বাংলাদেশে" }, { icon: ShieldCheck, l: "নিরাপদ পেমেন্ট", s: "SSL এনক্রিপ্টেড" }].map((f, i) => (<div key={i} className={`p-4 flex flex-col items-center text-center space-y-2 ${i < 3 ? 'border-r border-slate-100' : ''}`}><f.icon size={20} className="text-primary" /><div><p className="text-[11px] font-bold text-slate-900">{f.l}</p><p className="text-[9px] font-medium text-slate-400">{f.s}</p></div></div>))}
            </div>

            <div className="space-y-3 pt-2">
               <Button onClick={handleOrderNow} className="w-full h-14 rounded-lg bg-[#064E3B] hover:bg-[#053F30] text-white font-bold text-lg gap-2 active:scale-[0.98] transition-all"><Zap size={20} className="fill-white" />{config.checkout_button_text || (bn ? "এখনি অর্ডার করুন" : "ORDER NOW")}</Button>
               <Button onClick={handleAddToCart} variant="outline" className="w-full h-14 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-lg gap-2 text-slate-700 transition-all"><ShoppingCart size={20} />{bn ? "কার্টে যোগ করুন" : "ADD TO CART"}</Button>
            </div>
          </div>
        </div>

        <section className="mt-16 container mx-auto max-w-7xl px-4 md:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50"><h2 className="text-xl font-bold text-slate-900">{bn ? `এই কম্বোতে যা যা রয়েছে (${includedItems.length}টি আইটেম)` : `What's Included in this Combo (${includedItems.length} items)`}</h2></div>
              <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{includedItems.map((item: any, i: number) => (<div key={i} className="group flex flex-col gap-3 p-3 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all"><div className="aspect-square rounded-lg overflow-hidden bg-white border border-slate-100"><img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div><div className="space-y-1 px-1"><h4 className="font-bold text-slate-900 text-sm line-clamp-1">{bn ? item.name_bn || item.name : item.name}</h4><p className="text-[10px] font-medium text-slate-400">{bn ? "সাইজ" : "Size"}: {item.size || (bn ? "স্ট্যান্ডার্ড" : "Standard")}</p><p className="text-sm font-bold text-slate-900">৳ {item.price}</p></div></div>))}</div></div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-100"><div className="flex flex-col md:flex-row items-center justify-between gap-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"><ShoppingCart size={18} /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট মূল্য</p><p className="text-lg font-bold text-slate-900">৳ {product.old_price || product.price}</p></div></div><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/10"><Zap size={18} className="fill-white" /></div><div><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">কম্বো মূল্য</p><p className="text-lg font-bold text-emerald-700">৳ {product.price}</p></div></div><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center text-[#166534] shadow-sm border border-emerald-100"><TrendingDown size={18} /></div><div><p className="text-[10px] font-bold text-[#166534] uppercase tracking-wider">মোট সেভ</p><p className="text-lg font-bold text-[#166534]">৳ {(product.old_price || product.price) - product.price} ({discount}%)</p></div></div></div></div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm"><h3 className="text-lg font-bold text-slate-900 mb-5">{bn ? "কম্বো সম্পর্কে" : "About this Combo"}</h3><ul className="space-y-4">{(config.package_contents?.length > 0 ? config.package_contents : ["ইসলামিক ডেকরের জন্য সেরা কম্বো", "প্রিমিয়াম কোয়ালিটি ম্যাটেরিয়াল", "সহজে ঝুলানো যায়", "বাড়ি, অফিস ও উপহার এর জন্য পারফেক্ট", "দীর্ঘস্থায়ী প্রিন্ট ও ফিনিশ"]).map((text: string, i: number) => (<li key={i} className="flex items-start gap-3"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={4} /></div><span className="text-sm font-medium text-slate-600 leading-snug">{text}</span></li>))}</ul></div>
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-6 shadow-sm flex gap-5"><div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0"><Truck size={28} /></div><div className="space-y-2"><h4 className="font-bold text-slate-900 text-base">{bn ? "ডেলিভারি সময়" : "Delivery Time"}</h4><ul className="space-y-1"><li className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />ঢাকার মধ্যে: ২৪-৪৮ ঘণ্টা</li><li className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />ঢাকার বাইরে: ২-৫ দিন</li></ul></div></div>
              {config.show_video !== false && (config.video_url || images[0]) && (<div className="bg-slate-900 rounded-xl overflow-hidden relative group aspect-video flex items-center justify-center cursor-pointer shadow-xl"><img src={images[0]} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" /><div className="relative z-10 w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-125 transition-transform duration-300"><Play size={24} fill="currentColor" className="ml-1" /></div><div className="absolute bottom-4 left-4 right-4 z-10"><p className="text-white text-[10px] font-black uppercase tracking-widest">{bn ? "প্রোডাক্ট রিভিউ ভিডিও" : "Product Review Video"}</p></div></div>)}
            </div>
          </div>
        </section>

        {config.show_faq !== false && config.faq?.length > 0 && (
          <section className="mt-24 container mx-auto max-w-7xl px-4 md:px-0"><div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"><div className="p-6 border-b border-slate-50"><h2 className="text-xl font-bold text-slate-900">{bn ? "সচরাচর জিজ্ঞাসিত প্রশ্ন" : "Frequently Asked Questions"}</h2></div><div className="p-8 space-y-6">{config.faq.map((item: any, i: number) => (<div key={i} className="space-y-3"><h4 className="font-black text-slate-900 flex items-center gap-3"><div className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs">Q</div>{item.q}</h4><p className="text-sm font-medium text-slate-500 pl-9 leading-relaxed">{item.a}</p></div>))}</div></div></section>
        )}

        {config.show_reviews !== false && (
          <div className="mt-24 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"><div className="grid grid-cols-1 lg:grid-cols-12"><div className="lg:col-span-4 p-8 bg-slate-50/50 border-r border-slate-100"><h3 className="text-lg font-bold text-slate-900 mb-6">{bn ? "গ্রাহক রিভিউ" : "Customer Reviews"}</h3><div className="flex items-center gap-6 mb-8"><div className="text-5xl font-bold text-slate-900">4.8</div><div><div className="flex items-center gap-1 text-amber-400 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={20} fill="currentColor" strokeWidth={0} />)}</div><p className="text-sm font-medium text-slate-400">({(config.reviews?.length || 120)} রিভিউ)</p></div></div><div className="space-y-3 mb-8">{[{ star: 5, p: 89 }, { star: 4, p: 8 }, { star: 3, p: 2 }, { star: 2, p: 1 }, { star: 1, p: 0 }].map((row, i) => (<div key={i} className="flex items-center gap-4"><div className="flex items-center gap-1 w-8"><span className="text-xs font-bold text-slate-500">{row.star}</span><Star size={10} className="text-amber-400 fill-amber-400" /></div><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: row.p + '%' }} /></div><span className="text-[10px] font-bold text-slate-400 w-8 text-right">{row.p}%</span></div>))}</div><Button variant="outline" className="w-full border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold">{bn ? "সব রিভিউ দেখুন" : "View All Reviews"}</Button></div><div className="lg:col-span-8 p-8 space-y-8">{(config.reviews?.length > 0 ? config.reviews : [{ name: "মাহিস ইসলাম", date: "২ দিন আগে", comment: "অসাধারণ কোয়ালিটি। ঘরকে একদম সুন্দর করে ফেলছে। আলহামদুলিল্লাহ ❤️", verified: true }, { name: "সাইফুল রহমান", date: "১ সপ্তাহ আগে", comment: "সবকিছু খুব সুন্দর ছিল। ডেলিভারিও দ্রুত পেয়েছি।", verified: true }, { name: "নাসরিন আক্তার", date: "২ সপ্তাহ আগে", comment: "উপহার হিসেবে নিয়েছিলাম, তারা অনেক খুশি হয়েছে।", verified: true }]).map((rev: any, i: number) => (<div key={i} className={`flex gap-5 ${i < (config.reviews?.length || 3) - 1 ? 'pb-8 border-b border-slate-50' : ''}`}><div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-slate-400 shrink-0">{rev.avatar ? <img src={rev.avatar} className="w-full h-full object-cover" /> : <User size={24} />}</div><div className="space-y-2"><div className="flex items-center gap-3"><h4 className="font-bold text-slate-900">{rev.name}</h4>{rev.verified !== false && <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">ভেরিফাইড ক্রেতা</span>}</div><div className="flex items-center gap-1 text-amber-400">{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={rev.rating >= s ? "currentColor" : "none"} strokeWidth={rev.rating >= s ? 0 : 2} />)}<span className="text-[10px] font-medium text-slate-400 ml-2">{rev.date || (bn ? "সাম্প্রতিক" : "Recent")}</span></div><p className="text-sm font-medium text-slate-600 leading-relaxed">{rev.text || rev.comment}</p></div></div>))}</div></div></div>
        )}

        <div className="mt-24 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{bn ? "অন্যান্য কম্বো দেখুন" : "View Other Combos"}</h2>
            <Link href="/combo" className="flex items-center gap-2 text-emerald-600 font-bold hover:translate-x-1 transition-all">{bn ? "সব কম্বো দেখুন" : "View All Combos"}<ArrowRight size={20} /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {relatedCombos.map((item: any, i: number) => (
              <Link href={`/combo/${item.slug || item.id}`} key={item.id} className="group bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"><div className="relative aspect-[4/5] overflow-hidden m-2 md:m-3 rounded-[18px] md:rounded-[24px]"><img src={item.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />{item.old_price && <div className="absolute top-3 left-3 bg-[#064E3B] text-white font-black text-[9px] px-2.5 py-1 rounded-lg">{Math.round(((item.old_price - item.price) / item.old_price) * 100)}% OFF</div>}</div><div className="p-4 md:p-6 pt-0 space-y-3"><h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 text-sm md:text-base">{bn ? item.name_bn : item.name}</h4><div className="flex items-baseline gap-2"><span className="text-lg md:text-xl font-black text-[#064E3B]">৳ {item.price}</span>{item.old_price && <span className="text-[11px] font-bold text-slate-200 line-through">৳ {item.old_price}</span>}</div><div className="flex items-center gap-2 pt-3 border-t border-slate-50"><div className="flex gap-0.5 text-amber-400">{[1,2,3,4,5].map(s => <Star key={s} size={10} fill="currentColor" />)}</div><span className="text-[9px] font-bold text-slate-400">4.8 (১১)</span></div></div></Link>
            ))}
          </div>
        </div>
      </main>

      {config.show_why_us !== false && (
        <section className="mt-24 py-16 bg-white border-t border-slate-100"><div className="container mx-auto max-w-7xl px-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">{(config.trust_badges?.length > 0 ? config.trust_badges : [{ icon: ShieldCheck, title: "১০০% অরিজিনাল প্রোডাক্ট", sub: "আমরা শুধুমাত্র প্রিমিয়াম কোয়ালিটি প্রোডাক্ট দেই" }, { icon: Heart, title: "হাজারো সন্তুষ্ট গ্রাহক", sub: "৪.৮+ রেটিং আমাদের সার্ভিসের গর্ব" }, { icon: Truck, title: "সারা বাংলাদেশে ডেলিভারি", sub: "দ্রুত ও নির্ভরযোগ্য হোম ডেলিভারি" }, { icon: Lock, title: "নিরাপদ কেনাকাটা", sub: "আপনার পেমেন্ট আমাদের কাছে নিরাপদ" }]).map((badge: any, i: number) => { const IconComp = badge.icon === "ShieldCheck" ? ShieldCheck : badge.icon === "Heart" ? Heart : badge.icon === "Truck" ? Truck : Lock; return (<div key={i} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group"><div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all"><IconComp size={28} /></div><div className="space-y-1"><h5 className="font-black text-slate-900 text-sm md:text-base">{badge.text || badge.title}</h5><p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed">{badge.sub || (bn ? "প্রিমিয়াম কোয়ালিটি অ্যাসিউরেন্স" : "Premium Quality Assurance")}</p></div></div>); })}</div></div></section>
      )}

      {config.show_sticky_footer !== false && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 md:hidden flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
           <Button onClick={handleOrderNow} className="flex-1 h-14 rounded-2xl bg-[#064E3B] hover:bg-[#064E3B]/90 text-white font-black text-lg gap-2 shadow-xl shadow-emerald-900/10 active:scale-95 transition-all"><Zap size={20} className="fill-white" />{config.checkout_button_text || (bn ? "অর্ডার করুন" : "ORDER NOW")}</Button>
           <Button onClick={handleAddToCart} variant="outline" className="w-14 h-14 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 flex items-center justify-center p-0 text-slate-700"><ShoppingCart size={24} /></Button>
        </div>
      )}

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} directCheckout={false} fixedProduct={product} />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
    </div>
  );
}
