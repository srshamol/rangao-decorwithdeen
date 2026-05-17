"use client";

import { Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FALLBACK_REVIEWS = [
  {
    id: "1",
    rating: 5,
    comment: "প্রোডাক্টের কোয়ালিটি অনেক ভালো রঙ এবং ফিনিশিং অসাধারণ। ডেলিভারিও খুব দ্রুত পেয়েছি। আলহামদুলিল্লাহ!",
    customer_name: "রাশেদুল ইসলাম",
    location: "ঢাকা",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80"
  },
  {
    id: "2",
    rating: 5,
    comment: "দারুণ একটি ক্যানভাস! আমার ড্রয়িং রুমের লুক পুরো বদলে দিয়েছে। অবশ্যই আবার অর্ডার করব।",
    customer_name: "সাবিনা ইয়াসমিন",
    location: "চট্টগ্রাম",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
  },
  {
    id: "3",
    rating: 5,
    comment: "প্যাকেজিং ছিল দারুণ এবং প্রোডাক্ট হুবহু ছবির মতোই পেয়েছি। ১০/১০",
    customer_name: "মোহাম্মদ সিয়াম",
    location: "সিলেট",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
  }
];

export function ReviewsSection() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const [displayReviews, setDisplayReviews] = useState<any[]>(FALLBACK_REVIEWS);

  const data = settings?.homepage_config?.reviews_text || {};

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data && data.length > 0) {
        // Map DB reviews to the required format, using fallbacks for missing fields like avatar/location
        const mappedData = data.map((r: any, index: number) => ({
          ...r,
          location: FALLBACK_REVIEWS[index % 3].location,
          avatar: FALLBACK_REVIEWS[index % 3].avatar
        }));
        setDisplayReviews(mappedData);
      }
    };
    fetchReviews();
  }, []);

  return (
    <section id="reviews" className="py-20 px-6 bg-white relative">
      <div className="container mx-auto max-w-7xl relative">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-slate-900"
          >
            {language === 'bn' ? (data.title_bn || 'গ্রাহকদের ভালোবাসা') : (data.title_en || 'Customer Reviews')}
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" className="rounded-xl px-4 h-10 border-slate-200 text-[#0F3D2E] hover:bg-slate-50 font-medium">
              <Link href="/reviews">{language === 'bn' ? (data.btn_bn || 'সব দেখুন') : (data.btn_en || 'View All')} <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
          </motion.div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-[#0F3D2E] hover:bg-slate-50 z-10 transition-colors hidden sm:flex">
            <ChevronLeft size={20} />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map((r: any, idx: number) => (
              <motion.div
                key={r.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl border border-slate-100 p-8 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star 
                      key={j} 
                      size={18} 
                      className={j < (r.rating || 5) ? "fill-[#FFB800] text-[#FFB800]" : "text-slate-200"} 
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8 flex-1">
                  {r.comment}
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <img 
                    src={r.avatar} 
                    alt={r.customer_name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                      {r.customer_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-[#0F3D2E] hover:bg-slate-50 z-10 transition-colors hidden sm:flex">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="w-2 h-2 rounded-xl bg-[#0F3D2E]"></div>
          <div className="w-2 h-2 rounded-xl bg-slate-200"></div>
          <div className="w-2 h-2 rounded-xl bg-slate-200"></div>
        </div>

      </div>
    </section>
  );
}
