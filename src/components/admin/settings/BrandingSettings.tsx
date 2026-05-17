import { Palette, Type, Sparkles, Layers, ShieldCheck, Layout, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface Props {
  settings: any;
  onUpdate: (field: string, value: any) => void;
}

export function BrandingSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const update = (field: string, value: string) => onUpdate(field, value);

  const colors = [
    { key: "primary_color", label: bn ? "প্রধান থিম রঙ" : "Primary Theme Color", desc: bn ? "বাটন এবং হাইলাইটের জন্য" : "Signature brand color", icon: Palette, color: "emerald" },
    { key: "accent_color", label: bn ? "অ্যাকসেন্ট রঙ" : "Accent Color", desc: bn ? "সেকেন্ডারি হাইলাইট" : "Secondary highlights", icon: Sparkles, color: "amber" },
    { key: "background_color", label: bn ? "ব্যাকগ্রাউন্ড" : "Background", desc: bn ? "মূল অ্যাপের ব্যাকগ্রাউন্ড" : "App backdrop color", icon: Layers, color: "slate" },
    { key: "card_color", label: bn ? "কার্ড সারফেস" : "Card Surface", desc: bn ? "কন্টেইনার এলিমেন্ট" : "Panel background color", icon: Layout, color: "blue" },
    { key: "border_color", label: bn ? "বর্ডার রঙ" : "Border Color", desc: bn ? "ডিভাইডার এবং বর্ডার" : "Dividers and perimeters", icon: ShieldCheck, color: "indigo" },
  ];

  const fonts = [
    { key: "heading_font", label: bn ? "হেডিং ফন্ট (Bangla)" : "Headline Font (BN)", options: ["Hind Siliguri", "Noto Sans Bengali", "Baloo Da 2"], desc: bn ? "টাইটেল এবং হেডলাইনের জন্য" : "Used for prominent titles" },
    { key: "body_font", label: bn ? "বডি ফন্ট (English)" : "Body Font (EN)", options: ["Inter", "Outfit", "Plus Jakarta Sans"], desc: bn ? "সাধারণ প্যারাগ্রাফের জন্য" : "Standard text & paragraphs" },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Color Configuration */}
      <section className="space-y-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {bn ? "কালার প্যালেট কাস্টমাইজেশন" : "Visual Identity Colors"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {bn ? "আপনার ব্র্যান্ডের সিগনেচার রঙগুলো নির্ধারণ করুন" : "Define your store's signature color scheme"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {colors.map(c => (
            <motion.div 
              key={c.key} 
              whileHover={{ y: -4 }}
              className="p-6 bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-6 shadow-sm group hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner border-4 border-white dark:border-white/10 group-hover:rotate-6 transition-transform">
                  <input 
                    type="color" 
                    value={settings[c.key] || "#000000"} 
                    onChange={(e) => update(c.key, e.target.value)}
                    className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none bg-transparent"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <c.icon size={14} />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 truncate">{c.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black text-slate-900 dark:text-white font-mono uppercase tracking-tight">
                    {settings[c.key] || "#000000"}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 leading-tight">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Font Configuration */}
      <section className="space-y-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
              <Type size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {bn ? "টাইপোগ্রাফি সেটিংস" : "Typography Architecture"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {bn ? "আপনার ব্র্যান্ডের বাণীর জন্য সঠিক ফন্ট চয়ন করুন" : "Select fonts that define your brand voice"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {fonts.map(f => (
            <div key={f.key} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <ChevronRight size={14} className="text-emerald-500" /> {f.label}
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>

              <div className="relative group">
                <select 
                  value={settings[f.key]} 
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full h-14 pl-6 pr-12 bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-bold text-slate-900 dark:text-white appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm cursor-pointer transition-all hover:border-emerald-500/30"
                >
                  {f.options.map(o => <option key={o} value={o} className="bg-white dark:bg-slate-900">{o}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>

              <motion.div 
                layout
                className="p-10 rounded-xl bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 relative overflow-hidden group/prev"
              >
                 <div className="absolute top-4 right-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-xl bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">LIVE PREVIEW</span>
                 </div>
                 
                 <div className="space-y-4">
                   <p style={{ fontFamily: settings[f.key] }} className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white leading-tight">
                     {bn ? "সাফল্যের জন্য ডিজাইন করুন" : "Design is how it works."}
                   </p>
                   <p style={{ fontFamily: settings[f.key] }} className="text-[14px] text-slate-500 dark:text-slate-400 opacity-80 leading-relaxed max-w-sm">
                     {bn ? "আপনার স্টোরের কন্টেন্ট এখানে এই ফন্টে প্রদর্শিত হবে।" : "Your store content will look exactly like this. Simple, clean, and professional."}
                   </p>
                 </div>

                 {/* Decorative element */}
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-xl blur-3xl" />
              </motion.div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


