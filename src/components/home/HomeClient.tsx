"use client";

import React, { useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductCategories } from "@/components/ProductCategories";
import { PromoBanners } from "@/components/PromoBanners";
import { ProductCard } from "@/components/ProductCard";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Users, Star, ShieldCheck, Truck } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";

// Code-split below-fold components
const ComboSection = dynamic(() => import("@/components/ComboSection").then(mod => mod.ComboSection), { ssr: false });
const WhyChoose = dynamic(() => import("@/components/WhyChoose").then(mod => mod.WhyChoose), { ssr: false });
const PhotoGallery = dynamic(() => import("@/components/PhotoGallery").then(mod => mod.PhotoGallery), { ssr: false });
const ReviewsSection = dynamic(() => import("@/components/ReviewsSection").then(mod => mod.ReviewsSection), { ssr: false });

interface HomeClientProps {
  initialProducts: any[];
  initialSettings: any;
  serverSideError?: boolean;
}

export function HomeClient({ initialProducts, initialSettings }: HomeClientProps) {
  const { settings } = useSettings();
  const { language, t } = useLanguage();
  
  // Use server data as initial state, but allow client-side settings to override if needed (e.g. realtime updates)
  const activeSettings = Object.keys(settings).length > 0 ? settings : initialSettings;
  const products = initialProducts;

  const hConfig = activeSettings?.homepage_config || {};
  const featuredData = hConfig.featured_text || {};
  const quoteData = hConfig.quote_text || {};
  const ctaData = hConfig.cta_text || {};

  const cta = activeSettings?.home_cta || {
    title: language === 'bn' ? (ctaData.title_bn || "আজই অর্ডার করুন") : (ctaData.title_en || "Order Today"),
    description: language === 'bn' 
      ? (ctaData.desc_bn || "৳৩,০০০+ অর্ডারে ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি")
      : (ctaData.desc_en || "Free Delivery over ৳3,000 · Cash on Delivery · Delivery Nationwide"),
    button_text: language === 'bn' ? (ctaData.btn1_bn || "কেনাকাটা করুন") : (ctaData.btn1_en || "Shop Now"),
    button_url: "/shop",
    whatsapp_text: language === 'bn' ? (ctaData.btn2_bn || "হোয়াটসঅ্যাপ") : (ctaData.btn2_en || "WhatsApp")
  };
  const whatsapp = activeSettings?.general?.whatsapp || "8801540707024";

  return (
    <div className="pb-20 lg:pb-0">
      <Hero />
      
      {activeSettings?.show_categories !== false && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <ProductCategories />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PromoBanners />
      </motion.div>

      {/* Featured Products */}
      {activeSettings?.show_featured !== false && (
        <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
          <div className="container mx-auto max-w-7xl">
            {/* Section Heading */}
            <div className="flex items-center justify-between mb-8">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-xl md:text-3xl font-bold text-slate-900"
              >
                {language === 'bn' ? (featuredData.title_bn || 'জনপ্রিয় পণ্যসমূহ') : (featuredData.title_en || 'Popular Products')}
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Button asChild variant="outline" className="rounded-xl px-4 h-10 border-slate-200 text-[#0F3D2E] hover:bg-slate-50 font-bold text-sm">
                  <Link href="/shop" className="flex items-center gap-2">
                    {language === 'bn' ? (featuredData.btn_bn || 'সব দেখুন') : (featuredData.btn_en || 'View All')} 
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.id} {...p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Metrics Bar */}
      <section className="px-4 md:px-6 pb-12 md:pb-20 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-slate-50/50 rounded-2xl py-8 px-4 grid grid-cols-2 md:grid-cols-4 items-center justify-between gap-y-10 md:gap-0 border border-slate-100">
            {/* Items omitted for brevity, but kept in full implementation */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 flex-1 justify-center md:border-r border-slate-200 text-center md:text-left">
              <div className="text-[#2F6B4A] bg-white p-3 rounded-xl shadow-sm md:shadow-none md:p-0 md:bg-transparent">
                <Users className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-[#0F3D2E]">১০,০০০+</p>
                <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">সন্তুষ্ট গ্রাহক</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 flex-1 justify-center md:border-r border-slate-200 text-center md:text-left">
              <div className="text-[#2F6B4A] bg-white p-3 rounded-xl shadow-sm md:shadow-none md:p-0 md:bg-transparent">
                <Star className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-[#0F3D2E]">৪.৯/৫</p>
                <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">গুগল রেটিং</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 flex-1 justify-center md:border-r border-slate-200 text-center md:text-left">
              <div className="text-[#2F6B4A] bg-white p-3 rounded-xl shadow-sm md:shadow-none md:p-0 md:bg-transparent">
                <ShieldCheck className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-[#0F3D2E]">১০০%</p>
                <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">অরিজিনাল পণ্য</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 flex-1 justify-center text-center md:text-left">
              <div className="text-[#2F6B4A] bg-white p-3 rounded-xl shadow-sm md:shadow-none md:p-0 md:bg-transparent">
                <Truck className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-[#0F3D2E]">সাপোর্ট</p>
                <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">২৪/৭ সার্ভিস</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <WhyChoose />
      </motion.div>

      {activeSettings?.show_combo !== false && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <ComboSection />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PhotoGallery />
      </motion.div>

      {/* Islamic Wisdom Section */}
      <section className="py-16 md:py-32 px-4 bg-[#052e23] relative overflow-hidden">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[800px] h-[300px] md:h-[400px] bg-primary/10 blur-[120px] rounded-xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-gold text-4xl md:text-6xl mb-6 md:mb-10 block font-serif opacity-80 select-none">
              {quoteData.arabic || "﷽"}
            </span>
            <h2 className="text-xl md:text-5xl font-heading font-black text-white/95 leading-[1.3] md:leading-[1.2] tracking-tight mb-6 md:mb-8">
              {language === 'bn' ? (quoteData.title_bn || 'ইসলামের সৌন্দর্য আপনার প্রতিটি পদক্ষেপে') : (quoteData.title_en || 'Elevate Your Home with the Beauty of Deen')}
            </h2>
            <div className="h-px w-16 md:w-24 bg-gold/30 mx-auto mb-6 md:mb-8" />
            <p className="text-emerald-100/60 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">
              {language === 'bn' 
                ? (quoteData.text_bn || '"এবং তিনি যেখানেই আমি থাকি আমাকে বরকতময় করেছেন"')
                : (quoteData.text_en || '"And He has made me blessed wherever I am"')}
            </p>
            <p className="text-gold/50 mt-6 uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs font-black">
              {language === 'bn' ? (quoteData.ref_bn || 'Surah Maryam • Verse 31') : (quoteData.ref_en || 'Surah Maryam • Verse 31')}
            </p>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <ReviewsSection />
      </motion.div>

      {/* CTA Banner */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-primary border border-primary-foreground/10 shadow-2xl p-8 md:p-24 group"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary-foreground/10 via-transparent to-gold/10 opacity-60" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-xl blur-[120px] group-hover:bg-gold/20 transition-colors duration-1000" />
            
            <div className="relative z-10 text-center max-w-xl mx-auto">
              <span className="text-gold text-3xl md:text-4xl drop-shadow-lg block mb-4 md:mb-6">✦</span>
              <h2 className="text-2xl md:text-6xl font-black font-heading text-primary-foreground leading-[1.2] md:leading-[1.1] tracking-tight">
                {cta.title}
              </h2>
              <p className="text-primary-foreground/80 mt-6 md:mt-8 text-sm md:text-xl leading-relaxed font-medium">
                {cta.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mt-10 md:mt-14">
                <Button asChild size="lg" className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 font-black shadow-2xl shadow-gold/30 px-8 h-14 md:h-20 text-base md:text-lg gap-3 active:scale-95 transition-all">
                  <Link href={cta.button_url as any}>
                    {cta.button_text} <ArrowRight className="w-[18px] h-[18px] md:w-5 md:h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl border-primary-foreground/20 bg-primary-foreground/5 backdrop-blur-md text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/40 px-8 h-14 md:h-20 text-base md:text-lg gap-3 active:scale-95 transition-all">
                  <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(activeSettings?.general_settings?.store_name || "Rangao")}!`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 md:w-[22px] md:h-[22px] text-[#25D366]" />
                    {cta.whatsapp_text}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
