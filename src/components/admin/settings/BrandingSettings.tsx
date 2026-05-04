import { Palette, Type, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Props {
  settings: any;
  onUpdate: (field: string, value: any) => void;
}

export function BrandingSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const update = (field: string, value: string) => onUpdate(field, value);

  const colors = [
    { key: "primary_color", label: language === 'bn' ? "প্রধান রঙ" : "Primary Signal" },
    { key: "accent_color", label: language === 'bn' ? "অ্যাকসেন্ট রঙ" : "Accent Impulse" },
    { key: "background_color", label: language === 'bn' ? "ব্যাকগ্রাউন্ড" : "Environment Base" },
    { key: "card_color", label: language === 'bn' ? "কার্ডের রঙ" : "Module Background" },
    { key: "border_color", label: language === 'bn' ? "বর্ডার রঙ" : "Interface Perimeter" },
  ];

  const fonts = [
    { key: "heading_font", label: language === 'bn' ? "হেডিং ফন্ট (বাংলা)" : "Bengali Glyph Set", options: ["Hind Siliguri", "Noto Sans Bengali", "Baloo Da 2"] },
    { key: "body_font", label: language === 'bn' ? "বডি ফন্ট (ইংরেজি)" : "English Typeface", options: ["Inter", "Outfit", "Plus Jakarta Sans"] },
  ];

  return (
    <div className="space-y-16 max-w-5xl">
      {/* Chromatic Matrix */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ">Chromatic Matrix Calibration</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {colors.map(c => (
            <div key={c.key} className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] flex items-center gap-6 shadow-sm group hover:border-primary/20 transition-all">
              <div className="relative">
                <input 
                  type="color" 
                  value={settings[c.key] || "#000000"} 
                  onChange={(e) => update(c.key, e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-none bg-transparent p-0 overflow-hidden shadow-2xl transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none ring-4 ring-inset ring-white/10" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ">{c.label}</p>
                <input 
                  type="text" 
                  value={settings[c.key] || ""} 
                  onChange={(e) => update(c.key, e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white uppercase outline-none focus:ring-0  tracking-tighter"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Synchronization */}
      <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ">Typographic Architecture</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {fonts.map(f => (
            <div key={f.key} className="space-y-4 group">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4 flex items-center gap-3  group-focus-within:text-primary transition-colors">
                <Type size={12} className="opacity-40" /> {f.label}
              </label>
              <div className="relative">
                <select 
                  value={settings[f.key]} 
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full h-16 pl-8 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[13px] font-black  text-slate-900 dark:text-white appearance-none outline-none focus:ring-4 focus:ring-primary/10 shadow-inner cursor-pointer"
                >
                  {f.options.map(o => <option key={o} value={o} className="bg-white dark:bg-slate-950">{o}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
              <div className="mt-4 p-6 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-40">Rendering Preview</p>
                 <p style={{ fontFamily: settings[f.key] }} className="text-xl font-medium tracking-tight ">The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

