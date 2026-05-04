import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";

export function PromoBanners() {
  const { settings } = useSettings();
  const { language } = useLanguage();
  const banners = settings?.home_banners || [];

  if (banners.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-[#FDFBF7] bg-islamic-pattern">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner: any, i: number) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={banner.link || "/shop"}
              className="group relative block aspect-[21/9] rounded-xl overflow-hidden border border-border shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <Image 
                src={banner.image_url} 
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-12">
                <h3 className="text-xl md:text-3xl font-black text-white max-w-[200px] md:max-w-xs leading-tight">
                  {language === 'bn' ? (banner.title_bn || banner.title) : banner.title}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-gold font-bold text-xs md:text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                  {language === 'bn' ? 'শপিং শুরু করুন' : 'Shop Now'} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
