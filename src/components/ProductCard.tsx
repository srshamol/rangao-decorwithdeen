"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";

import { useLanguage } from "@/lib/language-context";

interface ProductCardProps {
  id: string;
  name: string;
  name_bn: string;
  price: number;
  old_price?: number | null;
  images: string[];
  badge?: string | null;
  index?: number;
}

export function ProductCard({ id, name, name_bn, price, old_price, images, badge: productBadge, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const displayName = language === "bn" ? name_bn : name;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, name_bn, price, image: images[0] || "" });
  };

  const discount = old_price ? Math.round(((old_price - price) / old_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link 
        href={`/shop/${id}`} 
        className="group block h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:border-emerald-100 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative">
          
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={isHovered && images[1] ? 'hovered' : 'default'}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full group-hover:scale-110 transition-transform duration-[2.5s] ease-out"
              >
                <Image
                  src={(isHovered && images[1]) ? images[1] : (images[0] || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&h=400&fit=crop")}
                  alt={displayName}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-[#0F3D2E] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-lg z-10">
                -{discount}%
              </div>
            )}

            {/* Wishlist Button */}
            <button 
              className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-md z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-3 md:p-4 flex flex-col flex-1">
            <h3 className="font-bold text-[#1A1A1A] text-[13px] md:text-[15px] leading-tight mb-2 line-clamp-2 group-hover:text-[#0F3D2E] transition-colors min-h-[2.5rem]">
              {displayName}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2 md:mb-3">
              <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[11px] md:text-[13px] font-bold text-slate-600">
                4.8 <span className="text-slate-400 font-medium hidden xs:inline">(230)</span>
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <span className="text-base md:text-lg font-black text-[#1A1A1A]">৳{price.toLocaleString()}</span>
              {old_price && (
                <span className="text-[11px] md:text-sm font-bold text-slate-300 line-through">৳{old_price.toLocaleString()}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAdd(e);
                }}
                className="flex-1 h-9 md:h-10 bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-xl flex items-center justify-center text-[11px] md:text-[13px] font-black transition-all duration-300 shadow-md active:scale-[0.98]"
              >
                {language === 'bn' ? 'অ্যাড করুন' : 'Add'}
              </button>
              <Button 
                onClick={handleQuickAdd}
                size="icon" 
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/10 active:scale-90 transition-all"
              >
                <ShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
