"use client";

import { useState } from "react";
import { 
  Plus, Trash2, GripVertical, Link as LinkIcon, 
  ExternalLink, Sparkles, Layout, Eye, EyeOff,
  Type, Hash, Menu as MenuIcon, ChevronRight, Monitor, Smartphone,
  Package, Grid3X3, Layers, MessageSquare, Phone,
  Facebook, Instagram, Info, Settings, Image as ImageIcon,
  ChevronDown, MoveUp, MoveDown, Star, Zap, Flame, Moon, PlusCircle,
  Copy, Save, Search, Globe, Tag, Heart
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { HeaderLink } from "@/types/admin";

interface Props {
  items: HeaderLink[];
  onChange: (items: HeaderLink[]) => void;
  maxLevels?: number;
}

const LINK_TYPES = [
  { id: 'link', label_en: 'Custom Link', label_bn: 'কাস্টম লিংক', icon: LinkIcon, color: 'text-blue-500' },
  { id: 'category', label_en: 'Product Category', label_bn: 'ক্যাটাগরি', icon: Grid3X3, color: 'text-emerald-500' },
  { id: 'product', label_en: 'Product Page', label_bn: 'পণ্য', icon: Package, color: 'text-purple-500' },
  { id: 'collection', label_en: 'Collection', label_bn: 'কালেকশন', icon: Layers, color: 'text-amber-500' },
  { id: 'islamic_art', label_en: 'Islamic Wall Art', label_bn: 'ইসলামিক ওয়াল আর্ট', icon: Sparkles, color: 'text-emerald-600' },
  { id: 'quran_verse', label_en: 'Quran Verse', label_bn: 'কুরআনিক ভার্স', icon: Moon, color: 'text-indigo-500' },
  { id: 'nikahnama', label_en: 'Nikahnama', label_bn: 'নিকাহনামা', icon: Heart, color: 'text-rose-500' },
  { id: 'external', label_en: 'External Link', label_bn: 'এক্সটার্নাল লিংক', icon: ExternalLink, color: 'text-slate-500' },
  { id: 'whatsapp', label_en: 'WhatsApp', label_bn: 'হোয়াটসঅ্যাপ', icon: MessageSquare, color: 'text-green-500' },
  { id: 'social', label_en: 'Social Media', label_bn: 'সোশ্যাল মিডিয়া', icon: Facebook, color: 'text-blue-600' },
];

const BADGE_TYPES = [
  { id: 'new', label_en: 'New', label_bn: 'নতুন', icon: Sparkles, color: 'bg-blue-500' },
  { id: 'sale', label_en: 'Sale', label_bn: 'অফার', icon: Tag, color: 'bg-rose-500' },
  { id: 'hot', label_en: 'Hot', label_bn: 'হট', icon: Flame, color: 'bg-orange-500' },
  { id: 'ramadan', label_en: 'Ramadan', label_bn: 'রমজান', icon: Moon, color: 'bg-purple-500' },
  { id: 'eid', label_en: 'Eid', label_bn: 'ঈদ', icon: Sparkles, color: 'bg-amber-500' },
];

export function MenuBuilder({ items, onChange, maxLevels = 3 }: Props) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addItem = (parentId: string | null = null) => {
    const newItem: HeaderLink = {
      id: `item-${Date.now()}`,
      label_bn: isBn ? "নতুন আইটেম" : "New Item",
      label_en: "New Item",
      href: "/",
      type: 'link',
      children: []
    };

    if (parentId) {
      const updateChildren = (list: HeaderLink[]): HeaderLink[] => {
        return list.map(item => {
          if (item.id === parentId) {
            return { ...item, children: [...(item.children || []), newItem] };
          }
          if (item.children) {
            return { ...item, children: updateChildren(item.children) };
          }
          return item;
        });
      };
      onChange(updateChildren(items));
    } else {
      onChange([...items, newItem]);
    }
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    const filterItems = (list: HeaderLink[]): HeaderLink[] => {
      return list.filter(item => item.id !== id).map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : []
      }));
    };
    onChange(filterItems(items));
    if (expandedId === id) setExpandedId(null);
  };

  const updateItem = (id: string, updates: Partial<HeaderLink>) => {
    const mapItems = (list: HeaderLink[]): HeaderLink[] => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: mapItems(item.children) };
        }
        return item;
      });
    };
    onChange(mapItems(items));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MenuIcon size={18} className="text-emerald-500" />
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-xs">
            {isBn ? "মেনু গঠন" : "Menu Architecture"}
          </h3>
        </div>
        <button 
          onClick={() => addItem()}
          className="h-11 px-6 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <PlusCircle size={16} strokeWidth={3} />
          {isBn ? "আইটেম যোগ করুন" : "Add Root Item"}
        </button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                <Layers size={32} />
             </div>
             <div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Items Found</p>
                <p className="text-[10px] text-slate-400/60 font-bold uppercase tracking-widest mt-1">Start building your menu structure</p>
             </div>
          </div>
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={onChange} className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <MenuItemRow 
                  key={item.id} 
                  item={item} 
                  level={1}
                  isBn={isBn}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  addItem={addItem}
                  maxLevels={maxLevels}
                  onReorderChildren={(newChildren: any) => updateItem(item.id, { children: newChildren })}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

function MenuItemRow({ 
  item, 
  level, 
  isBn, 
  expandedId, 
  setExpandedId, 
  updateItem, 
  removeItem, 
  addItem,
  maxLevels,
  onReorderChildren
}: any) {
  const isExpanded = expandedId === item.id;
  const itemType = LINK_TYPES.find(t => t.id === item.type) || LINK_TYPES[0];

  return (
    <div className="space-y-4">
      <Reorder.Item 
        value={item}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-2xl ring-2 ring-emerald-500/10' : 'hover:shadow-xl hover:border-emerald-500/20'}`}
      >
        <div className="flex items-center p-4 gap-4">
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl">
            <GripVertical size={16} strokeWidth={2.5} />
          </div>
          
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${itemType.color} bg-slate-50 dark:bg-white/[0.03]`}>
            <itemType.icon size={18} />
          </div>

          <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                {isBn ? item.label_bn : item.label_en}
              </p>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-xl text-[8px] font-black text-white uppercase tracking-tighter ${BADGE_TYPES.find(b => b.id === item.badge)?.color}`}>
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60 truncate max-w-[200px]">
              {item.href}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {level < maxLevels && (
              <button 
                onClick={(e) => { e.stopPropagation(); addItem(item.id); }}
                className="w-10 h-10 rounded-xl text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-all"
                title="Add Sub-item"
              >
                <Plus size={18} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
              className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 text-emerald-500' : 'text-slate-300'}`}
            >
              <ChevronDown size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]"
            >
              <div className="p-8 space-y-8">
                {/* Labels */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label (BN)</label>
                    <input 
                      type="text" 
                      value={item.label_bn}
                      onChange={(e) => updateItem(item.id, { label_bn: e.target.value })}
                      className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label (EN)</label>
                    <input 
                      type="text" 
                      value={item.label_en}
                      onChange={(e) => updateItem(item.id, { label_en: e.target.value })}
                      className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Type</label>
                    <div className="relative">
                      <select 
                        value={item.type}
                        onChange={(e) => updateItem(item.id, { type: e.target.value })}
                        className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      >
                        {LINK_TYPES.map(t => (
                          <option key={t.id} value={t.id}>{isBn ? t.label_bn : t.label_en}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge</label>
                    <div className="relative">
                      <select 
                        value={item.badge || ''}
                        onChange={(e) => updateItem(item.id, { badge: e.target.value || null })}
                        className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      >
                        <option value="">No Badge</option>
                        {BADGE_TYPES.map(b => (
                          <option key={b.id} value={b.id}>{isBn ? b.label_bn : b.label_en}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination URL</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={item.href}
                      onChange={(e) => updateItem(item.id, { href: e.target.value })}
                      className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-xs font-mono focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      placeholder="/shop"
                    />
                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Mega Menu Toggle (Level 1 only) */}
                {level === 1 && (
                  <div className="p-6 bg-slate-100 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Layout size={18} className="text-emerald-500" />
                        <div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Mega Menu</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Advanced multi-column layout</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateItem(item.id, { 
                          mega_menu_config: { 
                            enabled: !item.mega_menu_config?.enabled,
                            layout: 'multi-column'
                          } 
                        })}
                        className={`w-12 h-7 rounded-xl transition-all relative ${item.mega_menu_config?.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-xl bg-white transition-all shadow-sm ${item.mega_menu_config?.enabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {item.mega_menu_config?.enabled && (
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-white/5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Layout Type</label>
                          <select 
                            value={item.mega_menu_config.layout}
                            onChange={(e) => updateItem(item.id, { 
                              mega_menu_config: { ...item.mega_menu_config, layout: e.target.value } 
                            })}
                            className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-[10px] font-bold outline-none"
                          >
                            <option value="multi-column">Multi-Column</option>
                            <option value="product-showcase">Product Showcase</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Column Count</label>
                          <input 
                            type="number"
                            value={item.mega_menu_config.columns || 4}
                            onChange={(e) => updateItem(item.id, { 
                              mega_menu_config: { ...item.mega_menu_config, columns: parseInt(e.target.value) } 
                            })}
                            className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-[10px] font-bold outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Reorder.Item>

      {/* Children Reorder Group */}
      {item.children && item.children.length > 0 && (
        <div className="ml-10 border-l-2 border-slate-100 dark:border-white/5 pl-6 space-y-4 pt-2 pb-6">
          <Reorder.Group axis="y" values={item.children} onReorder={onReorderChildren} className="space-y-4">
            <AnimatePresence>
              {item.children.map((child: any) => (
                <MenuItemRow 
                  key={child.id} 
                  item={child} 
                  level={level + 1}
                  isBn={isBn}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  addItem={addItem}
                  maxLevels={maxLevels}
                  onReorderChildren={(newSubChildren: any) => updateItem(child.id, { children: newSubChildren })}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
