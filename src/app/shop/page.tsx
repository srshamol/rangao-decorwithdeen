"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useLanguage } from "@/lib/language-context";
import { 
  Loader2, 
  Filter, 
  Grid2X2, 
  List, 
  ChevronRight, 
  Search, 
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../../components/ui/button"; // Relative Import for stability
import { useSettings } from "@/lib/useSettings";

const SEARCH_TAGS = [
  { id: 1, label_bn: "আল্লাহ ক্যালিগ্রাফি", label_en: "Allah Calligraphy" },
  { id: 2, label_bn: "আয়াতুল কুরসি", label_en: "Ayatul Kursi" },
  { id: 3, label_bn: "সুরা ফালাক", label_en: "Surah Falaq" },
  { id: 4, label_bn: "কাবা শরীফ", label_en: "Kaaba Sharif" },
  { id: 5, label_bn: "ইসলামিক ফ্রেম", label_en: "Islamic Frame" },
];

const FEATURES = [
  { 
    id: 1, 
    title_bn: "ফ্রি ডেলিভারি", 
    title_en: "Free Delivery", 
    sub_bn: "৳১৪৯৯+ অর্ডারে", 
    sub_en: "On orders over ৳1499",
    icon: Truck 
  },
  { 
    id: 2, 
    title_bn: "সহজ রিটার্ন", 
    title_en: "Easy Return", 
    sub_bn: "৭ দিনের রিটার্ন সুবিধা", 
    sub_en: "7-day return policy",
    icon: RotateCcw 
  },
  { 
    id: 3, 
    title_bn: "নিরাপদ পেমেন্ট", 
    title_en: "Secure Payment", 
    sub_bn: "SSL এনক্রিপশন", 
    sub_en: "SSL Encrypted",
    icon: ShieldCheck 
  },
  { 
    id: 4, 
    title_bn: "দ্রুত ডেলিভারি", 
    title_en: "Fast Delivery", 
    sub_bn: "১-৩ দিনের মধ্যে", 
    sub_en: "Within 1-3 days",
    icon: Zap 
  },
];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([200, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const COLORS = [
    { id: 'green', hex: '#106332', label_bn: 'সবুজ' },
    { id: 'black', hex: '#000000', label_bn: 'কালো' },
    { id: 'gold', hex: '#C5A059', label_bn: 'সোনালী' },
    { id: 'silver', hex: '#B8B8B8', label_bn: 'সিলভার' },
    { id: 'brown', hex: '#7D5A44', label_bn: 'বাদামী' },
  ];

  const PLACEMENTS = [
    { id: 'living', label_bn: 'লিভিং রুম', label_en: 'Living Room', count: 92 },
    { id: 'bedroom', label_bn: 'বেডরুম', label_en: 'Bedroom', count: 68 },
    { id: 'office', label_bn: 'অফিস', label_en: 'Office', count: 34 },
    { id: 'mosque', label_bn: 'মসজিদ / মাদ্রাসা', label_en: 'Mosque / Madrasa', count: 28 },
  ];

  const SIZES = [
    { id: 'small', label_bn: 'ছোট (২৪ ইঞ্চি পর্যন্ত)', label_en: 'Small', count: 45 },
    { id: 'medium', label_bn: 'মাঝারি (২৪-৪৮ ইঞ্চি)', label_en: 'Medium', count: 78 },
    { id: 'large', label_bn: 'বড় (৪৮ ইঞ্চির বেশি)', label_en: 'Large', count: 63 },
  ];

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (productsData) setAllProducts(productsData);

      const { data: catsData } = await supabase
        .from("categories")
        .select("*")
        .eq("status", 'active');
      
      if (catsData) {
        const catsWithCounts = catsData.map((cat: any) => ({
          ...cat,
          count: productsData?.filter((p: any) => p.category === cat.slug || p.category === cat.id).length || 0
        }));
        setCategories(catsWithCounts);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter((p: any) => selectedCategories.includes(p.category));
    }

    result = result.filter((p: any) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortBy === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [allProducts, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([200, 5000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPlacements([]);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#0F3D2E] transition-colors">{t("home")}</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-medium">{t("all_products")}</span>
        </nav>

        {/* Title Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-[40px] font-black text-[#1A1A1A] mb-3">
            {t("all_products")}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-slate-500 text-[15px]">
              {t("shop_desc")}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-slate-500 text-sm font-medium">
                {language === 'bn' ? `মোট ${filteredProducts.length} ${t("total_products_found")}` : `${filteredProducts.length} ${t("total_products_found")}`}
              </span>
              <div className="hidden md:flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-white border-slate-200 h-11 rounded-xl font-bold text-sm text-slate-900 focus:ring-emerald-500">
                    <SelectValue placeholder={t("sort_by")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="popular">{t("most_popular")}</SelectItem>
                    <SelectItem value="newest">{t("new_arrivals")}</SelectItem>
                    <SelectItem value="low">{t("price_low_high")}</SelectItem>
                    <SelectItem value="high">{t("price_high_low")}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Grid2X2 size={20} />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-all ${viewMode === "list" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-sm font-black text-[#1A1A1A] mr-2">
            {t("popular_search")}
          </span>
          {SEARCH_TAGS.map((tag) => (
            <button 
              key={tag.id}
              className="px-4 py-1.5 bg-[#F0F7F4] text-[#0F3D2E] text-sm font-bold rounded-xl hover:bg-[#0F3D2E] hover:text-white transition-all duration-300"
            >
              {language === 'bn' ? tag.label_bn : tag.label_en}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#1A1A1A] text-base uppercase tracking-tight">{t("filter")}</span>
                </div>
                <Filter size={18} className="text-slate-400" />
              </div>

              <div className="p-6">
                <Accordion type="multiple" defaultValue={["categories", "price", "size", "colors", "placement"]} className="space-y-4">
                  
                  {/* Categories */}
                  <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{t("categories_title")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-2">
                      <div className="space-y-3">
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleCategory(cat.slug || cat.id)}>
                            <div className="flex items-center gap-3">
                              <Checkbox checked={selectedCategories.includes(cat.slug || cat.id)} className="border-slate-300 data-[state=checked]:bg-[#0F3D2E] data-[state=checked]:border-[#0F3D2E]" />
                              <span className={`text-[15px] font-bold transition-colors ${selectedCategories.includes(cat.slug || cat.id) ? 'text-[#0F3D2E]' : 'text-slate-600 group-hover:text-[#0F3D2E]'}`}>
                                {language === 'bn' ? (cat.name_bn || cat.name) : cat.name}
                              </span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-400">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Price */}
                  <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{t("price_range")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-2 px-1">
                      <Slider
                        defaultValue={[200, 5000]}
                        max={10000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mb-6 [&>.relative>.bg-primary]:bg-[#0F3D2E] [&>.relative>.bg-secondary]:bg-slate-100"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">৳ {priceRange[0]}</span>
                        <span className="text-sm font-bold text-slate-600">৳ {priceRange[1]}+</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Size */}
                  <AccordionItem value="size" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{t("size")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-2">
                      <div className="space-y-3">
                        {SIZES.map((size) => (
                          <div key={size.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`size-${size.id}`} className="border-slate-300 data-[state=checked]:bg-[#0F3D2E] data-[state=checked]:border-[#0F3D2E]" />
                              <label htmlFor={`size-${size.id}`} className="text-[15px] font-bold text-slate-600 group-hover:text-[#0F3D2E] cursor-pointer">
                                {language === 'bn' ? size.label_bn : size.label_en}
                              </label>
                            </div>
                            <span className="text-[13px] font-bold text-slate-400">{size.count}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Colors */}
                  <AccordionItem value="colors" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{t("color")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-2">
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColors(prev => prev.includes(color.id) ? prev.filter(c => c !== color.id) : [...prev, color.id])}
                            className={`w-7 h-7 rounded-xl border-2 transition-all p-0.5 ${selectedColors.includes(color.id) ? 'border-[#0F3D2E] scale-110' : 'border-transparent'}`}
                          >
                            <div 
                              className="w-full h-full rounded-xl border border-black/5" 
                              style={{ backgroundColor: color.hex }}
                              title={color.label_bn}
                            />
                          </button>
                        ))}
                        <button className="w-7 h-7 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 transition-colors">
                          <span className="text-lg leading-none">+</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Placement */}
                  <AccordionItem value="placement" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{t("suitable_for")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-2">
                      <div className="space-y-3">
                        {PLACEMENTS.map((item) => (
                          <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`place-${item.id}`} className="border-slate-300 data-[state=checked]:bg-[#0F3D2E] data-[state=checked]:border-[#0F3D2E]" />
                              <label htmlFor={`place-${item.id}`} className="text-[15px] font-bold text-slate-600 group-hover:text-[#0F3D2E] cursor-pointer">
                                {language === 'bn' ? item.label_bn : item.label_en}
                              </label>
                            </div>
                            <span className="text-[13px] font-bold text-slate-400">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

                {/* Reset Button */}
                <button 
                  onClick={resetFilters}
                  className="w-full mt-8 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:rotate-180 transition-transform duration-500">
                    <RotateCcw size={16} />
                  </span>
                  {t("reset_filters")}
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-3 font-black text-sm text-slate-900 active:scale-95 transition-all shadow-sm"
            >
              <Filter size={18} className="text-primary" />
              {language === 'bn' ? 'ফিল্টার করুন' : 'Filters'}
            </button>
            <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-slate-400'}`}>
                <Grid2X2 size={18} />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-all ${viewMode === "list" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-slate-400'}`}>
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-xl border border-slate-100">
                <Loader2 className="animate-spin text-[#0F3D2E] mb-4" size={48} />
                <p className="text-slate-400 font-bold">{t("loading_products")}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-xl border border-slate-100 px-6 text-center">
                <Search size={48} className="text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-900 mb-2">{t("no_products_found")}</h3>
                <p className="text-slate-500 mb-8 max-w-sm">আপনার সার্চ ক্রাইটেরিয়া পরিবর্তন করে আবার চেষ্টা করুন</p>
                <button onClick={resetFilters} className="px-8 py-3 bg-[#0F3D2E] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/10">
                  সব প্রোডাক্ট দেখুন
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 md:gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredProducts.map((p, i) => (
                    <ProductCard key={p.id} {...p} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-16 flex items-center justify-center gap-2">
                  <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#0F3D2E] hover:text-[#0F3D2E] transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-[#0F3D2E] text-white font-black shadow-lg shadow-emerald-900/10">1</button>
                  {[2, 3, 4].map(n => (
                    <button key={n} className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-slate-600 hover:border-[#0F3D2E] hover:text-[#0F3D2E] transition-all">{n}</button>
                  ))}
                  <div className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">...</div>
                  <button className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-slate-600 hover:border-[#0F3D2E] hover:text-[#0F3D2E] transition-all">10</button>
                  <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#0F3D2E] hover:text-[#0F3D2E] transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Features Bar - 2x2 on Mobile, 4x1 on Desktop */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3 md:gap-5 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#F0F7F4] rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-[#0F3D2E] transition-all duration-500">
                <feature.icon className="text-[#0F3D2E] group-hover:text-white transition-colors duration-500" size={20} />
              </div>
              <div>
                <h4 className="font-black text-[#1A1A1A] text-[13px] md:text-base mb-0.5 md:mb-1 tracking-tight">
                  {language === 'bn' ? feature.title_bn : feature.title_en}
                </h4>
                <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-tight">
                  {language === 'bn' ? feature.sub_bn : feature.sub_en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Filter Drawer */}
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetContent side="left" className="w-[300px] p-0 border-none bg-white">
            <SheetHeader className="p-6 border-b border-slate-100">
              <SheetTitle className="text-left font-black text-slate-900 flex items-center justify-between">
                {t("filter")}
                <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden text-slate-400">
                  <X size={20} />
                </button>
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
              {/* Sidebar Content (Reusable) */}
              <Accordion type="multiple" defaultValue={["categories", "price"]} className="space-y-4">
                {/* Categories */}
                <AccordionItem value="categories" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0 mb-4">
                    <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-2">
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleCategory(cat.slug || cat.id)}>
                          <div className="flex items-center gap-3">
                            <Checkbox checked={selectedCategories.includes(cat.slug || cat.id)} className="border-slate-300 data-[state=checked]:bg-[#0F3D2E] data-[state=checked]:border-[#0F3D2E]" />
                            <span className={`text-[15px] font-bold transition-colors ${selectedCategories.includes(cat.slug || cat.id) ? 'text-[#0F3D2E]' : 'text-slate-600 group-hover:text-[#0F3D2E]'}`}>
                              {language === 'bn' ? (cat.name_bn || cat.name) : cat.name}
                            </span>
                          </div>
                          <span className="text-[13px] font-bold text-slate-400">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Price */}
                <AccordionItem value="price" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0 mb-4">
                    <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-widest">{language === 'bn' ? 'দামের পরিসর' : 'Price Range'}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-2 px-1">
                    <Slider
                      defaultValue={[200, 5000]}
                      max={10000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-600">৳ {priceRange[0]}</span>
                      <span className="text-sm font-bold text-slate-600">৳ {priceRange[1]}+</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-8 bg-primary text-white font-black rounded-xl h-12"
              >
                {t("apply_filters")}
              </Button>

              <button 
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full mt-4 text-slate-500 font-bold text-sm"
              >
                {t("reset_all")}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ShopPageContent />
    </Suspense>
  );
}
