"use client";

import { useState } from "react";
import { 
  Code, Save, Sparkles, AlertCircle, Info, 
  Terminal, FileJson, Layout, ShieldAlert,
  ArrowLeft, Search, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings } from "@/types/admin";
import { toast } from "sonner";

interface Props {
  settings: AdminSettings;
  onUpdate: (data: Partial<AdminSettings>) => void;
}

export function CodeInjectionSettings({ settings, onUpdate }: Props) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success(isBn ? "কপি করা হয়েছে" : "Copied to clipboard");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Code size={16} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Developer Tools</h3>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Code Injection</h2>
          <p className="text-xs text-slate-400 font-medium mt-2">Inject custom styling and scripts safely into your storefront.</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl max-w-xs">
           <ShieldAlert size={18} className="text-amber-500 shrink-0" />
           <p className="text-[10px] text-amber-600/80 font-bold uppercase leading-relaxed tracking-tight">
             Warning: Custom code can break your site. Use with caution.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSS Injection */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Layout size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Global CSS</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Custom Stylesheets</p>
              </div>
            </div>
            <button 
              onClick={() => handleCopy(settings.custom_css || '', 'css')}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"
            >
              {copied === 'css' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/50 backdrop-blur-md text-white/40 text-[9px] font-black uppercase tracking-widest z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              &lt;style&gt;
            </div>
            <textarea
              value={settings.custom_css || ""}
              onChange={(e) => onUpdate({ custom_css: e.target.value })}
              placeholder="/* Add your custom CSS here */\n.hero-title {\n  color: #10b981;\n}"
              className="w-full h-[400px] bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-xl p-8 text-xs font-mono text-slate-600 dark:text-slate-400 focus:ring-8 focus:ring-blue-500/10 transition-all resize-none outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* JS Injection */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Terminal size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Global JavaScript</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Header Scripts</p>
              </div>
            </div>
            <button 
              onClick={() => handleCopy(settings.custom_js || '', 'js')}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"
            >
              {copied === 'js' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/50 backdrop-blur-md text-white/40 text-[9px] font-black uppercase tracking-widest z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              &lt;script&gt;
            </div>
            <textarea
              value={settings.custom_js || ""}
              onChange={(e) => onUpdate({ custom_js: e.target.value })}
              placeholder="// Add your custom JS here\nconsole.log('Hello from Rangao!');"
              className="w-full h-[400px] bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-xl p-8 text-xs font-mono text-slate-600 dark:text-slate-400 focus:ring-8 focus:ring-amber-500/10 transition-all resize-none outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Useful Snippets / Presets */}
      <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 rounded-xl p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Quick Snippets</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Modern Glassmorphism", 
              desc: "Apply frosted glass effect to all cards", 
              code: ".card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.05); }",
              type: "css"
            },
            { 
              title: "Disable Right Click", 
              desc: "Prevent content theft (Basic)", 
              code: "document.addEventListener('contextmenu', e => e.preventDefault());",
              type: "js"
            },
            { 
              title: "Custom Font Loading", 
              desc: "Import a custom Google Font", 
              code: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');",
              type: "css"
            }
          ].map((snippet, i) => (
            <div 
              key={i}
              className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-emerald-500/20 transition-all group"
            >
              <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{snippet.title}</h5>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">{snippet.desc}</p>
              <button 
                onClick={() => {
                  if (snippet.type === 'css') {
                    onUpdate({ custom_css: (settings.custom_css || '') + '\n' + snippet.code });
                  } else {
                    onUpdate({ custom_js: (settings.custom_js || '') + '\n' + snippet.code });
                  }
                  toast.success(isBn ? "স্নিপেট যোগ করা হয়েছে" : "Snippet applied successfully");
                }}
                className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest group-hover:gap-3 transition-all"
              >
                Apply Snippet <ArrowLeft size={12} className="rotate-180" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
