"use client";

import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Check, ShoppingCart, Zap, AlertTriangle, ArrowLeft, Truck, 
  ShieldCheck, Heart, Share2, Plus, Minus, CheckCircle2, Loader2,
  ChevronRight, ChevronLeft, Box, Ruler, Palette, PenTool, Layout as LayoutIcon,
  RotateCcw, CreditCard, Users, Trophy, Settings2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { trackEvent, TRACKING_EVENTS } from "@/lib/tracking";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, clearCart } = useCart();
  const { language, t } = useLanguage();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Options State
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFrame, setSelectedFrame] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Product
      const { data: p } = await supabase.from("products").select("*").eq("id", productId).single();
      if (p) {
        setProduct(p);
        
        // Default options
        const config = p.landing_page_config as any;
        if (config?.sizes?.length > 0) setSelectedSize(config.sizes[0].value || config.sizes[0].name);
        if (config?.frames?.length > 0) setSelectedFrame(config.frames[0]);

        // Fetch Related
        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("category", p.category)
          .neq("id", p.id)
          .limit(4);
        setRelatedProducts(related || []);
      }

      // Fetch Reviews
      const { data: r } = await supabase.from("reviews").select("*").eq("product_id", productId);
      if (r) setReviews(r);
      
      setLoading(false);
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (product) {
      trackEvent(TRACKING_EVENTS.VIEW_CONTENT, {
        content_ids: [product.id],
        content_name: product.name,
        content_category: product.category,
        value: product.price,
        currency: "BDT",
      });
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {t("loading_excellence")}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 font-heading">
        <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">{t("product_not_found")}</h2>
        <p className="text-muted-foreground mb-8">{t("product_not_found_desc")}</p>
        <Button asChild variant="outline" className="rounded-xl px-8 h-12">
          <Link href="/shop">← {t("back_to_shop")}</Link>
        </Button>
      </div>
    );
  }

  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  const handleAddToCart = () => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      name_bn: product.name_bn, 
      price: product.price, 
      image: product.images[0],
      selectedSize,
      selectedFrame
    }, qty);
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const productCode = product.sku || `RGA-${product.id.slice(0, 5).toUpperCase()}`;

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="text-slate-400 hover:text-primary transition-colors"><CheckCircle2 size={16} /></Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link href="/shop" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">{t("home")}</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link href={`/shop?category=${product.category}`} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors capitalize">{product.category.replace('-', ' ')}</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-xs font-black text-slate-900">{language === 'bn' ? product.name_bn : product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Left: Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Carousel Controls */}
                <button 
                  onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#0F3D2E] text-white border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                    {t("best_seller")}
                  </Badge>
                </div>
                
                <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                  <Heart size={20} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="relative group">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImage ? "border-[#0F3D2E] scale-95 shadow-inner" : "border-slate-100 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {product.images.length > 4 && (
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-24 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end">
                      <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 border border-slate-100">
                        <ChevronRight size={16} />
                      </div>
                   </div>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                  {language === 'bn' ? product.name_bn : product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4">
                   <div className="flex items-center gap-1.5 bg-gold/5 px-3 py-1.5 rounded-xl">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="text-[11px] font-black text-slate-700">4.8 <span className="text-slate-400 font-bold ml-1">({reviews.length} {t("reviews_count")})</span></span>
                   </div>
                   <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black px-3 py-1 rounded-xl">
                      {t("premium_quality_badge")}
                   </Badge>
                   <span className="text-[10px] font-bold text-slate-400 ml-auto uppercase tracking-widest">{t("product_code")}: {productCode}</span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl md:text-5xl font-black text-[#0F3D2E] tracking-tighter">৳{product.price.toLocaleString()}</span>
                  {product.old_price && (
                    <>
                      <span className="text-xl text-slate-300 line-through font-bold">৳{product.old_price.toLocaleString()}</span>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-xl text-[10px] font-black">{discount}% {t("off")}</span>
                    </>
                  )}
                </div>
                {product.old_price && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Check size={14} strokeWidth={3} />
                    <span className="text-xs font-bold uppercase tracking-wider">{t("save_amount")} ৳{(product.old_price - product.price).toLocaleString()}</span>
                  </div>
                )}
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                   {product.description?.substring(0, 150).replace(/<[^>]*>/g, '')}...
                </p>
              </div>

              {/* Options */}
              <div className="space-y-6 pt-4">
                {/* Size Selector */}
                {(product.landing_page_config as any)?.sizes?.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("size")}</span>
                    <div className="flex flex-wrap gap-3">
                      {(product.landing_page_config as any).sizes.map((s: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedSize(s.name);
                          }}
                          className={`px-5 py-3 rounded-xl border-2 text-xs font-black transition-all ${
                            selectedSize === s.name 
                            ? "border-[#0F3D2E] bg-emerald-50/50 text-[#0F3D2E] shadow-sm" 
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {s.name} {s.price ? `(৳${s.price})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frame Selector */}
                {(product.landing_page_config as any)?.frames?.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("frame")}</span>
                    <div className="flex flex-wrap gap-3">
                      {(product.landing_page_config as any).frames.map((f: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedFrame(f)}
                          className={`px-6 py-3 rounded-xl border-2 text-xs font-black transition-all ${
                            selectedFrame === f 
                            ? "border-[#0F3D2E] bg-emerald-50/50 text-[#0F3D2E] shadow-sm" 
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-4">
                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("quantity")}</span>
                   <div className="flex items-center bg-slate-50 w-fit p-1 rounded-xl border border-slate-200">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Minus size={16} /></button>
                      <span className="w-12 text-center font-black text-slate-900">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Plus size={16} /></button>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 h-16 rounded-xl bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white font-black text-base gap-3 shadow-xl shadow-emerald-900/10 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart size={20} />
                  {t("add_to_cart")}
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 h-16 rounded-xl border-2 border-[#0F3D2E] text-[#0F3D2E] hover:bg-emerald-50 font-black text-base gap-3 active:scale-[0.98] transition-all"
                >
                  <Zap size={20} className="fill-current" />
                  {t("buy_now")}
                </Button>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                 {[
                   { icon: Truck, label: t("free_shipping"), sub: language === 'bn' ? '৳১৪৯৯+ অর্ডার' : 'Order ৳1499+' },
                   { icon: CreditCard, label: t("cash_on_delivery"), sub: language === 'bn' ? 'সারা বাংলাদেশে' : 'Whole BD' },
                   { icon: RotateCcw, label: language === 'bn' ? 'সহজ রিটার্ন' : 'Easy Return', sub: language === 'bn' ? '৭ দিনের রিটার্ন সুবিধা' : '7 Days Return' },
                   { icon: ShieldCheck, label: t("secure_checkout"), sub: language === 'bn' ? 'SSL এনক্রিপ্টেড' : 'SSL Encrypted' }
                 ].map((feat, i) => (
                   <div key={i} className="flex flex-col items-center text-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0F3D2E] mb-1">
                        <feat.icon size={18} />
                      </div>
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter leading-none">{feat.label}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{feat.sub}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Description Tabs Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Specs Table */}
          <div className="lg:col-span-5">
             <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm h-full">
                <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6">{t("product_details")}</h3>
                <div className="space-y-6">
                   {[
                     { icon: Box, label: t("product_type"), value: language === 'bn' ? '৫ প্যানেল ক্যানভাস' : '5 Panel Canvas' },
                     { icon: Trophy, label: t("material"), value: product.material || (language === 'bn' ? 'প্রিমিয়াম ক্যানভাস' : 'Premium Canvas') },
                     { icon: Ruler, label: t("size"), value: product.size || 'Standard' },
                     { icon: PenTool, label: t("installation"), value: product.installation || (language === 'bn' ? 'সহজ দেয়ালে লাগানো যায়' : 'Easy to Install') },
                     ...((product.landing_page_config as any)?.specifications || []).map((spec: any) => ({
                        icon: Settings2,
                        label: spec.key,
                        value: spec.value
                     }))
                   ].map((spec, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all shadow-sm"><spec.icon size={18} /></div>
                           <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{spec.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{spec.value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right: Rich Description */}
          <div className="lg:col-span-7 space-y-10">
             <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6">{t("description")}</h3>
                <div 
                  className="prose prose-slate max-w-none prose-sm font-medium leading-relaxed text-slate-600"
                  dangerouslySetInnerHTML={{ __html: product.description || "" }}
                />
             </div>

             <div className="bg-[#FDFCF6] rounded-xl border border-yellow-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-[#854D0E] mb-6">{t("whats_in_box")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                     language === 'bn' ? '৫ প্যানেল ক্যানভাস সেট' : '5 Panel Canvas Set',
                     language === 'bn' ? 'দেয়ালে লাগানোর সরঞ্জাম' : 'Wall Mounting Tools',
                     language === 'bn' ? 'উড ফ্রেম (ফ্রেমসহ হলে)' : 'Wood Frame (if selected)',
                     language === 'bn' ? 'সুরক্ষিত প্যাকেজিং' : 'Secure Protective Packaging'
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Check size={12} strokeWidth={4} /></div>
                        <span className="text-sm font-black text-slate-700">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 space-y-10">
             <div className="items-center justify-between flex">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("related_products")}</h2>
                <Link href="/shop" className="text-sm font-black text-primary flex items-center gap-2 group">
                   {t("view_all")}
                   <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                   <ProductCard key={p.id} {...p} />
                ))}
             </div>
          </div>
        )}

        {/* Global Stats Bar */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { icon: Users, value: '১০,০০০+', label: t("happy_customers_stat") },
             { icon: Star, value: '৮.৮/১০', label: t("google_rating") },
             { icon: CheckCircle2, value: '১০০%', label: t("original_product_stat") },
             { icon: Truck, value: language === 'bn' ? 'সারাদেশে' : 'Fast Delivery', label: t("fast_delivery_stat") }
           ].map((stat, i) => (
             <div key={i} className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-xl hover:border-emerald-100 transition-all">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <stat.icon size={24} />
                </div>
                <div>
                   <p className="text-xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        items={[{ ...product, quantity: qty, selectedSize, selectedFrame }]} 
        total={product.price * qty}
        onSuccess={() => {
          clearCart();
        }}
      />

      {/* Mobile Sticky Action Bar */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("price_label")}</p>
                 <p className="text-lg font-black text-slate-900 leading-none">৳{product.price.toLocaleString()}</p>
              </div>
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                className="h-12 w-12 rounded-xl border-slate-200 text-slate-600 p-0"
              >
                <ShoppingCart size={20} />
              </Button>
              <Button 
                onClick={handleBuyNow}
                className="flex-[2] h-12 rounded-xl bg-[#0F3D2E] text-white font-black text-sm gap-2"
              >
                <Zap size={16} className="fill-current" />
                {t("buy_now")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
