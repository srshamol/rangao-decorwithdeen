"use client";

import { useState, useEffect, useMemo } from "react";
import { ComboSettings } from "@/components/admin/settings/ComboSettings";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, TrendingUp, AlertTriangle, Layers, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

/**
 * AdminComboPage
 * 
 * This page serves as the dedicated portal for managing Combo Offers.
 * It integrates the high-fidelity ComboSettings component which provides
 * tools for configuring marketing bundles, landing page layouts, and 
 * conversion-optimized designs.
 */
export default function AdminComboPage() {
  const { language, t } = useLanguage();
  const bn = language === 'bn';
  const [loading, setLoading] = useState(true);
  const [combos, setCombos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    revenue: 0
  });

  // Fetch initial data for the combo management portal
  const fetchData = async () => {
    try {
      // 1. Fetch products marked as combos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_combo", true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // 2. Fetch orders to calculate revenue from combos
      // We fetch recently confirmed/delivered orders to avoid massive data load while keeping stats relevant
      const { data: ordersData } = await supabase
        .from("orders")
        .select("items, total, status")
        .not("status", "eq", "cancelled");

      // 3. Fetch global homepage configuration (contains combo-related global settings)
      const { data: configData, error: configError } = await supabase
        .from("store_configs")
        .select("*")
        .eq("id", "homepage_config")
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      // 4. Fetch categories for filtering
      const { data: catsData } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      // Calculate stats
      const comboIds = new Set(productsData?.map((p: any) => p.id) || []);
      const salesMap: Record<string, number> = {};
      let comboRevenue = 0;
      
      ordersData?.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          if (comboIds.has(item.id)) {
            const qty = Number(item.quantity) || 1;
            comboRevenue += (Number(item.price) || 0) * qty;
            salesMap[item.id] = (salesMap[item.id] || 0) + qty;
          }
        });
      });

      // Augment combos with sales data
      const augmentedCombos = (productsData || []).map((p: any) => ({
        ...p,
        sales: salesMap[p.id] || 0
      }));

      setCombos(augmentedCombos);
      setCategories(catsData || []);
      setSettings(configData?.value || {});
      setStats({
        total: productsData?.length || 0,
        active: productsData?.filter((p: any) => p.status === 'active').length || 0,
        outOfStock: productsData?.filter((p: any) => Number(p.stock || 0) <= 0).length || 0,
        revenue: comboRevenue
      });
    } catch (error: any) {
      console.error("Error fetching combo data:", error);
      toast.error("Failed to load combo data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Update document title for the admin portal
    document.title = "Combo Offers | Admin Portal";
  }, []);

  /**
   * handleUpdate
   * 
   * Synchronizes global combo settings with the store_configs table.
   * Individual combo settings are handled internally by the ComboSettings component.
   */
  const handleUpdate = async (newSettings: any) => {
    try {
      const { error } = await supabase
        .from("store_configs")
        .upsert({ 
          id: "homepage_config", 
          value: newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSettings(newSettings);
      toast.success("Global settings updated");
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10 opacity-40" />
          <Package className="w-8 h-8 text-primary absolute inset-0 m-auto animate-bounce relative z-20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] animate-pulse">Initializing Portal</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading your marketing bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Portal Header (Emerald Banner Style) */}
      <div className="bg-[#064e3b] dark:bg-emerald-950 rounded-xl p-8 md:p-10 shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
        {/* Abstract background pattern/gradient */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-800/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-emerald-100 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Package size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">{t("combo_management")}</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-emerald-100/70 text-sm font-bold tracking-wide uppercase">
                  {t("total_bundles_listed").replace("{count}", combos.length.toString())}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="h-16 px-10 bg-white text-[#064e3b] rounded-xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-xl group/btn"
          >
            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-[#064e3b] group-hover/btn:rotate-90 transition-transform duration-500">
              <Plus size={18} strokeWidth={3} />
            </div>
            {t("new_combo")}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: t("total_inventory") || (bn ? "মোট কম্বো অফার" : "Total Inventory"), 
            value: stats.total, 
            icon: Layers, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10",
          },
          { 
            label: t("active_listings"), 
            value: stats.active, 
            icon: CheckCircle2, 
            color: "text-primary", 
            bg: "bg-primary/10",
          },
          { 
            label: t("stock_warnings"), 
            value: stats.outOfStock, 
            icon: AlertTriangle, 
            color: "text-rose-500", 
            bg: "bg-rose-500/10",
          },
          { 
            label: t("combo_revenue"), 
            value: `৳${stats.revenue.toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate leading-none mb-1.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <ComboSettings 
        settings={settings} 
        onUpdate={handleUpdate} 
        initialCombos={combos} 
        categories={categories}
        showCreateModalExternal={showCreateModal}
        onCloseCreateModalExternal={() => setShowCreateModal(false)}
      />
    </div>
  );
}
