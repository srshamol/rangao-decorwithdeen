"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/language-context";
import { Loader2, ArrowRight, Sparkles, ShoppingBag, Zap, Clock, ShieldCheck, Star, TrendingUp, Filter, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComboListPage() {
  const { language, t } = useLanguage();
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchCombos = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_combo", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCombos(data);
      }
      setLoading(false);
    };
    fetchCombos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-xl animate-spin" />
      </div>
    );
  }

  const categories = ["All", "Ramadan Specials", "Home Decor", "Wall Art", "Premium"];
  
  const filteredCombos = activeCategory === "All" 
    ? combos 
    : combos.filter(c => c.category === activeCategory || (activeCategory === "Ramadan Specials" && c.tags?.includes("Ramadan")));

  return (
    <div className="min-h-screen bg-[#FDFCF9] pb-32">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-44 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,78,59,0.08)_0%,rgba(253,252,249,1)_70%)] pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-amber-200/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 left-[5%] w-96 h-96 bg-emerald-200/20 blur-[120px] rounded-full" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-amber-200/50 text-[#8B6E31] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-10"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <Sparkles size={14} className="text-amber-500" />
              {t("exclusive_savings")}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[100px] font-black text-slate-900 tracking-tight leading-[0.95] mb-8"
            >
              {t("our_ultimate")}<br />
              <span className="bg-gradient-to-r from-[#064E3B] via-[#0D9488] to-[#8B6E31] bg-clip-text text-transparent italic">
                {t("combo_offers_title")}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-12"
            >
              {t("combo_desc")}
            </motion.p>

            {/* Premium Category Filter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 p-2 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat 
                      ? "bg-[#064E3B] text-white shadow-lg shadow-emerald-900/20" 
                      : "text-slate-500 hover:bg-white hover:text-primary"
                  }`}
                >
                  {cat === "All" ? t("all_filter") : cat}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="px-6 -mt-24 relative z-20">
        <div className="container mx-auto max-w-7xl">
          {filteredCombos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredCombos.map((combo, i) => {
                const discount = combo.old_price ? Math.round(((combo.old_price - combo.price) / combo.old_price) * 100) : 0;
                return (
                  <motion.div
                    key={combo.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="group bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col relative"
                  >
                    {/* Hover Gold Border Overlay */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/20 rounded-xl transition-all duration-500 pointer-events-none z-10" />

                    <Link href={`/combo/${combo.slug || combo.id}`} className="block relative aspect-[5/4] overflow-hidden m-3 rounded-xl bg-slate-50">
                      <img 
                        src={combo.images?.[0] || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80"} 
                        alt={combo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Discount Glass Badge */}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-[#064E3B]/90 backdrop-blur-md text-white font-black text-[10px] px-3 py-1.5 rounded-lg border border-white/20 shadow-lg z-20">
                          {discount}% {t("off")}
                        </div>
                      )}

                      {/* Hot Badge with Glow */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-100 shadow-lg flex items-center gap-2 z-20">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                           {t("hot_deal")}
                         </span>
                      </div>

                      {/* Floating Save Badge */}
                      {combo.old_price && (
                        <div className="absolute bottom-3 right-3 bg-amber-400 text-[#5C481A] font-black text-[9px] px-3 py-1.5 rounded-lg shadow-xl translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                          {t("save")} ৳{(combo.old_price - combo.price).toLocaleString()}
                        </div>
                      )}
                    </Link>
                    
                    <div className="p-6 pt-2 flex-1 flex flex-col">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-amber-400 fill-amber-400" />)}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">4.9+ Rating</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Check size={10} strokeWidth={3} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{t("in_stock")}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#064E3B] transition-colors line-clamp-1">
                          {language === 'bn' ? combo.name_bn : combo.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {combo.description || t("original_products")}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-slate-50 mt-auto flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{t("combo_price")}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-[#064E3B]">৳{combo.price.toLocaleString()}</span>
                            {combo.old_price && (
                              <span className="text-slate-300 text-[11px] font-bold line-through">৳{combo.old_price.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <Button asChild className="rounded-xl h-11 px-5 bg-[#064E3B] hover:bg-[#043d2e] text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-emerald-900/10 transition-all hover:scale-105 active:scale-95">
                          <Link href={`/combo/${combo.slug || combo.id}`}>
                            {t("details")} <ArrowRight size={14} />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center space-y-8 bg-white rounded-xl border border-slate-100 shadow-2xl">
              <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-200">
                <ShoppingBag size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900">
                  {t("no_combos")}
                </h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  {t("no_combos_desc")}
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl h-14 px-10 border-slate-200 hover:bg-slate-50 font-bold">
                <Link href="/shop">{t("browse_all")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Premium Trust Indicators */}
      <section className="py-40 container mx-auto max-w-7xl px-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: t("limited_time"), color: "text-amber-600", bg: "bg-amber-50", desc: t("limited_time_desc") },
              { icon: ShieldCheck, title: t("premium_quality_stat"), color: "text-emerald-600", bg: "bg-emerald-50", desc: t("premium_quality_desc") },
              { icon: Zap, title: t("lightning_delivery"), color: "text-blue-600", bg: "bg-blue-50", desc: t("lightning_delivery_desc") }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-5">
                 <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mx-auto group-hover:rotate-12 transition-transform`}>
                    <f.icon size={28} strokeWidth={2.5} />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">{f.title}</h4>
                    <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
                       {f.desc}
                    </p>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
