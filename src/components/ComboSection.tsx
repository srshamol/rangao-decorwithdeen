import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";

export function ComboSection() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const data = settings?.homepage_config?.combo_text || {};

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="w-full py-16 px-6 bg-white"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-[#FDFBF7] shadow-sm group min-h-[400px] flex items-center">
          {/* Full-width Image with Fade Overlay to avoid hard edges */}
          <div className="absolute inset-0 w-full h-full">
            <Image 
              src={data.image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1200&q=80"}
              alt="Rangao Combo" 
              fill
              sizes="100vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-[3s] ease-out"
            />
            {/* Flawless gradient fade to blend the image into the background color without gray lines */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] from-40% md:from-50% via-[#FDFBF7]/80 via-60% md:via-70% to-[#FDFBF7]/0" />
          </div>

          {/* Left Side Content */}
          <div className="relative z-10 w-full md:w-[60%] p-10 md:p-20 lg:p-24 flex flex-col items-start">
            <p className="text-slate-800 font-bold text-lg md:text-xl mb-2">
              {language === 'bn' ? (data.title_bn || 'প্রথম অর্ডারে বিশেষ ছাড়!') : (data.title_en || 'Special discount on first order!')}
            </p>
            
            <h2 className="text-[#0F3D2E] text-4xl md:text-6xl font-black mb-6 tracking-tight">
              {language === 'bn' ? (data.heading_bn || '6% ডিসকাউন্ট') : (data.heading_en || '6% Discount')}
            </h2>

            <div className="bg-[#E8F3EB] px-6 py-3 rounded-xl border border-emerald-100 mb-8 inline-block">
              <p className="text-[#0F3D2E] font-bold text-base md:text-lg">
                {language === 'bn' ? (data.coupon_label_bn || 'কুপন কোড:') : (data.coupon_label_en || 'Coupon Code:')} <span className="font-black tracking-wider ml-1">{data.coupon_code || 'RANGAO5'}</span>
              </p>
            </div>

            <Button 
              asChild
              className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-xl px-8 h-12 font-bold transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/10"
            >
              <Link href="/shop">
                {language === 'bn' ? (data.btn_text || 'এখনই শপ করুন') : (data.btn_text || 'Shop Now')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
