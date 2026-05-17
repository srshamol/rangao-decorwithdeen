import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Module-level cache to survive component remounts and route navigation
const _catCache: { data: any[] | null; ts: number } = { data: null, ts: 0 };
const CAT_TTL = 5 * 60 * 1000; // 5 minutes


const DEFAULT_CATEGORIES = [
  {
    id: "wall-canvas",
    name: "Wall Canvas",
    name_bn: "ওয়াল ক্যানভাস",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&h=600&fit=crop",
  },
  {
    id: "islamic-poster",
    name: "Islamic Poster",
    name_bn: "ইসলামিক পোস্টার",
    image: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=600&h=600&fit=crop",
  },
  {
    id: "calligraphy",
    name: "Calligraphy Art",
    name_bn: "ক্যালিগ্রাফি আর্ট",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=600&fit=crop",
  },
  {
    id: "home-decor",
    name: "Home Decor",
    name_bn: "হোম ডেকোর",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&h=600&fit=crop",
  },
  {
    id: "accessories",
    name: "Accessories",
    name_bn: "অ্যাকসেসরিজ",
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=600&fit=crop",
  },
];

export function ProductCategories() {
  const { settings } = useSettings();
  const { language } = useLanguage();
  const [dbCategories, setDbCategories] = useState<any[]>(_catCache.data || []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Use in-memory cache if still fresh
    if (_catCache.data && Date.now() - _catCache.ts < CAT_TTL) {
      setDbCategories(_catCache.data);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, name_bn, slug, image, icon, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        _catCache.data = data;
        _catCache.ts = Date.now();
        setDbCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const displayCategories = dbCategories.length > 0 
    ? dbCategories 
    : (settings?.home_categories && Array.isArray(settings.home_categories) && settings.home_categories.length > 0
        ? settings.home_categories
        : DEFAULT_CATEGORIES);

  const catData = settings?.homepage_config?.categories_text || {};

  return (
    <section className="py-24 px-6 bg-[#FAFAFA]">
      <div className="container mx-auto max-w-7xl">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
          >
            {language === 'bn' ? (
              catData.title_bn || <>আমাদের <span className="text-[#0F3D2E]">জনপ্রিয়</span> ক্যাটাগরি</>
            ) : (
              catData.title_en || <>Our <span className="text-[#0F3D2E]">Popular</span> Categories</>
            )}
          </motion.h2>
          {(catData.subtitle_bn || catData.subtitle_en) && (
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              {language === 'bn' ? catData.subtitle_bn : catData.subtitle_en}
            </p>
          )}
        </div>

        {/* Categories Carousel */}
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
            className="absolute -left-2 lg:-left-6 top-[35%] lg:top-[40%] -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F3D2E] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Categories Row (Single Horizontal Column) */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 md:gap-6 lg:gap-8 py-8 no-scrollbar px-8 lg:px-12 scroll-smooth snap-x snap-mandatory"
          >
            {displayCategories.map((cat: any, i: number) => (
              <motion.div
                key={cat.id || cat.slug}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-36 md:w-44 lg:w-48 xl:w-[210px] snap-center group/card cursor-pointer"
              >
                <Link
                  href={{ pathname: '/shop', query: { category: cat.slug || cat.id } }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Circular Image Container */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden border-[4px] lg:border-[6px] border-white shadow-[0_12px_40px_-12px_rgba(15,61,46,0.15)] group-hover/card:shadow-[0_20px_50px_-12px_rgba(15,61,46,0.25)] group-hover/card:scale-105 transition-all duration-500 ring-1 ring-slate-100/50 relative bg-slate-50">
                    <Image
                      src={cat.image || '/placeholder.png'}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 30vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0F3D2E]/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="mt-5 lg:mt-6 text-center w-full px-2">
                    <div className="min-h-[40px] flex items-center justify-center">
                      <h4 className="text-[12px] md:text-[14px] lg:text-[16px] leading-tight font-black text-slate-800 uppercase tracking-tight group-hover/card:text-[#0F3D2E] transition-colors line-clamp-2">
                        {language === 'bn' ? (cat.name_bn || cat.name) : cat.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2 opacity-70 group-hover/card:opacity-100 transition-all transform lg:translate-y-2 lg:group-hover/card:translate-y-0">
                      <span className="text-[10px] lg:text-[12px] font-black text-[#0F3D2E] uppercase tracking-widest">{language === 'bn' ? 'শপ করুন' : 'Shop'}</span>
                      <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#0F3D2E]" strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
            className="absolute -right-2 lg:-right-6 top-[35%] lg:top-[40%] -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F3D2E] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </section>
  );
}
