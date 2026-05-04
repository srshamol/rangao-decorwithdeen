import { 
  Plus, Trash2, Save, ChevronRight, Layout, Clock, Image as ImageIcon, 
  Video, BadgeCheck, Type, ShoppingCart, Star, HelpCircle, Download, Upload, 
  Eye, Monitor, Smartphone, ChevronDown, MoveVertical, X, Check, DollarSign,
  Camera, Play, ShieldCheck, User, Sparkles, ArrowRight, Search, RefreshCw, Layers, Pencil, MoreVertical, ChevronLeft, Loader2,
  Globe, Target, EyeOff, Facebook, TrendingUp, AlertTriangle, CheckCircle2, ExternalLink
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { NewComboModal } from "../combo/NewComboModal";

interface ComboSettingsProps {
  settings: any;
  onUpdate: (newSettings: any) => void;
  initialCombos?: any[];
  categories?: any[];
  showCreateModalExternal?: boolean;
  onCloseCreateModalExternal?: () => void;
}

export function ComboSettings({ settings, onUpdate, initialCombos = [], categories: initialCategories = [], showCreateModalExternal, onCloseCreateModalExternal }: ComboSettingsProps) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [combos, setCombos] = useState<any[]>(initialCombos);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<"product" | "category">("product");
  const [selectorCallback, setSelectorCallback] = useState<((item: any) => void) | null>(null);
  const [selectorSearch, setSelectorSearch] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("products").select("*").eq("is_combo", false)
      ]);
      
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setAllProducts(prodRes.data);
    };
    fetchData();
  }, []);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string>("countdown");
  const [showGlobal, setShowGlobal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { t } = useLanguage();
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    setCombos(initialCombos);
  }, [initialCombos]);

  useEffect(() => {
    if (showCreateModalExternal) {
      setShowCreateModal(true);
    } else {
      setShowCreateModal(false);
    }
  }, [showCreateModalExternal]);

  const loadCombos = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_combo', true)
      .order('created_at', { ascending: false });
    
    setCombos(data || []);
  };

  const handleSelectCombo = (combo: any) => {
    setSelectedCombo(combo);
    const defaultConfig = {
      countdown_enabled: true,
      countdown_timer: { days: 0, hours: 1, minutes: 0, seconds: 0 },
      media_type: 'url',
      video_url: "",
      badge_text: "১০০% অরিজিনাল প্রিমিয়াম প্রোডাক্ট",
      hero_title: "আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে",
      hero_desc: "আয়াতুল কুরসি ৩ডি ওয়াল ক্যানভাস + ২০ পিস ইসলামিক দোয়া স্টিকার + উডেন কী হ্যাঙ্গার",
      hero_button_text: "অর্ডার করতে এখানে ক্লিক করুন",
      included_products: [],
      trust_badges: [
        { icon: "ShieldCheck", text: "প্রিমিয়াম কোয়ালিটি" },
        { icon: "Truck", text: "দ্রুত ডেলিভারি" }
      ],
      reviews: [],
      faq: []
    };
    setConfig(combo.landing_page_config || defaultConfig);
  };

  const filteredCombos = combos.filter(combo => {
    const matchesSearch = (combo.name_bn || combo.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (combo.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || combo.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || combo.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                         (stockFilter === "in_stock" && combo.stock > 0) || 
                         (stockFilter === "out_of_stock" && combo.stock <= 0);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesStock;
  });

  const handleStatusToggle = async (combo: any) => {
    const newStatus = combo.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', combo.id);
    
    if (error) {
      toast.error("Status update failed");
      return;
    }
    
    toast.success(newStatus === 'active' ? t("status_active_success") : t("status_inactive_success"));
    loadCombos();
  };

  const openSelector = (type: "product" | "category", callback: (item: any) => void) => {
    setSelectorType(type);
    setSelectorCallback(() => callback);
    setIsSelectorOpen(true);
    setSelectorSearch("");
  };

  const handleSelectItem = (item: any) => {
    if (selectorCallback) {
      selectorCallback(item);
    }
    setIsSelectorOpen(false);
  };

  const handleDeleteCombo = async (id: string) => {
    if (!confirm(t("product_delete_confirm"))) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Combo deleted");
    loadCombos();
    if (selectedCombo?.id === id) setSelectedCombo(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ selectedCombo, config }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `combo_settings_${selectedCombo.slug}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const saveAll = async () => {
    if (!selectedCombo) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name_bn: selectedCombo.name_bn,
          price: selectedCombo.price,
          old_price: selectedCombo.old_price,
          stock: selectedCombo.stock,
          badge: selectedCombo.badge,
          slug: selectedCombo.slug,
          category: selectedCombo.category,
          landing_page_config: config,
          status: selectedCombo.status
        })
        .eq('id', selectedCombo.id);

      if (error) throw error;
      toast.success(bn ? "সব সেটিংস সংরক্ষিত হয়েছে!" : "All settings saved successfully!");
      loadCombos();
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(bn ? `সেভ করতে সমস্যা হয়েছে: ${err.message}` : `Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showGlobal ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{bn ? "গ্লোবাল কম্বো সেটিংস" : "Global Combo Settings"}</h2>
            <p className="text-sm text-slate-400 font-bold">{bn ? "সব কম্বো পেজের জন্য সাধারণ সেটিংস" : "General settings for all combo pages"}</p>
          </div>
          <Button onClick={() => setShowGlobal(false)} variant="outline" className="rounded-xl border-slate-200 font-black h-11 px-6 gap-2 hover:bg-white transition-all">
            <ArrowRight className="rotate-180" size={16} /> {bn ? "তালিকায় ফিরুন" : "Back to List"}
          </Button>
        </div>
        
        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{bn ? "চেকআউট বাটন টেক্সট" : "Default Checkout Button Text"}</label>
              <input 
                value={settings.checkout_button_text || ""}
                onChange={(e) => onUpdate({ ...settings, checkout_button_text: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{bn ? "গ্লোবাল কাস্টম মেসেজ" : "Global Custom Message"}</label>
              <input 
                value={settings.custom_message || ""}
                onChange={(e) => onUpdate({ ...settings, custom_message: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "show_trust_badges", label: bn ? "ট্রাস্ট ব্যাজ দেখান" : "Show Trust Badges" },
              { id: "show_reviews", label: bn ? "রিভিউ দেখান" : "Show Reviews" },
              { id: "show_lifestyle_gallery", label: bn ? "গ্যালারি দেখান" : "Show Lifestyle Gallery" },
            ].map(toggle => (
              <div key={toggle.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 group hover:border-primary/20 transition-all">
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{toggle.label}</span>
                <button 
                  onClick={() => onUpdate({ ...settings, [toggle.id]: !settings[toggle.id] })}
                  className={`w-12 h-6 rounded-xl transition-all relative ${settings[toggle.id] ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-xl transition-all shadow-sm ${settings[toggle.id] ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      ) : !selectedCombo ? (
        <div className="space-y-8">
        {/* Modern Products-style Filter Bar */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-center gap-6">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={bn ? "প্রোডাক্ট নাম, SKU বা আইডি সার্চ করুন..." : "Search combos..."}
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
              />
           </div>
           
           <div className="flex items-center bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar">
              {["all", ...categories.map(c => c.name)].map((cat) => (
                 <button 
                   key={cat}
                   onClick={() => setCategoryFilter(cat)}
                   className={`px-8 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 ${categoryFilter === cat ? "bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5 " : "text-slate-400 hover:text-slate-600"}`}
                 >
                   {cat === 'all' ? (bn ? "সব" : "All") : (categories.find(c => c.name === cat)?.name_bn || cat.replace('-', ' '))}
                 </button>
              ))}
           </div>
        </div>

        {/* Standardized Table Style */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("combo_info")}</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("sku")}</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("type")}</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("product_count")}</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("price_taka")}</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("status")}</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredCombos.map((combo, idx) => {
                  const discount = combo.old_price ? Math.round(((combo.old_price - combo.price) / combo.old_price) * 100) : 0;
                  const categoryName = categories.find(c => c.name === combo.category)?.name_bn || combo.category;
                  
                  return (
                    <motion.tr 
                      key={combo.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleSelectCombo(combo)}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group cursor-pointer"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 p-1 shrink-0 overflow-hidden group-hover:scale-110 transition-transform shadow-sm">
                            <img src={combo.images?.[0] || "/placeholder.svg"} className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-slate-900 dark:text-white truncate tracking-tight mb-0.5">{combo.name_bn || combo.name}</p>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{categoryName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/5 shadow-sm">{combo.sku || "NO-SKU"}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-[12px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-4 py-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20">{t("combo")}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[14px] font-black text-slate-900 dark:text-white tracking-tighter">
                            {combo.landing_page_config?.included_products?.length || 0} {bn ? "টি" : "Items"}
                          </span>
                          <div className="flex -space-x-2">
                             {(combo.landing_page_config?.included_products || []).slice(0, 3).map((p: any, i: number) => (
                               <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-sm">
                                 <img src={p.image} className="w-full h-full object-cover" />
                               </div>
                             ))}
                             {(combo.landing_page_config?.included_products?.length || 0) > 3 && (
                               <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                 +{(combo.landing_page_config?.included_products?.length || 0) - 3}
                               </div>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-base font-black text-slate-900 dark:text-white tracking-tighter">৳{combo.price?.toLocaleString()}</span>
                          {combo.old_price && (
                            <span className="text-[10px] font-bold text-slate-400 line-through opacity-50 tracking-tighter">৳{combo.old_price?.toLocaleString()}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center gap-3">
                              <Switch 
                                checked={combo.status === 'active'}
                                onCheckedChange={() => handleStatusToggle(combo)}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${combo.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {combo.status === 'active' ? (bn ? "সক্রিয়" : "Active") : (bn ? "নিষ্ক্রিয়" : "Inactive")}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(`/combo/${combo.slug || combo.id}`, '_blank'); }}
                              className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                              title={t("view")}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSelectCombo(combo); }}
                              className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-all border border-amber-100 dark:border-amber-500/20 shadow-sm"
                              title={t("edit")}
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(`https://decorwithdeen.com/combo/${combo.slug || combo.id}`, '_blank'); }}
                              className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all border border-blue-100 dark:border-blue-500/20 shadow-sm"
                              title={t("view_on_store")}
                            >
                              <ExternalLink size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCombo(combo.id); }}
                              className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all border border-rose-100 dark:border-rose-500/20 shadow-sm"
                              title={t("delete")}
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredCombos.length === 0 && (
            <div className="py-24 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-xl border border-slate-100 dark:border-white/5 mb-6">
                <Search size={32} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{bn ? "কোনো কম্বো পাওয়া যায়নি" : "No Combos Found"}</h3>
              <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto mt-2">{bn ? "আপনার সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your search or filters to find what you're looking for."}</p>
            </div>
          )}
        </div>
        
        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">{bn ? "প্রতি পৃষ্ঠায়:" : "Items per page:"}</span>
            <select className="bg-slate-50 dark:bg-white/5 border-none rounded-xl text-xs font-black px-4 py-2 outline-none">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft size={18} /></button>
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${p === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-100"}`}>{p}</button>
            ))}
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex h-full min-h-[850px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl relative">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <Button 
            onClick={() => setSelectedCombo(null)}
            variant="ghost" 
            className="w-full mb-4 rounded-xl font-black h-10 text-[11px] gap-2 hover:bg-white dark:hover:bg-slate-800 text-primary border border-primary/20"
          >
            <ChevronLeft size={14} /> {bn ? "তালিকায় ফিরুন" : "Back to List"}
          </Button>
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">{language === 'bn' ? "কম্বো পেজসমূহ" : "Combo Pages"}</h3>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="outline" 
            className="w-full mt-4 rounded-xl border-slate-200 font-bold h-10 text-[11px] gap-2 hover:bg-white"
          >
            <Plus size={14} /> {language === 'bn' ? "নতুন পেজ" : "Add New Page"}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {combos.map((combo) => (
            <div 
              key={combo.id}
              onClick={() => handleSelectCombo(combo)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                selectedCombo?.id === combo.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white border border-slate-100 hover:border-primary/30"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-xs font-black truncate ${selectedCombo?.id === combo.id ? "text-white" : "text-slate-900"}`}>
                  {combo.name_bn || combo.name}
                </p>
                <p className={`text-[11px] font-bold mt-0.5 ${selectedCombo?.id === combo.id ? "text-white/60" : "text-slate-400"}`}>
                  /{combo.slug}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteCombo(combo.id); }}
                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-xl transition-all ${
                  selectedCombo?.id === combo.id ? "hover:bg-white/20 text-white" : "hover:bg-rose-50 text-rose-400"
                }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-100 space-y-2">
          <Button 
            onClick={() => { setSelectedCombo(null); setShowGlobal(true); }}
            variant={showGlobal ? "default" : "ghost"} 
            className="w-full justify-start h-8 text-[11px] font-black uppercase tracking-widest gap-2"
          >
            <ShieldCheck size={12} /> {language === 'bn' ? "গ্লোবাল সেটিংস" : "Global Settings"}
          </Button>
          <Button onClick={exportJSON} variant="ghost" className="w-full justify-start h-8 text-[11px] font-black uppercase tracking-widest gap-2">
            <Download size={12} /> {language === 'bn' ? "এক্সপোর্ট JSON" : "Export JSON"}
          </Button>
        </div>
      </div>

      {/* MAIN SETTINGS AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {!selectedCombo ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 bg-slate-50/30 p-10">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-xl border border-slate-100">
              <Layout size={48} className="text-slate-200" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">{language === 'bn' ? "কোনো কম্বো সিলেক্ট করা নেই" : "No Combo Selected"}</h3>
              <p className="text-slate-400 font-bold max-w-xs">{language === 'bn' ? "বামদিকের তালিকা থেকে একটি কম্বো সিলেক্ট করুন অথবা নতুন একটি তৈরি করুন।" : "Select a combo from the sidebar or launch a new bundle offer."}</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-primary text-white px-10 h-14 font-black gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus size={20} strokeWidth={3} /> {language === 'bn' ? "নতুন কম্বো তৈরি করুন" : "Launch New Combo"}
            </Button>
          </div>
        ) : !config ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "কনফিগারেশন লোড হচ্ছে..." : "Loading Configuration..."}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <Layout size={20} />
                </div>
                <div>
                  <input 
                    value={selectedCombo.name_bn || ""} 
                    onChange={(e) => setSelectedCombo({...selectedCombo, name_bn: e.target.value})}
                    className="font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 text-lg" 
                  />
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Slug:</span>
                    <input 
                      value={selectedCombo.slug || ""} 
                      onChange={(e) => setSelectedCombo({...selectedCombo, slug: e.target.value})}
                      className="text-[11px] font-black text-primary bg-transparent border-none outline-none focus:ring-0 p-0 w-32" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bn ? "স্ট্যাটাস:" : "Status:"}</span>
                  <button 
                    onClick={() => setSelectedCombo({...selectedCombo, status: selectedCombo.status === 'active' ? 'draft' : 'active'})}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                      selectedCombo.status === 'active' 
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-200 text-slate-600 border-slate-300"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedCombo.status === 'active' ? "bg-white" : "bg-slate-400"}`} />
                    {selectedCombo.status === 'active' ? (bn ? "সক্রিয়" : "Active") : (bn ? "ড্রাফট" : "Draft")}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`rounded-xl h-12 px-6 font-black gap-2 transition-all ${showPreview ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
                  >
                    {showPreview ? <X size={18} /> : <Eye size={18} />}
                    {showPreview ? (language === 'bn' ? "লুকান" : "Hide") : (language === 'bn' ? "প্রিভিউ" : "Preview")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`/combo/${selectedCombo.slug || selectedCombo.id}`, '_blank')}
                    className="rounded-xl border-slate-200 text-slate-600 px-6 h-12 font-black gap-2 hover:bg-slate-50"
                  >
                    <ArrowRight size={18} /> {language === 'bn' ? "ভিজিট" : "Visit"}
                  </Button>
                  <Button 
                    onClick={saveAll} 
                    disabled={loading}
                    className="rounded-xl bg-primary hover:bg-primary-hover text-white px-8 h-12 font-black gap-2 shadow-xl shadow-primary/20"
                  >
                    <Save size={18} /> {loading ? (language === 'bn' ? "সংরক্ষণ..." : "Saving...") : (language === 'bn' ? "সেভ" : "Save")}
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-white custom-scrollbar">
              {/* PERFORMANCE STATS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                {[
                  { label: bn ? "মোট বিক্রি" : "Units Sold", value: `${selectedCombo.sales || 0} Units`, icon: TrendingUp, color: "text-primary", bg: "bg-emerald-50" },
                  { label: bn ? "মোট রেভিনিউ" : "Estimated Revenue", value: `৳${((selectedCombo.sales || 0) * (selectedCombo.price || 0)).toLocaleString()}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
                  { label: bn ? "কনভার্সন রেট" : "Avg. Conversion", value: "4.2%", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 ${stat.bg} rounded-xl border border-white/10 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all`}>
                    <div className={`w-14 h-14 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Accordion type="single" collapsible className="space-y-6" defaultValue="countdown">
                {/* 1. COUNTDOWN TIMER */}
                <AccordionItem value="countdown" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "কাউন্টডাউন টাইমার" : "Countdown Timer"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "অফার আরজেন্সি সেটিংস" : "Offer Urgency Settings"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-900">{language === 'bn' ? "টাইমার দেখান" : "Show Timer"}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "কাউন্টডাউন দৃশ্যমানতা পরিবর্তন করুন" : "Toggle countdown visibility"}</p>
                      </div>
                      <button 
                        onClick={() => setConfig({...config, countdown_enabled: !config.countdown_enabled})}
                        className={`w-14 h-7 rounded-xl transition-all relative ${config.countdown_enabled ? "bg-primary" : "bg-slate-200"}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-xl transition-all shadow-sm ${config.countdown_enabled ? "left-8" : "left-1"}`} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                        <div key={unit} className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{unit}</label>
                          <input 
                            type="number" 
                            value={config.countdown_timer?.[unit] || 0}
                            onChange={(e) => setConfig({...config, countdown_timer: {...config.countdown_timer, [unit]: Number(e.target.value)}})}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-lg font-black outline-none focus:ring-4 focus:ring-primary/5" 
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2. MEDIA SECTION */}
                <AccordionItem value="media" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <ImageIcon size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "মিডিয়া সেকশন" : "Media & Images"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "প্রধান ছবি এবং ভিডিও" : "Main Images and Video"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "কম্বো প্রধান ছবি" : "Combo Main Image"}</label>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-slate-100 group shadow-sm">
                          {selectedCombo.images?.[0] ? (
                            <img src={selectedCombo.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                              <Camera size={32} />
                              <span className="text-[11px] font-black uppercase tracking-widest">No Image</span>
                            </div>
                          )}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => {
                              const newImgs = [...(selectedCombo.images || [])];
                              newImgs[0] = url;
                              setSelectedCombo({...selectedCombo, images: newImgs});
                            })} />
                            <div className="bg-white px-4 py-2 rounded-xl text-xs font-black gap-2 flex items-center">
                              <Upload size={14} /> Upload New
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "ভিডিও ইউআরএল (ঐচ্ছিক)" : "Video URL (Optional)"}</label>
                        <div className="p-6 bg-white rounded-xl border border-slate-100 space-y-4 h-full flex flex-col justify-center">
                          <div className="flex bg-slate-50 p-1 rounded-xl">
                            {['url', 'upload'].map((type) => (
                              <button 
                                key={type}
                                onClick={() => setConfig({...config, media_type: type})}
                                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                  config.media_type === type ? "bg-white text-primary shadow-sm" : "text-slate-400"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                          <input 
                            value={config.video_url || ""} 
                            onChange={(e) => setConfig({...config, video_url: e.target.value})}
                            placeholder={config.media_type === 'url' ? "YouTube Embed URL..." : "Video URL..."}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold" 
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. BADGE & PRICING */}
                <AccordionItem value="pricing" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BadgeCheck size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "ব্যাজ এবং প্রাইসিং" : "Badge & Pricing"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "প্রধান অফার বিস্তারিত" : "Main Offer Details"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "অফার ব্যাজ টেক্সট" : "Offer Badge Text"}</label>
                      <input 
                        value={selectedCombo.badge || "১০০% অরিজিনাল প্রিমিয়াম প্রোডাক্ট"} 
                        onChange={(e) => setSelectedCombo({...selectedCombo, badge: e.target.value})}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "বর্তমান অফার মূল্য" : "Current Offer Price"}</label>
                        <input 
                          type="number"
                          value={selectedCombo.price || 0} 
                          onChange={(e) => setSelectedCombo({...selectedCombo, price: Number(e.target.value)})}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-lg font-black text-primary outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "পুরাতন মূল্য" : "Old Price"}</label>
                        <input 
                          type="number"
                          value={selectedCombo.old_price || 0} 
                          onChange={(e) => setSelectedCombo({...selectedCombo, old_price: Number(e.target.value)})}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-lg font-black text-slate-400 line-through outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "ডিসকাউন্ট" : "Discount"}</label>
                        <div className="w-full px-6 py-4 bg-rose-50 text-rose-600 rounded-xl text-lg font-black flex items-center justify-center">
                          {Math.round(((selectedCombo.old_price - selectedCombo.price) / (selectedCombo.old_price || 1)) * 100)}% OFF
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. HERO CONTENT */}
                <AccordionItem value="hero" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Type size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "হিরো কন্টেন্ট" : "Hero Content"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "টাইটেল এবং ডেসক্রিপশন" : "Titles and Descriptions"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "কম্বো টাইটেল" : "Combo Title"}</label>
                        <input 
                          value={config.hero_title || ""} 
                          onChange={(e) => setConfig({...config, hero_title: e.target.value})}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "কম্বো ডেসক্রিপশন" : "Combo Description"}</label>
                        <textarea 
                          value={config.hero_desc || ""} 
                          onChange={(e) => setConfig({...config, hero_desc: e.target.value})}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none min-h-[100px]" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "হিরো বাটন টেক্সট" : "Hero Button Text"}</label>
                          <input 
                            value={config.hero_button_text || ""} 
                            onChange={(e) => setConfig({...config, hero_button_text: e.target.value})}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black outline-none" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "স্টক পরিমাণ" : "Stock Amount"}</label>
                          <input 
                            type="number"
                            value={selectedCombo.stock || 0} 
                            onChange={(e) => setSelectedCombo({...selectedCombo, stock: Number(e.target.value)})}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black outline-none" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "ক্যাটাগরি" : "Category"}</label>
                        <div 
                          onClick={() => openSelector("category", (cat) => setSelectedCombo({...selectedCombo, category: cat.name}))}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black flex items-center justify-between cursor-pointer group"
                        >
                          <span className={selectedCombo.category ? "text-slate-900" : "text-slate-300"}>
                            {selectedCombo.category ? (categories.find(c => c.name === selectedCombo.category)?.name_bn || selectedCombo.category) : (bn ? "ক্যাটাগরি নির্বাচন করুন" : "Select Category")}
                          </span>
                          <ChevronDown size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5. PRODUCTS SECTION */}
                <AccordionItem value="products" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingCart size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "পণ্য তালিকা" : "Included Products"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "ডাইনামিক বান্ডেল লিস্ট (সর্বোচ্চ ৪টি)" : "Dynamic Bundle List (Max 4)"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-8">
                    <div className="flex justify-end">
                      <Button 
                        disabled={(config.included_products?.length || 0) >= 4}
                        onClick={() => openSelector("product", (prod) => {
                          setConfig({
                            ...config, 
                            included_products: [
                              ...(config.included_products || []), 
                              { 
                                id: prod.id,
                                name: prod.name_bn || prod.name, 
                                price: prod.price, 
                                image: prod.images?.[0] || "", 
                                description: prod.description || "" 
                              }
                            ]
                          });
                        })}
                        variant="outline" className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2"
                      >
                        <Plus size={14} /> {language === 'bn' ? "পণ্য যোগ করুন" : "Add Product"}
                      </Button>
                    </div>
                    <div className="grid gap-8">
                      {(config.included_products || []).map((prod: any, i: number) => (
                        <div key={i} className="p-8 bg-white rounded-xl border border-slate-100 relative group animate-in slide-in-from-bottom-4">
                          <div className="absolute -top-3 left-8 px-4 py-1 bg-primary text-white text-[11px] font-black rounded-xl uppercase tracking-widest">
                            {language === 'bn' ? "পণ্য" : "Product"} {i + 1}
                          </div>
                          <button 
                            onClick={() => setConfig({...config, included_products: config.included_products.filter((_: any, idx: number) => idx !== i)})}
                            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                          <div className="grid grid-cols-[180px_1fr] gap-8">
                            <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "পণ্যের ছবি" : "Product Image"}</label>
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group/img">
                                {prod.image ? (
                                  <img src={prod.image} className="w-full h-full object-cover" />
                                ) : (
                                  <Camera size={32} className="text-slate-200" />
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => {
                                    const newProds = [...config.included_products];
                                    newProds[i].image = url;
                                    setConfig({...config, included_products: newProds});
                                  })} />
                                  <div className="flex flex-col gap-2">
                                    <div className="bg-white px-4 py-2 rounded-xl text-[11px] font-black gap-2 flex items-center">
                                      <Upload size={12} /> {language === 'bn' ? "আপলোড" : "Upload"}
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        openSelector("product", (newProd) => {
                                          const newProds = [...config.included_products];
                                          newProds[i] = {
                                            ...newProds[i],
                                            id: newProd.id,
                                            name: newProd.name_bn || newProd.name,
                                            price: newProd.price,
                                            image: newProd.images?.[0] || "",
                                            description: newProd.description || ""
                                          };
                                          setConfig({...config, included_products: newProds});
                                        });
                                      }}
                                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[11px] font-black gap-2 flex items-center hover:bg-emerald-700 transition-all shadow-xl"
                                    >
                                      <RefreshCw size={12} /> {bn ? "পরিবর্তন" : "Replace"}
                                    </button>
                                  </div>
                                </label>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "পণ্যের নাম" : "Product Title"}</label>
                                  <input 
                                    value={prod.name} 
                                    onChange={(e) => {
                                      const newProds = [...config.included_products];
                                      newProds[i].name = e.target.value;
                                      setConfig({...config, included_products: newProds});
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "পণ্যের মূল্য" : "Product Price"}</label>
                                  <input 
                                    type="number"
                                    value={prod.price} 
                                    onChange={(e) => {
                                      const newProds = [...config.included_products];
                                      newProds[i].price = Number(e.target.value);
                                      setConfig({...config, included_products: newProds});
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "ডেসক্রিপশন" : "Product Description"}</label>
                                <textarea 
                                  value={prod.description} 
                                  onChange={(e) => {
                                    const newProds = [...config.included_products];
                                    newProds[i].description = e.target.value;
                                    setConfig({...config, included_products: newProds});
                                  }}
                                  placeholder={language === 'bn' ? "বৈশিষ্ট্যসমূহ..." : "Key features..."}
                                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold min-h-[80px]" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 6. TRUST BADGES */}
                <AccordionItem value="trust" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "ট্রাস্ট ব্যাজ" : "Trust Badges"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "কোয়ালিটি অ্যাসিউরেন্স ব্যাজ" : "Quality Assurance Badges"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                    <div className="flex justify-end">
                      <Button 
                        disabled={(config.trust_badges?.length || 0) >= 6}
                        onClick={() => setConfig({...config, trust_badges: [...(config.trust_badges || []), { icon: "ShieldCheck", text: "" }]})}
                        variant="outline" className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2"
                      >
                        <Plus size={14} /> {language === 'bn' ? "ব্যাজ যোগ করুন" : "Add Badge"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {(config.trust_badges || []).map((badge: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 items-center animate-in zoom-in-95">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                            <Sparkles size={18} />
                          </div>
                          <input 
                            value={badge.text} 
                            onChange={(e) => {
                              const newBadges = [...config.trust_badges];
                              newBadges[i].text = e.target.value;
                              setConfig({...config, trust_badges: newBadges});
                            }}
                            placeholder={language === 'bn' ? "ব্যাজ টেক্সট..." : "Badge text..."}
                            className="flex-1 bg-transparent border-none text-xs font-black outline-none" 
                          />
                          <button 
                            onClick={() => setConfig({...config, trust_badges: config.trust_badges.filter((_: any, idx: number) => idx !== i)})}
                            className="text-rose-400 hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 7. CUSTOMER REVIEWS */}
                <AccordionItem value="reviews" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "কাস্টমার রিভিউ" : "Customer Reviews"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "ফিডব্যাক সেকশন সেটিংস" : "Feedback Section Settings"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-8">
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setConfig({...config, reviews: [...(config.reviews || []), { name: "", text: "", rating: 5, avatar: "" }]})}
                        variant="outline" className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2"
                      >
                        <Plus size={14} /> {language === 'bn' ? "রিভিউ যোগ করুন" : "Add Review"}
                      </Button>
                    </div>
                    <div className="grid gap-6">
                      {(config.reviews || []).map((rev: any, i: number) => (
                        <div key={i} className="p-8 bg-white rounded-xl border border-slate-100 space-y-6 relative group animate-in slide-in-from-bottom-4">
                          <button 
                            onClick={() => setConfig({...config, reviews: config.reviews.filter((_: any, idx: number) => idx !== i)})}
                            className="absolute top-6 right-6 text-rose-400 hover:text-rose-500"
                          >
                            <Trash2 size={18} />
                          </button>
                          <div className="flex gap-8">
                            <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "অ্যাভাটার" : "Avatar"}</label>
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group/avatar">
                                {rev.avatar ? (
                                  <img src={rev.avatar} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={24} className="text-slate-200" />
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => {
                                    const newRevs = [...config.reviews];
                                    newRevs[i].avatar = url;
                                    setConfig({...config, reviews: newRevs});
                                  })} />
                                  <Camera size={14} className="text-white" />
                                </label>
                              </div>
                            </div>
                            <div className="flex-1 space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "রিভিউয়ারের নাম" : "Reviewer Name"}</label>
                                  <input 
                                    value={rev.name} 
                                    onChange={(e) => {
                                      const newRevs = [...config.reviews];
                                      newRevs[i].name = e.target.value;
                                      setConfig({...config, reviews: newRevs});
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "রেটিং (১-৫)" : "Star Rating (1-5)"}</label>
                                  <div className="flex items-center gap-1 h-10 px-4 bg-slate-50 rounded-xl">
                                    {[1,2,3,4,5].map((s) => (
                                      <button key={s} onClick={() => {
                                        const newRevs = [...config.reviews];
                                        newRevs[i].rating = s;
                                        setConfig({...config, reviews: newRevs});
                                      }}>
                                        <Star size={14} fill={rev.rating >= s ? "currentColor" : "none"} className={rev.rating >= s ? "text-amber-400" : "text-slate-200"} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'bn' ? "রিভিউ ডেসক্রিপশন" : "Review Description"}</label>
                                <textarea 
                                  value={rev.text} 
                                  onChange={(e) => {
                                    const newRevs = [...config.reviews];
                                    newRevs[i].text = e.target.value;
                                    setConfig({...config, reviews: newRevs});
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold min-h-[80px]" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 8. FAQ SECTION */}
                <AccordionItem value="faq" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HelpCircle size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)" : "FAQ Section"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "সাধারণ প্রশ্নের উত্তর" : "Common Questions & Answers"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setConfig({...config, faq: [...(config.faq || []), { q: "", a: "" }]})}
                        variant="outline" className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2"
                      >
                        <Plus size={14} /> {language === 'bn' ? "প্রশ্ন যোগ করুন" : "Add FAQ"}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {(config.faq || []).map((item: any, i: number) => (
                        <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 space-y-4 animate-in zoom-in-95">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Question {i + 1}</span>
                            <button onClick={() => setConfig({...config, faq: config.faq.filter((_: any, idx: number) => idx !== i)})} className="text-rose-400"><Trash2 size={14} /></button>
                          </div>
                          <input 
                            value={item.q} 
                            onChange={(e) => {
                              const newFaq = [...config.faq];
                              newFaq[i].q = e.target.value;
                              setConfig({...config, faq: newFaq});
                            }}
                            placeholder={language === 'bn' ? "প্রশ্ন..." : "Question..."}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black" 
                          />
                          <textarea 
                            value={item.a} 
                            onChange={(e) => {
                              const newFaq = [...config.faq];
                              newFaq[i].a = e.target.value;
                              setConfig({...config, faq: newFaq});
                            }}
                            placeholder={language === 'bn' ? "উত্তর..." : "Answer..."}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-medium min-h-[60px]" 
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 9. SECTION VISIBILITY */}
                <AccordionItem value="visibility" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <EyeOff size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "সেকশন ভিজিবিলিটি" : "Section Visibility"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "পেজ সেকশন কন্ট্রোল" : "Page Section Controls"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: "show_video", label: bn ? "ভিডিও সেকশন" : "Video Section" },
                        { id: "show_countdown", label: bn ? "কাউন্টডাউন" : "Countdown" },
                        { id: "show_why_us", label: bn ? "কেন আমাদের বেছে নেবেন" : "Why Us Section" },
                        { id: "show_reviews", label: bn ? "রিভিউ সেকশন" : "Reviews Section" },
                        { id: "show_faq", label: bn ? "FAQ সেকশন" : "FAQ Section" },
                        { id: "show_sticky_footer", label: bn ? "স্টিকি ফুটার" : "Sticky Footer" },
                      ].map(toggle => (
                        <div key={toggle.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{toggle.label}</span>
                          <button 
                            onClick={() => setConfig({...config, [toggle.id]: !config[toggle.id]})}
                            className={`w-10 h-5 rounded-xl transition-all relative ${config[toggle.id] !== false ? "bg-primary shadow-md shadow-primary/20" : "bg-slate-200"}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-xl transition-all shadow-sm ${config[toggle.id] !== false ? "left-5.5" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ব্যানার টেক্সট" : "Banner Text"}</h5>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{bn ? "শীর্ষ ব্যানার টেক্সট" : "Top Banner Text"}</label>
                        <input 
                          value={config.top_banner_text || ""} 
                          onChange={(e) => setConfig({...config, top_banner_text: e.target.value})}
                          placeholder={bn ? "রমজান অফার! সকল কম্বোতে ৪০% পর্যন্ত ছাড় চলছে" : "Ramadan Offer! Up to 40% discount on all combos"}
                          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-primary/5" 
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 10. MARKETING & SEO */}
                <AccordionItem value="marketing" className="border-none bg-slate-50 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Target size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900">{language === 'bn' ? "মার্কেটিং এবং SEO" : "Marketing & SEO"}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? "পিক্সেল এবং মেটা ট্যাগ" : "Pixels and Meta Tags"}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-2 space-y-8">
                    {/* Pixels */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "ট্র্যাকিং পিক্সেল" : "Tracking Pixels"}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Facebook size={12} className="text-[#1877F2]" /> Facebook Pixel ID
                          </label>
                          <input 
                            value={config.fb_pixel_id || ""} 
                            onChange={(e) => setConfig({...config, fb_pixel_id: e.target.value})}
                            placeholder="e.g. 123456789..."
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-primary/5" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Globe size={12} className="text-slate-400" /> TikTok Pixel ID
                          </label>
                          <input 
                            value={config.tiktok_pixel_id || ""} 
                            onChange={(e) => setConfig({...config, tiktok_pixel_id: e.target.value})}
                            placeholder="e.g. C123456789..."
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-primary/5" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO Metadata */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{bn ? "সার্চ ইঞ্জিন অপ্টিমাইজেশন" : "Search Engine Optimization"}</h5>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{bn ? "SEO টাইটেল" : "SEO Title Tag"}</label>
                          <input 
                            value={config.seo_title || ""} 
                            onChange={(e) => setConfig({...config, seo_title: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black outline-none" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{bn ? "SEO মেটা ডেসক্রিপশন" : "SEO Meta Description"}</label>
                          <textarea 
                            value={config.seo_description || ""} 
                            onChange={(e) => setConfig({...config, seo_description: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold min-h-[80px] outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE PREVIEW PANEL */}
      {showPreview && selectedCombo && config && (
        <div className="w-[380px] bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden lg:relative absolute right-0 top-0 h-full z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-right-10">
          <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                <Eye size={16} />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{language === 'bn' ? "লাইভ প্রিভিউ" : "Live Preview"}</h4>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-xl transition-all ${previewMode === 'desktop' ? "bg-white/10 text-white" : "text-slate-500"}`}
              >
                <Monitor size={14} />
              </button>
              <button 
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-xl transition-all ${previewMode === 'mobile' ? "bg-white/10 text-white" : "text-slate-500"}`}
              >
                <Smartphone size={14} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-800 p-2 flex items-start justify-center custom-scrollbar">
            <div 
              className={`bg-[#FDFCF9] shadow-2xl transition-all duration-500 overflow-hidden origin-top mt-10 ${
                previewMode === 'desktop' ? "w-[900px] scale-[0.4] -translate-x-2" : "w-[320px] scale-[0.9] rounded-xl"
              }`}
            >
               {/* MINI PREVIEW RENDERER */}
               <div className="p-8 text-center text-slate-400 font-bold">Preview Content</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-xl bg-primary animate-pulse" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{language === 'bn' ? "অটো-আপডেটিং প্রিভিউ" : "Auto-updating Preview"}</span>
          </div>
        </div>
      )}
      </div>
      )}

      <NewComboModal 
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          onCloseCreateModalExternal?.();
        }}
        onSuccess={(newCombo) => {
          setCombos([newCombo, ...combos]);
          handleSelectCombo(newCombo);
          setShowCreateModal(false);
          onCloseCreateModalExternal?.();
        }}
      />

      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {selectorType === 'product' ? <ShoppingCart size={20} /> : <Layers size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {selectorType === 'product' ? (bn ? "পণ্য নির্বাচন করুন" : "Select Product") : (bn ? "ক্যাটাগরি নির্বাচন করুন" : "Select Category")}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {selectorType === 'product' ? (bn ? "ডাটাবেস থেকে পণ্য বেছে নিন" : "Pick a product from database") : (bn ? "ডাটাবেস থেকে ক্যাটাগরি বেছে নিন" : "Pick a category from database")}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsSelectorOpen(false)} className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    placeholder={bn ? "সার্চ করুন..." : "Search..."}
                    className="w-full h-12 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {(selectorType === 'product' ? allProducts : categories)
                  .filter(item => (item.name_bn || item.name || "").toLowerCase().includes(selectorSearch.toLowerCase()))
                  .map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl flex items-center gap-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                        <img src={item.image || item.images?.[0] || "/placeholder.svg"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{item.name_bn || item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {selectorType === 'product' ? `SKU: ${item.sku || 'N/A'}` : `Slug: ${item.slug || 'N/A'}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary">
                          {selectorType === 'product' ? `৳${item.price?.toLocaleString()}` : ''}
                        </p>
                        {selectorType === 'product' && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {item.stock > 0 ? (bn ? "স্টক আছে" : "In Stock") : (bn ? "স্টক নেই" : "Out of Stock")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                
                {(selectorType === 'product' ? allProducts : categories).filter(item => (item.name_bn || item.name || "").toLowerCase().includes(selectorSearch.toLowerCase())).length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold uppercase tracking-widest">{bn ? "কিছু পাওয়া যায়নি" : "No results found"}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
