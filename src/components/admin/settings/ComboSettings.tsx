import { 
  Plus, Trash2, Save, ChevronRight, Layout, Clock, Image as ImageIcon, 
  Video, BadgeCheck, Type, ShoppingCart, Star, HelpCircle, Download, Upload, 
  Eye, Monitor, Smartphone, ChevronDown, MoveVertical, X, Check, DollarSign,
  Camera, Play, ShieldCheck, User, Sparkles, ArrowRight, Search, RefreshCw, Layers, Pencil, MoreVertical, ChevronLeft, Loader2,
  Globe, Target, EyeOff, Facebook, TrendingUp, AlertTriangle, CheckCircle2, ExternalLink,
  Info, LayoutPanelTop, Settings2, GripVertical, Languages, FileText, CreditCard, Package, Tag
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

const EMPTY_ARRAY: any[] = [];

export function ComboSettings({ settings, onUpdate, initialCombos = EMPTY_ARRAY, categories: initialCategories = EMPTY_ARRAY, showCreateModalExternal, onCloseCreateModalExternal }: ComboSettingsProps) {
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
  const [activeTab, setActiveTab] = useState<"general" | "products" | "layout" | "pricing" | "advanced">("general");
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

  const handleUpdateCombo = async (combo: any) => {
    if (!combo) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: combo.name,
          name_bn: combo.name_bn,
          price: combo.price,
          old_price: combo.old_price,
          stock_quantity: combo.stock_quantity,
          badge: combo.badge,
          slug: combo.slug,
          description: combo.description,
          landing_page_config: combo.landing_page_config,
          status: combo.status,
          sku: combo.sku
        })
        .eq('id', combo.id);

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
        <div className="bg-white dark:bg-[#0c0c0c] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 dark:border-emerald-500/10">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "গ্লোবাল কম্বো সেটিংস" : "Global Combo Configuration"}</h2>
                <p className="text-xs text-slate-500 font-medium">{bn ? "সব কম্বো পেজের জন্য সাধারণ সেটিংস পরিবর্তন করুন" : "Manage universal settings applied across all landing pages"}</p>
              </div>
            </div>
            <Button onClick={() => setShowGlobal(false)} variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 font-black h-12 px-6 gap-2 hover:bg-white transition-all shadow-sm">
              <ArrowRight className="rotate-180" size={18} /> {bn ? "তালিকায় ফিরুন" : "Return to List"}
            </Button>
          </div>
          
          <div className="p-10 space-y-12">
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                  <ChevronRight size={14} className="text-emerald-500" /> {bn ? "চেকআউট বাটন টেক্সট" : "Checkout CTA Text"}
                </label>
                <input 
                  value={settings.checkout_button_text || ""}
                  onChange={(e) => onUpdate({ ...settings, checkout_button_text: e.target.value })}
                  placeholder={bn ? "অর্ডার করুন..." : "Place Order Now..."}
                  className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                  <ChevronRight size={14} className="text-emerald-500" /> {bn ? "গ্লোবাল কাস্টম মেসেজ" : "Global Marketing Tagline"}
                </label>
                <input 
                  value={settings.custom_message || ""}
                  onChange={(e) => onUpdate({ ...settings, custom_message: e.target.value })}
                  placeholder={bn ? "ফ্রি ডেলিভারি সারা বাংলাদেশে!" : "Free Shipping Nationwide!"}
                  className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { id: "show_trust_badges", label: bn ? "ট্রাস্ট ব্যাজ" : "Trust Badges", icon: ShieldCheck },
                { id: "show_reviews", label: bn ? "কাস্টমার রিভিউ" : "Customer Reviews", icon: Star },
                { id: "show_lifestyle_gallery", label: bn ? "লাইফস্টাইল গ্যালারি" : "Lifestyle Gallery", icon: ImageIcon },
              ].map(toggle => (
                <div key={toggle.id} className="flex items-center justify-between p-6 bg-white dark:bg-[#080808] rounded-xl border border-slate-200 dark:border-white/5 group hover:border-emerald-500/30 transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-inner">
                      <toggle.icon size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{toggle.label}</span>
                  </div>
                  <button 
                    onClick={() => onUpdate({ ...settings, [toggle.id]: !settings[toggle.id] })}
                    className={`w-14 h-7 rounded-xl transition-all relative ${settings[toggle.id] ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-xl transition-all shadow-sm ${settings[toggle.id] ? "left-8" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !selectedCombo ? (
        <div className="space-y-8 pb-10">
          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 p-6 rounded-xl shadow-lg flex flex-col lg:flex-row items-center gap-8">
            <div className="relative flex-1 w-full group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                <Search size={22} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                placeholder={bn ? "প্রোডাক্ট নাম বা SKU সার্চ করুন..." : "Search combos by name or SKU..."}
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[15px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
              />
            </div>
            
            <div className="flex items-center bg-slate-100/50 dark:bg-white/5 p-2 rounded-xl border border-slate-200 dark:border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth">
              {["all", ...categories.map(c => c.name)].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-10 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all shrink-0 ${categoryFilter === cat ? "bg-white dark:bg-[#151515] text-emerald-600 shadow-xl shadow-black/5 scale-[1.02] border border-slate-100 dark:border-white/10" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  {cat === 'all' ? (bn ? "সব কম্বো" : "All Offers") : (categories.find(c => c.name === cat)?.name_bn || cat.replace('-', ' '))}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "কম্বো তথ্য" : "Combo Identity"}</th>
                    <th className="px-10 py-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "আইডেন্টিফায়ার" : "Identifier"}</th>
                    <th className="px-10 py-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "ইনভেন্টরি" : "Components"}</th>
                    <th className="px-10 py-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "মূল্য" : "Investment"}</th>
                    <th className="px-10 py-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "স্ট্যাটাস" : "Visibility"}</th>
                    <th className="px-10 py-8 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{bn ? "অ্যাকশন" : "Actions"}</th>
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
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => handleSelectCombo(combo)}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all group cursor-pointer active:scale-[0.995]"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-xl bg-white dark:bg-white/5 p-1 shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-md border border-slate-100 dark:border-white/5">
                                <img src={combo.images?.[0] || "/placeholder.svg"} className="w-full h-full object-cover rounded-xl" alt={combo.name} />
                              </div>
                              <div className="min-w-0 space-y-1">
                                <p className="text-[15px] font-black text-slate-900 dark:text-white truncate tracking-tight">{combo.name_bn || combo.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10">{categoryName}</span>
                                  {combo.badge && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-100">{combo.badge}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <span className="text-[12px] font-black text-slate-600 dark:text-slate-400 font-mono tracking-tighter bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/10">{combo.sku || "N/A"}</span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[14px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {combo.landing_page_config?.included_products?.length || 0} {bn ? "টি পণ্য" : "Bundle Items"}
                              </span>
                              <div className="flex -space-x-2.5">
                                 {(combo.landing_page_config?.included_products || []).slice(0, 3).map((p: any, i: number) => (
                                   <div key={i} className="w-6 h-6 rounded-xl border-2 border-white dark:border-[#0c0c0c] bg-slate-100 overflow-hidden shadow-sm">
                                     <img src={p.image} className="w-full h-full object-cover" />
                                   </div>
                                 ))}
                                 {(combo.landing_page_config?.included_products?.length || 0) > 3 && (
                                   <div className="w-6 h-6 rounded-xl border-2 border-white dark:border-[#0c0c0c] bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                     +{(combo.landing_page_config?.included_products?.length || 0) - 3}
                                   </div>
                                 )}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">৳{combo.price?.toLocaleString()}</span>
                              {combo.old_price && (
                                <span className="text-[11px] font-bold text-slate-400 line-through opacity-50 tracking-tighter">৳{combo.old_price?.toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                               <div className="flex flex-col items-center gap-2">
                                  <Switch 
                                    checked={combo.status === 'active'}
                                    onCheckedChange={() => handleStatusToggle(combo)}
                                    className="data-[state=checked]:bg-emerald-500"
                                  />
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${combo.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {combo.status === 'active' ? (bn ? "সক্রিয়" : "Active") : (bn ? "নিষ্ক্রিয়" : "Disabled")}
                                  </span>
                               </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-100 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); window.open(`/combo/${combo.slug || combo.id}`, '_blank'); }}
                                  className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-sm"
                                  title={bn ? "ভিউ" : "View"}
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectCombo(combo); }}
                                  className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-all border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shadow-sm"
                                  title={bn ? "এডিট" : "Edit"}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCombo(combo.id); }}
                                  className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shadow-sm"
                                  title={bn ? "ডিলিট" : "Delete"}
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
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[900px] bg-white dark:bg-[#0c0c0c] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative">
          <div className="w-[320px] border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col shrink-0">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <button 
                onClick={() => setSelectedCombo(null)}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white transition-all shadow-sm"
              >
                <ArrowRight className="rotate-180" size={18} />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-xl bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{bn ? "এডিটিং মুড" : "Active Editor"}</span>
              </div>
            </div>
            
            <div className="p-8 space-y-2 flex-1 overflow-y-auto no-scrollbar">
              {[
                { id: "general", label: bn ? "সাধারণ তথ্য" : "Identity & Meta", icon: Info },
                { id: "products", label: bn ? "পণ্য নির্বাচন" : "Product Matrix", icon: Package },
                { id: "layout", label: bn ? "ডিজাইন ও লেআউট" : "Visual Architect", icon: LayoutPanelTop },
                { id: "pricing", label: bn ? "মূল্য ও অফার" : "Pricing Strategy", icon: Tag },
                { id: "advanced", label: bn ? "অ্যাডভান্সড" : "Advanced Core", icon: Settings2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full group relative flex items-center gap-4 px-6 h-14 rounded-xl transition-all duration-300 ${activeTab === tab.id ? "bg-white dark:bg-[#151515] text-emerald-600 shadow-xl shadow-black/5 border border-slate-100 dark:border-white/10" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="active-tab-glow" className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-xl" />
                  )}
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? "text-emerald-600" : "group-hover:scale-110 transition-transform"} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-white/5 space-y-4 bg-slate-50/50 dark:bg-white/[0.01]">
               <button 
                 onClick={() => handleUpdateCombo(selectedCombo)}
                 disabled={loading}
                 className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
               >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                 {bn ? "সংরক্ষণ করুন" : "Save Changes"}
               </button>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setShowPreview(!showPreview)}
                   className={`flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${showPreview ? "bg-slate-900 text-white" : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500"}`}
                 >
                   {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                   {bn ? "প্রিভিউ" : "Preview"}
                 </button>
                 <button 
                   onClick={() => window.open(`/combo/${selectedCombo.slug}`, '_blank')}
                   className="h-12 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 rounded-xl hover:text-emerald-600 transition-all"
                 >
                   <ExternalLink size={16} />
                 </button>
               </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-black/20 min-w-0">
            <header className="h-24 px-10 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-white/[0.01] backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
                  <Package size={22} />
                </div>
                <div>
                   <div className="flex items-center gap-3">
                     <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedCombo.name_bn || selectedCombo.name}</h3>
                     <span className={`px-2 py-0.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${selectedCombo.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {selectedCombo.status}
                     </span>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">/{selectedCombo.slug || "no-slug"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{bn ? "লাইভ স্ট্যাটাস" : "Visibility"}</span>
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{selectedCombo.status === 'active' ? (bn ? "সক্রিয়" : "Live") : (bn ? "ড্রাফট" : "Draft")}</span>
                   </div>
                   <Switch 
                     checked={selectedCombo.status === 'active'}
                     onCheckedChange={(checked) => setSelectedCombo({...selectedCombo, status: checked ? 'active' : 'draft'})}
                     className="data-[state=checked]:bg-emerald-500"
                   />
                 </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12 pb-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { label: bn ? "মোট বিক্রি" : "Total Conversions", value: selectedCombo.sales || 0, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/5" },
                     { label: bn ? "পণ্য স্টক" : "Available Inventory", value: selectedCombo.stock_quantity || 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-500/5" },
                     { label: bn ? "অফার ভ্যালু" : "Market Value", value: `৳${selectedCombo.price?.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-500/5" },
                   ].map((stat, i) => (
                     <div key={i} className={`p-6 ${stat.bg} rounded-xl border border-white/5 flex items-center gap-5 group hover:scale-[1.02] transition-all`}>
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                          <stat.icon className={stat.color} size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-12"
                  >
                    {activeTab === "general" && (
                      <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-8">
                           <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "অফারের শিরোনাম (ইংরেজি)" : "Marketing Identity (EN)"}</label>
                             <div className="relative group">
                               <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                               <input 
                                 value={selectedCombo.name || ""}
                                 onChange={(e) => setSelectedCombo({ ...selectedCombo, name: e.target.value })}
                                 className="w-full h-16 pl-14 pr-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                               />
                             </div>
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "অফারের শিরোনাম (বাংলা)" : "Marketing Identity (BN)"}</label>
                             <div className="relative group">
                               <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                               <input 
                                 value={selectedCombo.name_bn || ""}
                                 onChange={(e) => setSelectedCombo({ ...selectedCombo, name_bn: e.target.value })}
                                 className="w-full h-16 pl-14 pr-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                               />
                             </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "ল্যান্ডিং পেজ লেআউট" : "Landing Page Layout"}</label>
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/10 w-fit">
                             {['standard', 'premium', 'cinematic'].map(l => (
                               <button 
                                 key={l}
                                 onClick={() => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, layout: l } })}
                                 className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCombo.landing_page_config?.layout === l ? "bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                               >
                                 {l}
                               </button>
                             ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Accordion type="multiple" className="space-y-6" defaultValue={["pricing", "hero", "products"]}>
                      {activeTab === "pricing" && (
                        <AccordionItem value="pricing" className="border-none bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden shadow-sm">
                          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Tag size={20} />
                              </div>
                              <div className="text-left">
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "মূল্য ও অফার" : "Pricing Strategy"}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "মূল্য এবং ডিসকাউন্ট পরিবর্তন করুন" : "Adjust pricing and discount levels"}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                            <div className="grid grid-cols-1 gap-8">
                               <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "অফার প্রাইস" : "Offer Price"}</label>
                                 <input 
                                   type="number"
                                   value={selectedCombo.price || 0}
                                   onChange={(e) => setSelectedCombo({ ...selectedCombo, price: Number(e.target.value) })}
                                   className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                 />
                               </div>
                               <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "পুরাতন প্রাইস" : "Regular Price"}</label>
                                 <input 
                                   type="number"
                                   value={selectedCombo.old_price || 0}
                                   onChange={(e) => setSelectedCombo({ ...selectedCombo, old_price: Number(e.target.value) })}
                                   className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                 />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "ব্যাজ টেক্সট" : "Badge Text"}</label>
                               <input 
                                 value={selectedCombo.badge || ""}
                                 onChange={(e) => setSelectedCombo({ ...selectedCombo, badge: e.target.value })}
                                 placeholder={bn ? "যেমন: বেস্ট সেলার" : "e.g. Best Seller"}
                                 className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                               />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {activeTab === "products" && (
                        <AccordionItem value="products" className="border-none bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden shadow-sm">
                          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package size={20} />
                              </div>
                              <div className="text-left">
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "পণ্যসমূহ" : "Bundle Components"}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "কম্বোতে থাকা পণ্যগুলো ম্যানেজ করুন" : "Manage products included in this bundle"}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{bn ? "যুক্ত করা পণ্য" : "Included Products"}</h5>
                                 <Button 
                                   onClick={() => { setSelectorType('product'); setIsSelectorOpen(true); }}
                                   variant="outline" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50"
                                 >
                                   <Plus size={14} /> {bn ? "পণ্য যোগ করুন" : "Add Product"}
                                 </Button>
                               </div>
                               <div className="grid grid-cols-1 gap-3">
                                 {(selectedCombo.landing_page_config?.included_products || []).map((p: any, i: number) => (
                                   <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                     <div className="flex items-center gap-4">
                                       <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                                       <div>
                                         <p className="text-xs font-black text-slate-900 dark:text-white">{p.name}</p>
                                         <p className="text-[9px] font-bold text-slate-400">SKU: {p.sku}</p>
                                       </div>
                                     </div>
                                     <button 
                                       onClick={() => {
                                         const newProds = [...(selectedCombo.landing_page_config?.included_products || [])];
                                         newProds.splice(i, 1);
                                         setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, included_products: newProds } });
                                       }}
                                       className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                                     >
                                       <Trash2 size={16} />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {activeTab === "layout" && (
                        <>
                          <AccordionItem value="hero" className="border-none bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden shadow-sm mb-6">
                            <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Monitor size={20} />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "হিরো সেকশন" : "Hero Architecture"}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "প্রধান ব্যানার এবং হেডলাইন" : "Banner and primary headline config"}</p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "হিরো টাইটেল" : "Hero Main Title"}</label>
                                <input 
                                  value={selectedCombo.landing_page_config?.hero_title || ""}
                                  onChange={(e) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, hero_title: e.target.value } })}
                                  className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                />
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{bn ? "হিরো সাবটাইটেল" : "Hero Supporting Text"}</label>
                                <textarea 
                                  value={selectedCombo.landing_page_config?.hero_subtitle || ""}
                                  onChange={(e) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, hero_subtitle: e.target.value } })}
                                  className="w-full h-32 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none resize-none"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="trust" className="border-none bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden shadow-sm">
                            <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <ShieldCheck size={20} />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "ট্রাস্ট ও অথরিটি" : "Trust & Authority"}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "রিভিউ এবং গ্যারান্টি সেটিংস" : "Review and guarantee configuration"}</p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                              <div className="flex items-center justify-between p-6 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                <div>
                                  <p className="text-xs font-black text-slate-900 dark:text-white">{bn ? "রিভিউ সেকশন দেখান" : "Show Reviews Section"}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "কাস্টমার ফিডব্যাক গ্রিড সক্রিয় করুন" : "Enable customer feedback grid"}</p>
                                </div>
                                <Switch 
                                  checked={selectedCombo.landing_page_config?.show_reviews ?? true}
                                  onCheckedChange={(checked) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, show_reviews: checked } })}
                                />
                              </div>
                              <div className="flex items-center justify-between p-6 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                <div>
                                  <p className="text-xs font-black text-slate-900 dark:text-white">{bn ? "ট্রাস্ট ব্যাজ দেখান" : "Show Trust Badges"}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "নিরাপদ শপিং আইকনগুলো দেখান" : "Display secure shopping icons"}</p>
                                </div>
                                <Switch 
                                  checked={selectedCombo.landing_page_config?.show_trust_badges ?? true}
                                  onCheckedChange={(checked) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, show_trust_badges: checked } })}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </>
                      )}

                      {activeTab === "advanced" && (
                        <AccordionItem value="advanced" className="border-none bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden shadow-sm">
                          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Settings2 size={20} />
                              </div>
                              <div className="text-left">
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{bn ? "অ্যাডভান্সড সেটিংস" : "Advanced Core"}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bn ? "SEO এবং মেটা সেটিংস" : "SEO and meta data config"}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-8 pt-2 space-y-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">SEO Title Tag</label>
                              <input 
                                value={selectedCombo.landing_page_config?.seo_title || ""}
                                onChange={(e) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, seo_title: e.target.value } })}
                                className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">SEO Description</label>
                              <textarea 
                                value={selectedCombo.landing_page_config?.seo_description || ""}
                                onChange={(e) => setSelectedCombo({ ...selectedCombo, landing_page_config: { ...selectedCombo.landing_page_config, seo_description: e.target.value } })}
                                className="w-full h-32 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none resize-none"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && selectedCombo && config && (
        <div className="w-[380px] bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden lg:relative absolute right-0 top-0 h-full z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-right-10">
          <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Eye size={16} />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{bn ? "লাইভ প্রিভিউ" : "Live Preview"}</h4>
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
               <div className="p-8 text-center text-slate-400 font-bold">Preview Content</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-xl bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{bn ? "অটো-আপডেটিং প্রিভিউ" : "Auto-updating Preview"}</span>
          </div>
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    placeholder={bn ? "সার্চ করুন..." : "Search..."}
                    className="w-full h-12 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                      className="p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
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
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-xl ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
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
