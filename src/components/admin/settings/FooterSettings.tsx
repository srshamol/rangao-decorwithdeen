"use client";

import { useState } from "react";
import { 
  Layout, Type, Link as LinkIcon, Plus, Trash2, 
  GripVertical, Eye, EyeOff, Smartphone, Monitor,
  MessageCircle, Info, Hash, ChevronRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings, FooterSettings as FooterSettingsType, FooterColumn, HeaderLink } from "@/types/admin";
import { toast } from "sonner";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function FooterSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  const footer = settings.footer_settings || {
    text_bn: "",
    text_en: "",
    show_social: true,
    show_payment_methods: true,
    copyright_text: "© 2024 Rangao Decor. All rights reserved.",
    columns: []
  };

  const updateFooter = (newFooter: Partial<FooterSettingsType>) => {
    onUpdate({ footer_settings: { ...footer, ...newFooter } });
  };

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: `col-${Date.now()}`,
      title_bn: bn ? "নতুন কলাম" : "New Column",
      title_en: "New Column",
      links: []
    };
    updateFooter({ columns: [...footer.columns, newColumn] });
    setExpandedColumn(newColumn.id);
  };

  const removeColumn = (id: string) => {
    updateFooter({ columns: footer.columns.filter(c => c.id !== id) });
    if (expandedColumn === id) setExpandedColumn(null);
  };

  const updateColumn = (id: string, data: Partial<FooterColumn>) => {
    updateFooter({ 
      columns: footer.columns.map(c => c.id === id ? { ...c, ...data } : c) 
    });
  };

  const addLink = (columnId: string) => {
    const col = footer.columns.find(c => c.id === columnId);
    if (!col) return;
    const newLink: HeaderLink = { label_bn: bn ? "নতুন লিংক" : "New Link", label_en: "New Link", href: "/" };
    updateColumn(columnId, { links: [...col.links, newLink] });
  };

  const removeLink = (columnId: string, index: number) => {
    const col = footer.columns.find(c => c.id === columnId);
    if (!col) return;
    updateColumn(columnId, { links: col.links.filter((_, i) => i !== index) });
  };

  const updateLink = (columnId: string, index: number, data: Partial<HeaderLink>) => {
    const col = footer.columns.find(c => c.id === columnId);
    if (!col) return;
    const newLinks = [...col.links];
    newLinks[index] = { ...newLinks[index], ...data };
    updateColumn(columnId, { links: newLinks });
  };

  return (
    <div className="space-y-12 pb-40">
      
      {/* Footer Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layout size={16} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Footer Architecture</h3>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bottom Layout</h2>
          <p className="text-xs text-slate-400 font-medium mt-2">Customize description, social visibility, and navigation columns.</p>
        </div>
      </div>

      {/* Brand & Social Control */}
      <section className="bg-white dark:bg-[#0c0c0c] border border-slate-200/80 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3 group">
              <div className="flex items-center gap-2.5 ml-1">
                <Info size={12} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-emerald-500 transition-colors">Description (BN)</label>
              </div>
              <textarea 
                value={footer.text_bn} 
                onChange={e => updateFooter({ text_bn: e.target.value })}
                className="w-full h-32 px-6 py-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all shadow-sm resize-none"
                placeholder="আপনার স্টোর সম্পর্কে কিছু লিখুন..."
              />
            </div>
            <div className="space-y-3 group">
              <div className="flex items-center gap-2.5 ml-1">
                <Info size={12} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-emerald-500 transition-colors">Description (EN)</label>
              </div>
              <textarea 
                value={footer.text_en} 
                onChange={e => updateFooter({ text_en: e.target.value })}
                className="w-full h-32 px-6 py-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all shadow-sm resize-none"
                placeholder="Write something about your store..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/10 group hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${footer.show_social ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <span className="block text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Social Connect</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Footer Icons</span>
                </div>
              </div>
              <button 
                onClick={() => updateFooter({ show_social: !footer.show_social })}
                className={`w-12 h-7 rounded-xl relative transition-all ${footer.show_social ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-xl bg-white transition-all shadow-sm ${footer.show_social ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/10 group hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${footer.show_payment_methods ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="block text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Payment Methods</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trust Badges</span>
                </div>
              </div>
              <button 
                onClick={() => updateFooter({ show_payment_methods: !footer.show_payment_methods })}
                className={`w-12 h-7 rounded-xl relative transition-all ${footer.show_payment_methods ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-xl bg-white transition-all shadow-sm ${footer.show_payment_methods ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Column Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Layout size={18} className="text-emerald-500" />
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-xs">Navigation Columns</h3>
          </div>
          <button 
            onClick={addColumn}
            className="h-11 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> {bn ? "কলাম যোগ করুন" : "Add Column"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {footer.columns.map((column) => (
            <div key={column.id} className={`group bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden transition-all duration-300 ${expandedColumn === column.id ? 'shadow-2xl ring-2 ring-emerald-500/10' : 'hover:shadow-xl hover:border-emerald-500/20'}`}>
              <div className="flex items-center gap-6 p-6">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all duration-500">
                  <Layout size={22} />
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedColumn(expandedColumn === column.id ? null : column.id)}>
                  <h4 className="text-[14px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-2">{column.title_en}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">{column.links.length} Links Configured</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeColumn(column.id)} className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-all">
                    <Trash2 size={18} />
                  </button>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${expandedColumn === column.id ? 'rotate-180 text-emerald-500' : 'text-slate-300'}`}>
                    <ChevronRight size={18} strokeWidth={3} className="rotate-90" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedColumn === column.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]"
                  >
                    <div className="p-10 space-y-10">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Column Title (BN)</label>
                          <input 
                            value={column.title_bn} 
                            onChange={e => updateColumn(column.id, { title_bn: e.target.value })}
                            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Column Title (EN)</label>
                          <input 
                            value={column.title_en} 
                            onChange={e => updateColumn(column.id, { title_en: e.target.value })}
                            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Column Navigation Links</h5>
                          <button 
                            onClick={() => addLink(column.id)}
                            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                          >
                            + Quick Add Link
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {column.links.map((link, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm group/link hover:border-emerald-500/30 transition-all">
                              <div className="flex items-center gap-4 flex-1 w-full">
                                <GripVertical size={14} className="text-slate-200" />
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                  <input 
                                    value={link.label_en} 
                                    onChange={e => updateLink(column.id, idx, { label_en: e.target.value })}
                                    className="h-9 bg-transparent text-xs font-black text-slate-800 dark:text-white outline-none border-b border-transparent focus:border-emerald-500/20"
                                    placeholder="Link Label"
                                  />
                                  <div className="relative">
                                    <input 
                                      value={link.href} 
                                      onChange={e => updateLink(column.id, idx, { href: e.target.value })}
                                      className="w-full h-9 bg-transparent text-[10px] font-mono text-slate-400 outline-none border-b border-transparent focus:border-emerald-500/20 pl-6"
                                      placeholder="/url"
                                    />
                                    <LinkIcon size={10} className="absolute left-0 top-1/2 -translate-y-1/2" />
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => removeLink(column.id, idx)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
