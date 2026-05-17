"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, Upload, Loader2, Check,
  Search, ChevronDown, Plus, Gift,
  Settings, Trash2, Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

interface NewComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCombo: any) => void;
}

export function NewComboModal({ isOpen, onClose, onSuccess }: NewComboModalProps) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    basePrice: 0,
    comboPrice: 0,
    stock: 50,
    images: [] as string[],
    tags: [] as string[],
    seoTitle: "",
    seoDescription: "",
  });

  // Slug Availability State
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Product Selection State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCategories();
    }
  }, [isOpen]);

  // Real-time slug validation
  useEffect(() => {
    const checkSlug = async () => {
      if (!formData.slug || formData.slug.length < 3) {
        setSlugError(null);
        return;
      }

      setIsSlugChecking(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .eq('slug', formData.slug)
          .maybeSingle();

        if (data) {
          setSlugError(language === 'bn' ? "এই স্লাগটি ইতিমধ্যে ব্যবহার করা হয়েছে" : "Slug already taken");
        } else {
          setSlugError(null);
        }
      } catch (err) {
        console.error("Slug check error:", err);
      } finally {
        setIsSlugChecking(false);
      }
    };

    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [formData.slug, language]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_combo', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, images: [...formData.images, reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductSelection = (product: any) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const calculatePricing = () => {
    const totalBase = selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    const savings = formData.discountType === 'percentage' 
      ? (totalBase * formData.discountValue) / 100 
      : formData.discountValue;
    const finalPrice = totalBase - savings;

    return { totalBase, savings, finalPrice };
  };

  const { totalBase, savings, finalPrice } = calculatePricing();

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.name || !formData.slug) {
      toast.error(language === 'bn' ? "সবগুলো ঘর পূরণ করুন" : "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const newCombo = {
        name: formData.name,
        name_bn: formData.name, 
        is_combo: true,
        price: finalPrice,
        old_price: totalBase,
        stock: formData.stock,
        sku: formData.sku,
        category: "Combo",
        images: formData.images,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        status: isDraft ? 'draft' : 'active',
        landing_page_config: {
          hero_title: formData.name,
          hero_desc: formData.description,
          included_products: selectedProducts.map(p => ({
            id: p.id,
            name: p.name_bn || p.name,
            price: p.price,
            image: p.images?.[0]
          })),
          seo_title: formData.seoTitle,
          seo_description: formData.seoDescription,
          tags: formData.tags
        }
      };

      const { data, error } = await supabase
        .from('products')
        .insert(newCombo)
        .select()
        .single();

      if (error) throw error;

      toast.success(isDraft 
        ? (language === 'bn' ? "খসড়া হিসেবে সেভ হয়েছে!" : "Saved as draft!")
        : (language === 'bn' ? "নতুন কম্বো সফলভাবে তৈরি হয়েছে!" : "New combo created successfully!")
      );
      
      onSuccess(data);
      onClose();
    } catch (err: any) {
      console.error("Creation Error:", JSON.parse(JSON.stringify(err))); // Ensure error details are logged
      
      // Specifically handle unique constraint violation for slug
      if (err.code === '23505' || err.message?.includes('products_slug_key')) {
        toast.error(language === 'bn' 
          ? "এই স্লাগটি ইতিমধ্যে ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য একটি স্লাগ ব্যবহার করুন।" 
          : "This slug is already in use. Please use a different slug (URL)."
        );
      } else {
        toast.error(err.message || (language === 'bn' ? "কম্বো তৈরি করতে ব্যর্থ হয়েছে" : "Failed to create combo"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <Gift size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    {language === 'bn' ? "নতুন কম্বো তৈরি করুন" : "Create New Combo"}
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {language === 'bn' ? "একাধিক প্রোডাক্ট একসাথে কম্বো হিসেবে সেভ করুন" : "Combine multiple products into a single bundle offer"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area - Split Layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/30">
              
              {/* LEFT COLUMN - Combo Settings (60%) */}
              <div className="flex-[1.5] overflow-y-auto p-6 space-y-8 border-r border-slate-100 custom-scrollbar">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 bg-emerald-500 h-4 rounded-xl" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">কম্বো সেটিংস</h3>
                    <span className="text-[10px] text-slate-400 font-medium ml-auto">কম্বোর বিস্তারিত তথ্য দিন</span>
                  </div>

                  {/* Name & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                        কম্বো নাম <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g. Ramadan Special Combo"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                        স্লাগ (URL) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input 
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all pr-10 ${slugError ? 'border-rose-500' : 'border-slate-200 focus:border-emerald-500'}`}
                          placeholder="ramadan-special-combo"
                        />
                        <div className="absolute right-4 flex items-center gap-2">
                          {isSlugChecking ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : slugError ? (
                            <X size={14} className="text-rose-500" />
                          ) : formData.slug.length >= 3 ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <LinkIcon size={14} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      {slugError && <p className="text-[10px] font-bold text-rose-500 ml-1">{slugError}</p>}
                    </div>
                  </div>

                  {/* SKU & Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">SKU (আইডি)</label>
                      <input 
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g. COMBO-001"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">প্রাথমিক স্টক</label>
                      <input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                      কম্বো বিবরণ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all min-h-[100px] resize-none"
                        placeholder="Write something about this combo..."
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">
                        {formData.description.length}/160
                      </div>
                    </div>
                  </div>

                  {/* Discount & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">ডিসকাউন্ট ধরন</label>
                    <div className="relative group">
                      <select 
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer group-hover:bg-slate-50/50 dark:group-hover:bg-white/[0.08]"
                      >
                        <option value="percentage">{bn ? "পার্সেন্টেজ (%)" : "Percentage (%)"}</option>
                        <option value="fixed">{bn ? "ফিক্সড অ্যামাউন্ট (৳)" : "Fixed Amount (৳)"}</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors pointer-events-none" />
                    </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                        ডিসকাউন্ট (%) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input 
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        />
                        <span className="absolute right-4 text-slate-400 font-bold text-xs">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">স্ট্যাটাস</label>
                      <div className="flex items-center gap-3 h-11 px-1">
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                          className={`w-12 h-6 rounded-xl transition-all relative ${formData.isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-xl transition-all shadow-sm ${formData.isActive ? "left-7" : "left-1"}`} />
                        </button>
                        <span className="text-xs font-bold text-slate-600">অ্যাকটিভ</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">মূল মূল্য (সর্বমোট)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-slate-400 font-bold text-xs">৳</span>
                        <input 
                          disabled
                          value={totalBase}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                        কম্বো মূল্য <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-emerald-600 font-bold text-xs">৳</span>
                        <input 
                          value={finalPrice}
                          disabled
                          className="w-full pl-8 pr-4 py-2.5 bg-emerald-50/30 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-600"
                        />
                      </div>
                    </div>
                    <div className="pt-5">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">আপনি সেভ করবেন</span>
                        <span className="text-xs font-black text-emerald-600">৳ {savings} ({formData.discountValue}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">কম্বো ইমেজ</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="aspect-[2/1] bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-50/10 cursor-pointer overflow-hidden">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold text-slate-600">ইমেজ আপলোড করুন</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">PNG, JPG বা WEBP (সর্বোচ্চ 2MB)</p>
                          </div>
                          <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      
                      <div className="relative group aspect-[2/1] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        {formData.images[0] ? (
                          <>
                            <img src={formData.images[0]} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setFormData({ ...formData, images: [] })}
                              className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <img src="https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" />
                        )}
                        <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-emerald-500/20 transition-all rounded-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Search & Tags */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 bg-emerald-500 h-4 rounded-xl" />
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">সার্চ ও ট্যাগ</h3>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">ট্যাগ (কমা দিয়ে লিখুন)</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[46px]">
                        {formData.tags.map((tag, idx) => (
                          <div key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-xl flex items-center gap-2 border border-emerald-100">
                            {tag}
                            <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })}>
                              <X size={10} className="hover:text-rose-500" />
                            </button>
                          </div>
                        ))}
                        <input 
                          className="flex-1 bg-transparent outline-none text-xs min-w-[100px]" 
                          placeholder="নতুন ট্যাগ..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                setFormData({ ...formData, tags: [...formData.tags, val] });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">সেটা টাইটেল (SEO)</label>
                        <input 
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                          placeholder="SEO friendly title..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">সেটা বিবরণ (SEO)</label>
                        <div className="relative">
                          <input 
                            value={formData.seoDescription}
                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all pr-12"
                            placeholder="SEO description..."
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono">65/160</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Product Selection & Preview (40%) */}
              <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                
                {/* 1. Add Products Section */}
                <div className="p-6 space-y-4 border-b border-slate-100 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 bg-emerald-500 h-4 rounded-xl" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">১. প্রোডাক্ট যোগ করুন</h3>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 outline-none"
                        placeholder="প্রোডাক্ট সার্চ করুন..."
                      />
                    </div>
                    <div className="relative w-1/3 group">
                      <select className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer transition-all group-hover:bg-slate-50/50 dark:group-hover:bg-white/[0.08] pr-10">
                        <option value="">{bn ? "সব ক্যাটাগরি" : "All Categories"}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{bn ? cat.name_bn : cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {fetchingProducts ? (
                      <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">লোডিং প্রোডাক্টস...</span>
                      </div>
                    ) : products.length > 0 ? (
                      products.map((product) => {
                        const isSelected = selectedProducts.some(p => p.id === product.id);
                        return (
                          <div 
                            key={product.id}
                            onClick={() => toggleProductSelection(product)}
                            className={`p-2 bg-white border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/10 bg-emerald-50/5' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                            <div className={`w-5 h-5 rounded-xl border flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200'}`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <img src={product.images?.[0] || "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=200&auto=format&fit=crop"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-bold text-slate-800 truncate">{product.name_bn || product.name}</h4>
                              <p className="text-[10px] font-bold text-emerald-600">৳ {product.price}</p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-xl">স্টক: {product.stock || 0}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-xs text-slate-400 font-medium">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full h-9 border-emerald-200 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-50 border-dashed">
                    <Plus size={14} className="mr-1" /> নতুন প্রোডাক্ট যুক্ত করুন
                  </Button>
                </div>

                {/* 3. Combo Preview Section */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 bg-emerald-500 h-4 rounded-xl" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">৩. কম্বো প্রিভিউ</h3>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    {/* Visual Connection */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {selectedProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="relative group">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-transform group-hover:scale-110">
                              <img src={p.images?.[0] || ""} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-xl border border-slate-100 shadow-sm">{p.name_bn || p.name}</span>
                            </div>
                          </div>
                          {i < selectedProducts.length - 1 && (
                            <Plus size={12} className="text-slate-300" strokeWidth={3} />
                          )}
                        </div>
                      ))}
                      {selectedProducts.length === 0 && (
                        <div className="h-12 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">পণ্য সিলেক্ট করুন</div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                        <span>মোট প্রোডাক্ট</span>
                        <span className="font-bold text-slate-700">{selectedProducts.length} টি</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                        <span>সর্বমোট মূল্য</span>
                        <span className="font-bold text-slate-700">৳ {totalBase}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                        <span>কম্বো মূল্য</span>
                        <span className="font-bold text-emerald-600">৳ {finalPrice}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                        <span>ডিসকাউন্ট</span>
                        <span className="font-bold text-rose-500">{formData.discountValue}% (৳ {savings} সেভ)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50/20 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:border-emerald-400/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all group shadow-sm outline-none">
                  <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                  <span className="uppercase tracking-widest">{bn ? "সেটিংস" : "Settings"}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
                <div className="w-px h-6 bg-slate-100 dark:bg-white/5 mx-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {bn ? "সব তথ্য সঠিক আছে কি?" : "Is everything correct?"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={onClose}
                  variant="ghost"
                  className="h-12 px-6 rounded-xl font-black text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all uppercase tracking-widest"
                >
                  {bn ? "বাতিল" : "Cancel"}
                </Button>
                
                <Button 
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-black text-xs bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.08] shadow-sm uppercase tracking-widest transition-all"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (bn ? "খসড়া" : "Save Draft")}
                </Button>

                <Button 
                  onClick={() => handleSubmit(false)}
                  disabled={loading || selectedProducts.length === 0}
                  className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xl shadow-emerald-600/20 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={18} strokeWidth={3} />
                      {bn ? "কম্বো তৈরি করুন" : "Create Combo"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
