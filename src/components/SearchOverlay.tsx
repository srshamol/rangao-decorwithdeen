"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowLeft, History, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    window.addEventListener("open-search", handleOpenSearch);
    return () => window.removeEventListener("open-search", handleOpenSearch);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, name_bn, price, old_price, images, slug, image")
        .or(`name.ilike.%${query}%,name_bn.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("status", "active")
        .limit(6);
      
      if (data) setResults(data);
      setLoading(false);
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    router.push(`/product/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_placeholder") || "Search products..."}
                className="w-full h-12 bg-slate-50 rounded-xl px-5 pr-12 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
              </div>
            </form>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!query ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-widest mb-4">
                    <TrendingUp size={16} className="text-emerald-600" />
                    {language === 'bn' ? "জনপ্রিয় সার্চ" : "Popular Searches"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Allah Calligraphy", "Ayatul Kursi", "Surah Falaq", "Kaaba Sharif"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-widest mb-4">
                    <History size={16} className="text-emerald-600" />
                    {language === 'bn' ? "সাম্প্রতিক" : "Recent"}
                  </div>
                  <p className="text-sm text-slate-400 font-medium italic">No recent searches</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.length > 0 ? (
                  results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group border border-transparent hover:border-slate-100"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img 
                          src={product.images?.[0] || product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-[15px] truncate mb-0.5">
                          {language === 'bn' ? (product.name_bn || product.name) : product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-black text-sm">৳{product.price}</span>
                          {product.old_price && (
                            <span className="text-slate-400 text-xs line-through">৳{product.old_price}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : !loading && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold">No products found for "{query}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
