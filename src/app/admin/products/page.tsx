"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Pencil, Trash2, Search, Eye, Package, RefreshCw, 
  Layers, CheckCircle2, AlertCircle, Ban, ChevronLeft, ChevronRight,
  ListFilter, Check, X, Loader2, ArrowRight, ShoppingBag,
  Upload, Image as ImageIcon, Bold, Italic, List, Link as LinkIcon,
  ChevronDown, ChevronUp, Save, Globe, Hash, Layout, DollarSign,
  MoveLeft, MoveRight, Activity, Settings2, Star, Tag, FileText,
  Sparkles, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLanguage } from "@/lib/language-context";

interface LandingPageConfig {
  sizes?: { name: string; price: number }[];
  frames?: string[];
  package_contents?: string[];
  specifications?: { key: string; value: string }[];
  brand?: string;
  color?: string;
  weight?: string;
  hide_out_of_stock?: boolean;
  tags?: string;
  included_products?: { name: string; name_bn: string; price: number; image: string }[];
  hero_features?: string[];
  top_banner_text?: string;
}

interface Product {
  id: string;
  name: string;
  name_bn: string;
  price: number;
  old_price: number | null;
  category: string;
  stock: number;
  inventory_threshold: number;
  is_combo: boolean;
  badge: string | null;
  description: string;
  images: string[];
  sku: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  slug: string;
  material: string | null;
  installation: string | null;
  size: string | null;
  landing_page_config: LandingPageConfig;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  name_bn: string;
  sort_order: number;
}

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const pageSize = 12;

  const editorRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "", name_bn: "", price: "", old_price: "", category: "",
    stock: "10", inventory_threshold: "5", is_combo: false, badge: "", 
    description: "", images: [] as string[], sku: "", status: "active",
    meta_title: "", meta_description: "", slug: "",
    material: "", installation: "", size: "", landing_page_config: {
      sizes: [] as { name: string; price: number }[],
      frames: [] as string[],
      package_contents: [] as string[],
      specifications: [] as { key: string; value: string }[],
      brand: "",
      color: "",
      weight: "",
      hide_out_of_stock: false,
      tags: ""
    } as LandingPageConfig
  });

  const loadData = async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true })
    ]);
    
    if (productsRes.error) {
      console.error("Products Load Error:", JSON.stringify(productsRes.error, null, 2));
      toast.error(t("failed_load_products"));
    } else setProducts(productsRes.data || []);

    if (categoriesRes.error) {
      console.error("Categories Load Error:", JSON.stringify(categoriesRes.error, null, 2));
      toast.error(t("failed_load_categories"));
    } else {
      const cats = categoriesRes.data || [];
      setCategories(cats);
      if (cats.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: cats[0].name }));
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    outOfStock: products.filter((p) => Number(p.stock) <= 0).length,
    inactive: products.filter((p) => p.status !== 'active').length,
  }), [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.name_bn.includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, categoryFilter, searchQuery]);

  const pagedProducts = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page]);



  const handleEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      name: p.name || "",
      name_bn: p.name_bn || "",
      price: String(p.price || ""),
      old_price: p.old_price ? String(p.old_price) : "",
      category: p.category || "wall-decor",
      stock: String(p.stock || "0"),
      inventory_threshold: String(p.inventory_threshold || "5"),
      is_combo: p.is_combo || false,
      badge: p.badge || "",
      description: p.description || "",
      images: p.images || [],
      sku: p.sku || "",
      status: p.status || "active",
      meta_title: p.meta_title || "",
      meta_description: p.meta_description || "",
      slug: p.slug || "",
      material: p.material || "",
      installation: p.installation || "",
      size: p.size || "",
         landing_page_config: {
           sizes: p.landing_page_config?.sizes || [],
           frames: p.landing_page_config?.frames || [],
           package_contents: p.landing_page_config?.package_contents || [],
           specifications: p.landing_page_config?.specifications || [],
           brand: p.landing_page_config?.brand || "",
           color: p.landing_page_config?.color || "",
           weight: p.landing_page_config?.weight || "",
           hide_out_of_stock: p.landing_page_config?.hide_out_of_stock || false,
           tags: p.landing_page_config?.tags || "",
           included_products: p.landing_page_config?.included_products || [],
           hero_features: p.landing_page_config?.hero_features || [],
           top_banner_text: p.landing_page_config?.top_banner_text || ""
         }
    });
    setShowForm(true);
  };

  useEffect(() => {
    if (showForm && editorRef.current) {
      editorRef.current.innerHTML = form.description;
    }
  }, [showForm]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(t(newStatus === 'active' ? "status_active_success" : "status_inactive_success"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("product_delete_confirm"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(t("delete_failure"));
    else {
      toast.success(t("product_deleted_success"));
      loadData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);
        
        return publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);
      setForm(prev => ({ ...prev, images: [...prev.images, ...publicUrls] }));
      toast.success(`${publicUrls.length} ${t("images_uploaded_success")}`);
    } catch (error) {
      const err = error as Error;
      toast.error(`${t("upload_failed")}: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleImageAdd = () => {
    const url = prompt("অথবা ইমেজ URL লিখুন:");
    if (url && url.trim()) {
      setForm({ ...form, images: [...form.images, url.trim()] });
    }
  };

  const handleImageMove = (index: number, direction: 'left' | 'right') => {
    const newImages = [...form.images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setForm({ ...form, images: newImages });
    }
  };

  const handleImageRemove = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setForm({ ...form, description: editorRef.current.innerHTML });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove duplicate hyphens
      .trim();
  };

  const handleNameChange = (val: string, isBn: boolean) => {
    setForm(prev => {
      const updates: Partial<typeof prev> = isBn ? { name_bn: val } : { name: val };
      
      // Auto-set SEO if not manually edited (basic heuristic: if field is empty or matches old auto-gen)
      const currentName = isBn ? val : prev.name_bn;
      const currentEnName = isBn ? prev.name : val;
      
      if (!prev.meta_title || prev.meta_title === (isBn ? prev.name_bn : prev.name)) {
        updates.meta_title = val;
      }
      
      if (!prev.slug || prev.slug === generateSlug(isBn ? prev.name_bn : prev.name)) {
        updates.slug = generateSlug(val || (isBn ? prev.name_bn : prev.name));
      }

      if (!prev.meta_description) {
        updates.meta_description = `Buy ${val} at the best price in Bangladesh. High quality ${val} available now at Rangao.`;
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const description = editorRef.current?.innerHTML || "";
    
    const data = {
      name: form.name || form.name_bn,
      name_bn: form.name_bn,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      category: form.category,
      stock: Number(form.stock),
      inventory_threshold: Number(form.inventory_threshold),
      is_combo: form.is_combo,
      badge: form.badge || null,
      description,
      images: form.images,
      sku: form.sku,
      status: form.status,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      slug: form.slug || generateSlug(form.name || form.name_bn) || null,
      material: form.material || null,
      installation: form.installation || null,
      size: form.size || null,
      landing_page_config: form.landing_page_config
    };

    let error;
    if (editing) {
      const res = await supabase.from("products").update(data).eq("id", editing);
      error = res.error;
    } else {
      const res = await supabase.from("products").insert(data);
      error = res.error;
    }

    if (error) {
      toast.error(t("save_failure") + ": " + error.message);
    } else {
      toast.success(t("product_saved_success"));
      setShowForm(false);
      loadData();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Dashboard Style Header */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                 <Package size={20} />
              </div>
              <div>
                 <h1 className="text-xl font-bold">
                   {t("product_management")}
                 </h1>
                 <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-xl animate-pulse" />
                    <p className="text-xs text-white/60">
                       {t("total_products_live").replace("{count}", String(products.length))}
                    </p>
                 </div>
              </div>
           </div>
           <button 
             onClick={() => { setEditing(null); setForm({
               name: "", name_bn: "", price: "", old_price: "", category: categories[0]?.name || "",
               stock: "10", inventory_threshold: "5", is_combo: false, badge: "", 
               description: "", images: [], sku: "", status: "active",
               meta_title: "", meta_description: "", slug: "",
               material: "", installation: "", size: "", landing_page_config: {
                 sizes: [],
                 frames: [],
                 package_contents: [],
                 specifications: [],
                 included_products: [],
                 hero_features: [],
                 top_banner_text: ""
               }
             }); setShowForm(true); }}
             className="px-4 py-2.5 bg-white text-primary rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-white/90 transition-all shadow-sm"
           >
             <Plus size={15} />
             {t("new_product")}
           </button>
        </div>
      </div>

      {/* Standardized Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("total_items"), value: stats.total, icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: t("active_listings"), value: stats.active, icon: CheckCircle2, color: "text-primary", bg: "bg-emerald-50 dark:bg-primary/10" },
          { label: t("stock_warnings"), value: stats.outOfStock, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
          { label: t("draft_archived"), value: stats.inactive, icon: Ban, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 truncate mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Standardized Filters */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t("search_catalog")}
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-12 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
            />
         </div>
         <div className="flex bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["all", ...categories.map(c => c.name)].map((cat) => (
               <button 
                 key={cat}
                 onClick={() => setCategoryFilter(cat)}
                 className={`px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${categoryFilter === cat ? "bg-white dark:bg-slate-800 text-primary shadow-md " : "text-slate-400 hover:text-slate-600"}`}
               >
                 {cat === 'all' ? t("all") : (categories.find(c => c.name === cat)?.name_bn || cat.replace('-', ' '))}
               </button>
            ))}
         </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] "></th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("product")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("category")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("price")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("stock")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("status")}</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {pagedProducts.map((p, idx) => (
                <motion.tr 
                  key={p.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all group cursor-pointer"
                >
                  <td className="px-10 py-8">
                    <div className={`w-3 h-3 rounded-xl ${p.status === 'active' ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]'} transition-all`} />
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 p-1 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                         {p.images?.[0] ? (
                           <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                         ) : (
                           <Package size={20} className="m-auto h-full text-slate-300 " />
                         )}
                       </div>
                       <div>
                          <p className="text-base font-black text-slate-900 dark:text-white  tracking-tight mb-1 group-hover:text-primary transition-colors">
                            {p.name_bn || p.name}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-tighter bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-xl">
                                {p.sku || "NO-SKU"}
                             </span>
                             {p.is_combo && (
                               <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-xl uppercase tracking-[0.2em] ">Combo</span>
                             )}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 dark:border-white/5 ">
                       {p.category}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                       <p className="text-base font-black text-slate-900 dark:text-white ">৳{p.price.toLocaleString()}</p>
                       {p.old_price && <p className="text-[10px] text-slate-400 line-through font-bold">৳{p.old_price.toLocaleString()}</p>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`flex items-center gap-3 font-black text-sm  ${p.stock <= (p.inventory_threshold || 5) ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      <div className={`w-2 h-2 rounded-xl ${p.stock <= (p.inventory_threshold || 5) ? 'bg-rose-500 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      {p.stock}
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">units</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(p.id, p.status); }}
                      className={`w-14 h-7 rounded-xl relative transition-all duration-500 shadow-inner overflow-hidden group/switch ${p.status === 'active' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                       <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-xl transition-all duration-500 shadow-xl ${p.status === 'active' ? 'left-8 scale-110' : 'left-2 scale-90'}`} />
                       <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/switch:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleEdit(p); }} 
                         className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95"
                         title={t("edit")}
                       >
                         <Pencil size={20} />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} 
                         className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95"
                         title={t("delete")}
                       >
                         <Trash2 size={20} />
                       </button>
                       <a 
                         href={`/product/${p.slug}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95"
                         title={t("view_on_store")}
                         onClick={(e) => e.stopPropagation()}
                       >
                         <ExternalLink size={20} />
                       </a>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        <div className="px-10 py-8 bg-slate-50/50 dark:bg-white/1 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-primary/20 rounded-xl overflow-hidden">
                 <div className="w-full bg-primary transition-all" style={{ height: `${(page / Math.ceil(filtered.length / pageSize)) * 100}%` }} />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ">
                {t("page_counter")} {page} <span className="mx-2 opacity-30">/</span> {Math.ceil(filtered.length / pageSize)}
              </p>
           </div>
           <div className="flex items-center gap-4">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="h-12 px-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest "
              >
                <ChevronLeft size={18} /> {t("prev")}
              </button>
              <button 
                disabled={page * pageSize >= filtered.length} 
                onClick={() => setPage(p => p + 1)} 
                className="h-12 px-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest "
              >
                {t("next")} <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

            {/* New Product Form Design */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[1200px] max-h-[90vh] p-0 border-none overflow-hidden bg-[#F8FAFC] dark:bg-[#0c0c0c] shadow-2xl flex flex-col rounded-xl">
           <VisuallyHidden><DialogTitle>Product Lifecycle Management</DialogTitle></VisuallyHidden>
           
           {/* Header */}
           <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <ShoppingBag size={24} />
               </div>
               <div>
                 <h2 className="text-[20px] font-bold text-slate-900 dark:text-white">
                   {t("add_new_product")}
                 </h2>
                 <p className="text-[13px] text-slate-500 mt-0.5">
                   {t("product_details_desc")}
                 </p>
               </div>
             </div>
             <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
               <X size={20} />
             </button>
           </div>

           {/* Scrollable Body */}
           <div className="flex-1 overflow-y-auto p-6 md:p-8">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1100px] mx-auto">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Image Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <ImageIcon size={20} className="text-emerald-600" />
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("product_images")}</h3>
                        <p className="text-[12px] text-slate-500">{t("ratio_hint")}</p>
                      </div>
                    </div>
                    
                    <label className="border-2 border-dashed border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors mb-6">
                       {uploading ? (
                          <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
                       ) : (
                          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-emerald-600 mb-4">
                            <Upload size={28} />
                          </div>
                       )}
                       <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                         {t("upload_image")}
                       </p>
                       <p className="text-[13px] text-slate-500">
                         {t("drag_drop_hint")}
                       </p>
                       <p className="text-[12px] text-slate-400 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} multiple />
                    </label>

                    <div className="grid grid-cols-4 gap-4">
                      {form.images.slice(0, 4).map((url, i) => (
                        <div key={i} className={`aspect-square rounded-xl overflow-hidden relative group border ${i === 0 ? 'border-emerald-500' : 'border-slate-200 dark:border-white/10'}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleImageRemove(i)} className="absolute top-1 right-1 w-6 h-6 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                          </button>
                          {i === 0 && (
                            <div className="absolute top-1 left-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-xl">
                              {t("primary_image")}
                            </div>
                          )}
                        </div>
                      ))}
                      {form.images.length < 4 && [...Array(4 - form.images.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                          {i === 0 && form.images.length === 0 ? <ImageIcon size={24} /> : <Plus size={24} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText size={20} className="text-emerald-600" />
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("product_info")}</h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("product_name")} <span className="text-rose-500">*</span>
                        </label>
                        <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value, false)} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder={t("product_name_placeholder")} />
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {bn ? "ক্যাটাগরি" : "Category"} <span className="text-rose-500">*</span>
                        </label>
                        <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 appearance-none bg-white">
                          {categories.map(c => <option key={c.id} value={c.name}>{language === 'bn' ? c.name_bn : c.name.replace('-', ' ')}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("brand_optional")}
                          </label>
                          <input type="text" value={form.landing_page_config.brand || ''} onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, brand: e.target.value}} as any)} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder={t("brand_placeholder")} />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("model_sku_optional")}
                          </label>
                          <input type="text" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder={t("sku_placeholder")} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("short_description")} <span className="text-rose-500">*</span>
                        </label>
                        <textarea value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} maxLength={200} className="w-full h-24 p-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 resize-none" placeholder={t("short_description_placeholder")} />
                        <div className="text-right text-[11px] text-slate-400 mt-1">{form.meta_description?.length || 0}/200</div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("detailed_description")} <span className="text-rose-500">*</span>
                        </label>
                        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all dark:bg-slate-800">
                          <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
                            <select className="text-[13px] bg-transparent outline-none border-none text-slate-700 dark:text-slate-300 px-2">
                              <option>Normal</option>
                              <option>Heading 1</option>
                              <option>Heading 2</option>
                            </select>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2" />
                            <button type="button" onClick={() => execCommand('bold')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><Bold size={16} /></button>
                            <button type="button" onClick={() => execCommand('italic')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><Italic size={16} /></button>
                            <button type="button" onClick={() => execCommand('underline')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-serif underline">U</button>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2" />
                            <button type="button" onClick={() => execCommand('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><List size={16} /></button>
                            <button type="button" onClick={() => execCommand('insertOrderedList')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[12px] font-bold">1.</button>
                            <button type="button" onClick={() => { const url = prompt("Link URL:"); if (url) execCommand('createLink', url); }} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><LinkIcon size={16} /></button>
                          </div>
                          <div 
                            ref={editorRef}
                            contentEditable 
                            onInput={() => setForm({ ...form, description: editorRef.current?.innerHTML || "" })}
                            className="w-full min-h-[150px] p-4 outline-none text-[14px] leading-relaxed dark:text-slate-200"
                            data-placeholder={t("description_placeholder")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Pricing Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <DollarSign size={20} className="text-emerald-600" />
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("pricing")}</h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("price")} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
                          <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full h-11 pl-10 pr-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="যেমন: 1450" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("old_price_optional")}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
                          <input type="number" value={form.old_price} onChange={(e) => setForm({...form, old_price: e.target.value})} className="w-full h-11 pl-10 pr-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. 2000" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("discount_percentage")}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                          <input type="number" value={form.old_price && form.price && Number(form.old_price) > 0 ? Math.round(((Number(form.old_price) - Number(form.price)) / Number(form.old_price)) * 100) : ''} readOnly className="w-full h-11 pl-10 pr-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] bg-slate-50 dark:bg-slate-800/50 outline-none text-slate-500" placeholder="যেমন: 28" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <Package size={20} className="text-emerald-600" />
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("stock_inventory")}</h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("stock_amount")} <span className="text-rose-500">*</span>
                        </label>
                        <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. 50" />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("status")}
                          </label>
                          <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 bg-white">
                            <option value="active">{t("active")}</option>
                            <option value="draft">{t("draft")}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("alert_level")}
                          </label>
                          <input type="number" value={form.inventory_threshold} onChange={(e) => setForm({...form, inventory_threshold: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. 5" />
                        </div>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <div className={`w-5 h-5 rounded-xl border flex items-center justify-center transition-colors ${form.landing_page_config.hide_out_of_stock ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 dark:border-slate-600'}`}>
                          {form.landing_page_config.hide_out_of_stock && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={form.landing_page_config.hide_out_of_stock as boolean} onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, hide_out_of_stock: e.target.checked}} as any)} />
                        <span className="text-[13px] text-slate-600 dark:text-slate-400">
                          {t("hide_out_of_stock_hint")}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Attributes Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <ListFilter size={20} className="text-emerald-600" />
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("product_attributes")}</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("size_optional")}
                          </label>
                          <input type="text" value={form.size} onChange={(e) => setForm({...form, size: e.target.value})} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. 100x50cm" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t("color_optional")}
                          </label>
                          <input type="text" value={form.landing_page_config.color || ''} onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, color: e.target.value}} as any)} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. Green" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("weight_optional")}
                        </label>
                        <input type="text" value={form.landing_page_config.weight || ''} onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, weight: e.target.value}} as any)} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder="e.g. 500g" />
                      </div>

                      <button type="button" onClick={() => setForm({...form, landing_page_config: {...form.landing_page_config, specifications: [...(form.landing_page_config?.specifications || []), {key: '', value: ''}]}})} className="w-full h-11 border border-emerald-200 text-emerald-600 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                        <Plus size={16} /> {t("add_more_attributes")}
                      </button>

                      {form.landing_page_config.specifications?.map((spec: any, i: number) => (
                        <div key={i} className="flex gap-2 items-center mt-2">
                           <input type="text" value={spec.key} onChange={(e) => {
                             const newSpecs = [...(form.landing_page_config.specifications || [])];
                             newSpecs[i].key = e.target.value;
                             setForm({...form, landing_page_config: {...form.landing_page_config, specifications: newSpecs}});
                           }} placeholder="Name" className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-[13px] dark:bg-slate-800 dark:border-white/10" />
                           <input type="text" value={spec.value} onChange={(e) => {
                             const newSpecs = [...(form.landing_page_config.specifications || [])];
                             newSpecs[i].value = e.target.value;
                             setForm({...form, landing_page_config: {...form.landing_page_config, specifications: newSpecs}});
                           }} placeholder="Value" className="flex-2 h-10 px-3 border border-slate-200 rounded-xl text-[13px] dark:bg-slate-800 dark:border-white/10" />
                           <button type="button" onClick={() => {
                              const newSpecs = (form.landing_page_config.specifications || []).filter((_: any, idx: number) => idx !== i);
                              setForm({...form, landing_page_config: {...form.landing_page_config, specifications: newSpecs}});
                           }} className="text-rose-500 hover:text-rose-600 p-2"><Trash2 size={16} /></button>
                        </div>
                      ))}

                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-4">
                          <Tag size={14} className="inline mr-1 text-emerald-600" />
                          {t("product_tags_optional")}
                        </label>
                        <input type="text" value={form.landing_page_config.tags || ''} onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, tags: e.target.value}} as any)} className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" placeholder={t("tags_placeholder")} />
                        <p className="text-[12px] text-slate-500 mt-2">{t("tag_hint")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Landing Page Customization Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles size={20} className="text-emerald-600" />
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t("landing_page_customization")}</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t("top_banner_text_label")}
                        </label>
                        <input 
                          type="text" 
                          value={form.landing_page_config.top_banner_text || ''} 
                          onChange={(e) => setForm({...form, landing_page_config: {...form.landing_page_config, top_banner_text: e.target.value}} as any)} 
                          className="w-full h-11 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800" 
                          placeholder={t("top_banner_placeholder")} 
                        />
                      </div>

                      {/* Included Products Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            {t("whats_included_combo")}
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setForm({...form, landing_page_config: {...form.landing_page_config, included_products: [...(form.landing_page_config.included_products || []), {name: '', name_bn: '', price: 0, image: ''}]}} as any)}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            + {t("add_item")}
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {form.landing_page_config.included_products?.map((item: any, i: number) => (
                            <div key={i} className="p-4 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/2 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item #{i+1}</span>
                                <button type="button" onClick={() => {
                                  const newItems = (form.landing_page_config.included_products || []).filter((_: any, idx: number) => idx !== i);
                                  setForm({...form, landing_page_config: {...form.landing_page_config, included_products: newItems}} as any);
                                }} className="text-rose-500 hover:text-rose-600"><X size={14} /></button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={item.name} onChange={(e) => {
                                  const newItems = [...(form.landing_page_config.included_products || [])];
                                  newItems[i].name = e.target.value;
                                  setForm({...form, landing_page_config: {...form.landing_page_config, included_products: newItems}} as any);
                                }} placeholder="English Name" className="h-9 px-3 border border-slate-200 rounded-xl text-[12px] dark:bg-slate-800 dark:border-white/10" />
                                <input type="text" value={item.name_bn} onChange={(e) => {
                                  const newItems = [...(form.landing_page_config.included_products || [])];
                                  newItems[i].name_bn = e.target.value;
                                  setForm({...form, landing_page_config: {...form.landing_page_config, included_products: newItems}} as any);
                                }} placeholder="Bangla Name" className="h-9 px-3 border border-slate-200 rounded-xl text-[12px] dark:bg-slate-800 dark:border-white/10" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input type="number" value={item.price} onChange={(e) => {
                                  const newItems = [...(form.landing_page_config.included_products || [])];
                                  newItems[i].price = Number(e.target.value);
                                  setForm({...form, landing_page_config: {...form.landing_page_config, included_products: newItems}} as any);
                                }} placeholder="Regular Price" className="h-9 px-3 border border-slate-200 rounded-xl text-[12px] dark:bg-slate-800 dark:border-white/10" />
                                <input type="text" value={item.image} onChange={(e) => {
                                  const newItems = [...(form.landing_page_config.included_products || [])];
                                  newItems[i].image = e.target.value;
                                  setForm({...form, landing_page_config: {...form.landing_page_config, included_products: newItems}} as any);
                                }} placeholder="Image URL" className="h-9 px-3 border border-slate-200 rounded-xl text-[12px] dark:bg-slate-800 dark:border-white/10" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package Contents / About Sidebar */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            {t("package_contents_sidebar")}
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setForm({...form, landing_page_config: {...form.landing_page_config, package_contents: [...(form.landing_page_config.package_contents || []), ""]}} as any)}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            + {t("add_line")}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {form.landing_page_config.package_contents?.map((line: string, i: number) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="text" value={line} onChange={(e) => {
                                const newLines = [...(form.landing_page_config.package_contents || [])];
                                newLines[i] = e.target.value;
                                setForm({...form, landing_page_config: {...form.landing_page_config, package_contents: newLines}} as any);
                              }} placeholder="e.g. Premium Quality Wood" className="flex-1 h-9 px-3 border border-slate-200 rounded-xl text-[12px] dark:bg-slate-800 dark:border-white/10" />
                              <button type="button" onClick={() => {
                                const newLines = (form.landing_page_config.package_contents || []).filter((_: any, idx: number) => idx !== i);
                                setForm({...form, landing_page_config: {...form.landing_page_config, package_contents: newLines}} as any);
                              }} className="text-rose-500 p-1"><X size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           </div>

           {/* Footer */}
           <div className="px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0 rounded-xl">
              <button onClick={() => setShowForm(false)} className="px-8 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[14px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                 {t("cancel_btn")}
              </button>
              <button onClick={handleSubmit} disabled={saving} className="px-8 h-12 bg-[#0F3D2E] text-white rounded-xl text-[14px] font-bold flex items-center gap-2 hover:bg-[#0a2a1f] transition-colors">
                 {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {t("save_product")}
              </button>
           </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
