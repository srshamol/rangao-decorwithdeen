"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Truck, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";

export function Hero() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const bn = language === 'bn';
  const heroData = settings.homepage_config?.hero_text || {};

  return (
    <>
      <section className="relative w-full bg-white lg:bg-[#FDFBF7] overflow-hidden h-[85vh] lg:h-[calc(70vh-50px)] flex items-center pt-0 lg:pt-0">
        {/* Subtle Background Fill (Desktop) */}
        <div className="absolute inset-0 bg-[#FDFBF7] z-0 hidden lg:block" />

        {/* Mobile Background Image (Only on Mobile) */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <div className="w-full h-full relative">
            <Image
              src={heroData.image || "/hero-banner.png"}
              alt="Islamic Home Decor Lifestyle"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 0vw"
              className="object-cover"
              style={{ objectPosition: 'center' }}
            />
            {/* Mobile Overlay (Sophisticated atmosphere) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90 lg:hidden z-10" />
            {/* Additional 'Scrim' for text focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,transparent_90%)] lg:hidden z-10" />
            
            {/* Bottom weighted fade */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent lg:hidden z-10" />
          </div>
        </div>

        {/* Desktop Bleed Image (Restored previous style) */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full relative"
          >
            <Image
              src={heroData.image || "/hero-banner.png"}
              alt="Islamic Home Decor Lifestyle"
              fill
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
              className="object-cover"
            />
            {/* Extended soft blending gradient matching the background */}
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-linear-to-r from-[#FDFBF7] via-[#FDFBF7]/60 to-transparent z-10" />
          </motion.div>
        </div>

        <div className="container mx-auto max-w-7xl px-6 md:px-12 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left py-8 lg:py-0">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-40 text-center lg:text-left px-4 sm:px-0"
              >
                {/* Badge */}
                <div className="inline-flex items-center px-5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/20 mb-8 lg:mb-8 backdrop-blur-md shadow-lg shadow-black/10">
                  <span className="text-[10px] md:text-[11px] font-black text-emerald-300 lg:text-emerald-700 uppercase tracking-[0.25em]">
                    {bn ? (heroData.badge_bn || "নতুন কালেকশন") : (heroData.badge_en || "New Collection")}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white lg:text-slate-900 mb-6 lg:mb-6 leading-[1.15] lg:leading-[1.1] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] lg:drop-shadow-none">
                  <span className="block mb-1 lg:mb-2">{bn ? (heroData.title_bn_1 || "আপনার ঘরকে করুন") : (heroData.title_en_1 || "Make Your Home")}</span>
                  <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent lg:text-[#0F3D2E] lg:bg-none lg:bg-clip-border lg:text-fill-current block py-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] font-black">
                    {bn ? (heroData.title_bn_2 || "ইসলামিক ও সুন্দর") : (heroData.title_en_2 || "Islamic & Beautiful")}
                  </span>
                </h1>
 
                {/* Subheadline */}
                <p className="text-white lg:text-slate-600 text-sm md:text-xl mb-10 lg:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0 font-bold lg:font-medium whitespace-pre-wrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] lg:drop-shadow-none">
                  {bn ? (heroData.desc_bn || "প্রিমিয়াম 3D ইসলামিক ওয়াল ক্যানভাস\nসহজে অর্ডার করুন, দ্রুত ডেলিভারি পান") : (heroData.desc_en || "Order premium 3D Islamic wall canvas easily and get fast delivery across Bangladesh.")}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-5 justify-center lg:justify-start">
                  <Button asChild size="lg" className="w-full sm:w-auto h-16 lg:h-16 px-10 lg:px-12 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#F9D976] to-[#B8860B] hover:from-[#F9D976] hover:to-[#D4AF37] lg:bg-[#0F3D2E] lg:bg-none lg:text-white text-[#1A1A1A] font-black text-base lg:text-base shadow-2xl shadow-gold/40 lg:shadow-emerald-900/20 border-b-4 border-[#8A6D3B] lg:border-none active:border-b-0 active:translate-y-1 lg:active:translate-y-0 lg:active:scale-95 transition-all">
                    <Link href="/shop" className="flex items-center gap-3 justify-center">
                      {bn ? (heroData.btn1_bn || "এখনই শপ করুন") : (heroData.btn1_en || "Shop Now")} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 lg:h-16 px-10 lg:px-10 rounded-xl border-2 border-white/30 lg:border-slate-200 bg-white/10 lg:bg-white/50 backdrop-blur-xl lg:backdrop-blur-sm text-white lg:text-slate-700 font-black text-base lg:text-base hover:bg-white/20 lg:hover:bg-[#0F3D2E] lg:hover:text-white lg:hover:border-[#0F3D2E] transition-all active:scale-95 shadow-xl lg:shadow-none">
                    <Link href="/collections" className="justify-center">
                      {bn ? (heroData.btn2_bn || "সকল কালেকশন") : (heroData.btn2_en || "Collections")}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>


          </div>
        </div>
      </section>

      {/* Trust Bar - High Conversion */}
      <section className="w-full bg-white dark:bg-slate-950 border-y border-slate-50 dark:border-white/5 py-6 lg:py-12 relative z-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 lg:gap-y-0">
            {[
              { icon: Truck, label: bn ? "ফ্রি ডেলিভারি" : "Free Delivery", sub: bn ? "৳1499+ অর্ডারে" : "1499+ Orders" },
              { icon: RefreshCw, label: bn ? "সহজ রিটার্ন" : "Easy Return", sub: bn ? "৭ দিনের রিটার্ন" : "7 Days Return" },
              { icon: ShieldCheck, label: bn ? "নিরাপদ পেমেন্ট" : "Secure Pay", sub: bn ? "SSL এনক্রিপ্টেড" : "SSL Encrypted" },
              { icon: Zap, label: bn ? "দ্রুত ডেলিভারি" : "Fast Delivery", sub: bn ? "১-৩ দিনের মধ্যে" : "1-3 Days" },
            ].map((item, i, arr) => (
              <div key={i} className="flex flex-col items-center justify-center text-center px-2 group relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-[#0F3D2E] dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all duration-300 mb-3">
                  <item.icon className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px]" strokeWidth={2.5} />
                </div>
                <p className="text-[11px] lg:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5 lg:mb-1">{item.label}</p>
                <p className="text-[9px] lg:text-[11px] font-medium text-slate-400 lg:text-slate-500 uppercase tracking-widest">{item.sub}</p>
                
                {/* Vertical Divider (Desktop Only) */}
                {i < arr.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-slate-100 dark:bg-white/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
