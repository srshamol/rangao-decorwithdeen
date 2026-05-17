"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, GripVertical, Link as LinkIcon, 
  ExternalLink, Sparkles, Layout, Eye, EyeOff,
  Type, Hash, Menu as MenuIcon, ChevronRight, Monitor, Smartphone,
  Settings, Info, PlusCircle, Save, Layers, Copy, Search,
  ChevronDown, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings, MenuConfig, HeaderLink } from "@/types/admin";
import { MenuBuilder } from "./MenuBuilder";
import { toast } from "sonner";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

const MENU_LOCATIONS = [
  { id: 'header', label_en: 'Header Menu', label_bn: 'হেডার মেনু', icon: Layout },
  { id: 'mobile', label_en: 'Mobile Menu', label_bn: 'মোবাইল মেনু', icon: Smartphone },
  { id: 'footer', label_en: 'Footer Menu', label_bn: 'ফুটার মেনু', icon: Layers },
  { id: 'category', label_en: 'Category Menu', label_bn: 'ক্যাটাগরি মেনু', icon: MenuIcon },
  { id: 'mega', label_en: 'Mega Menu', label_bn: 'মেগা মেনু', icon: Sparkles },
  { id: 'sticky', label_en: 'Sticky Menu', label_bn: 'স্টিকি মেনু', icon: Monitor },
  { id: 'topbar', label_en: 'Top Bar Menu', label_bn: 'টপ বার মেনু', icon: Info },
];

export function NavigationSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<MenuConfig[]>(settings.menus || []);

  useEffect(() => {
    if (settings.menus) setMenus(settings.menus);
  }, [settings.menus]);

  const updateParent = (newMenus: MenuConfig[]) => {
    setMenus(newMenus);
    onUpdate({ menus: newMenus });
  };

  const createMenu = (locationId: string) => {
    const newMenu: MenuConfig = {
      id: `menu-${Date.now()}`,
      name: `New ${locationId.charAt(0).toUpperCase() + locationId.slice(1)} Menu`,
      slug: `${locationId}-menu-${Date.now()}`,
      location: locationId as any,
      status: 'draft',
      items: []
    };
    const updated = [...menus, newMenu];
    updateParent(updated);
    setActiveMenuId(newMenu.id);
  };

  const deleteMenu = (id: string) => {
    const updated = menus.filter(m => m.id !== id);
    updateParent(updated);
    if (activeMenuId === id) setActiveMenuId(null);
    toast.success(isBn ? "মেনু মুছে ফেলা হয়েছে" : "Menu deleted successfully");
  };

  const updateActiveMenu = (updates: Partial<MenuConfig>) => {
    const updated = menus.map(m => m.id === activeMenuId ? { ...m, ...updates } : m);
    updateParent(updated);
  };

  const activeMenu = menus.find(m => m.id === activeMenuId);

  if (activeMenuId && activeMenu) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <button 
          onClick={() => setActiveMenuId(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors font-black text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          {isBn ? "মেনু তালিকায় ফিরে যান" : "Back to Menus"}
        </button>

        <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-10 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MenuIcon size={16} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Editor Workspace</h3>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeMenu.name}</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <span className={`w-2 h-2 rounded-xl ${activeMenu.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {activeMenu.status}
                  </span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Menu Name</label>
              <input 
                type="text" 
                value={activeMenu.name}
                onChange={(e) => updateActiveMenu({ name: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-8 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Menu Status</label>
              <select 
                value={activeMenu.status}
                onChange={(e) => updateActiveMenu({ status: e.target.value as any })}
                className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-8 focus:ring-emerald-500/10 transition-all outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-10 shadow-sm min-h-[600px]">
          <MenuBuilder 
            items={activeMenu.items} 
            onChange={(items) => updateActiveMenu({ items })} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700">
      
      {/* Configuration Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MenuIcon size={16} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Navigation Architecture</h3>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Menu Studio</h2>
          <p className="text-xs text-slate-400 font-medium mt-2">Design, organize and orchestrate navigation across all platforms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Quick Access & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-8 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Create New Architecture</h4>
            <div className="grid grid-cols-1 gap-3">
              {MENU_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => createMenu(loc.id)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-white/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm transition-colors">
                    <loc.icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{isBn ? loc.label_bn : loc.label_en}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Build now</p>
                  </div>
                  <Plus size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Existing Menus List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
               <Layers size={18} className="text-emerald-500" />
               <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Orchestrations</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{menus.length} Menus Configured</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {menus.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center text-center gap-4">
                   <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                      <MenuIcon size={40} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Studio is Empty</h4>
                      <p className="text-xs text-slate-400 font-medium mt-2">Start by creating a menu from the quick access panel.</p>
                   </div>
                </div>
              ) : (
                menus.map((menu) => {
                  const location = MENU_LOCATIONS.find(l => l.id === menu.location);
                  return (
                    <motion.div
                      key={menu.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-8 hover:border-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center shadow-inner">
                            {location ? <location.icon size={28} /> : <MenuIcon size={28} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{menu.name}</h4>
                              <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${menu.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                {menu.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                              {location?.label_en} <span className="w-1 h-1 rounded-xl bg-slate-300" /> {menu.items.length} Items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setActiveMenuId(menu.id)}
                            className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                          >
                            Configure
                          </button>
                          <button 
                            onClick={() => deleteMenu(menu.id)}
                            className="w-12 h-12 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
