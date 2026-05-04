"use client";

import { useState } from "react";
import { 
  Plus, Trash2, GripVertical, Link as LinkIcon, 
  ExternalLink, Sparkles, Layout, Eye, EyeOff,
  Type, Hash, Move
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings, HeaderLink } from "@/types/admin";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function NavigationSettings({ settings, onUpdate }: Props) {
  const { t, language } = useLanguage();
  const bn = language === 'bn';
  const [links, setLinks] = useState<HeaderLink[]>(settings.header_links || []);

  const update = (field: keyof AdminSettings, value: any) => onUpdate({ [field]: value });

  const addLink = () => {
    const newLink = { label_bn: t("add_link"), label_en: "New Link", href: "/shop" };
    const updated = [...links, newLink];
    setLinks(updated);
    update("header_links", updated);
  };

  const removeLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    update("header_links", updated);
  };

  const updateLink = (index: number, field: keyof HeaderLink, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
    onUpdate({ header_links: updated });
  };

  const handleReorder = (newOrder: any[]) => {
    setLinks(newOrder);
    onUpdate({ header_links: newOrder });
  };

  const updatePromoBadge = (field: string, value: any) => {
    onUpdate({
      promo_badge: {
        ...settings.promo_badge,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle Settings */}
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Layout size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {t("menu_visibility")}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t("control_header_desc")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${settings.show_categories ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"}`}>
                  {settings.show_categories ? <Eye size={16} /> : <EyeOff size={16} />}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                    {t("all_categories_menu")}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t("show_category_dropdown_desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUpdate({ show_categories: !settings.show_categories })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.show_categories ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-slate-300 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.show_categories ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Promo Badge Settings */}
        <div className="bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {t("promo_badge_offer")}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t("promo_badge_desc")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-slate-600">
                {t("enable_badge")}
              </span>
              <button
                onClick={() => updatePromoBadge('enabled', !settings.promo_badge?.enabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.promo_badge?.enabled ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-slate-300 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.promo_badge?.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Labels (BN)</label>
                <input 
                  type="text" 
                  value={settings.promo_badge?.text_bn || ""}
                  onChange={(e) => updatePromoBadge('text_bn', e.target.value)}
                  placeholder="রমজান অফার"
                  className="w-full h-9 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-lg px-3 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Labels (EN)</label>
                <input 
                  type="text" 
                  value={settings.promo_badge?.text_en || ""}
                  onChange={(e) => updatePromoBadge('text_en', e.target.value)}
                  placeholder="Ramadan Offer"
                  className="w-full h-9 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-lg px-3 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Link</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={settings.promo_badge?.href || ""}
                  onChange={(e) => updatePromoBadge('href', e.target.value)}
                  placeholder="/shop?offers=true"
                  className="w-full h-9 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-lg pl-8 pr-3 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Links Management */}
      <div className="bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <GripVertical size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t("header_menu_links")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("organize_menu_desc")}
              </p>
            </div>
          </div>
          <button 
            onClick={addLink}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] text-white rounded-xl text-[13px] font-bold hover:bg-[#053F30] transition-all shadow-lg shadow-emerald-900/10"
          >
            <Plus size={18} />
            {t("add_link")}
          </button>
        </div>

        <Reorder.Group axis="y" values={links} onReorder={handleReorder} className="space-y-3">
          {links.map((link, index) => (
            <Reorder.Item 
              key={link.label_en + index} 
              value={link}
              className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl group transition-all hover:border-primary/20"
            >
              <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 transition-colors">
                <Move size={20} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <Type size={12} />
                    <span>Label (BN)</span>
                  </div>
                  <input 
                    type="text" 
                    value={link.label_bn}
                    onChange={(e) => updateLink(index, 'label_bn', e.target.value)}
                    className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <Type size={12} />
                    <span>Label (EN)</span>
                  </div>
                  <input 
                    type="text" 
                    value={link.label_en}
                    onChange={(e) => updateLink(index, 'label_en', e.target.value)}
                    className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <Hash size={12} />
                    <span>URL Path</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={link.href}
                      onChange={(e) => updateLink(index, 'href', e.target.value)}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-4 pr-10 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <ExternalLink size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => removeLink(index)}
                className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </Reorder.Item>
          ))}
          
          {links.length === 0 && (
            <div className="text-center py-12 bg-slate-50 dark:bg-white/[0.01] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <LinkIcon size={32} />
              </div>
              <p className="text-sm font-bold text-slate-500">{t("no_links_msg")}</p>
              <p className="text-[11px] text-slate-400 mt-1">{t("add_links_instruction")}</p>
            </div>
          )}
        </Reorder.Group>
      </div>
    </div>
  );
}
