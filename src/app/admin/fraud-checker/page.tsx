"use client";

import { FraudChecker } from "@/components/admin/FraudChecker";
import { 
  ShieldAlert, Info, Globe, Activity, ShieldCheck, 
  Search, Shield, Zap, Loader2, ArrowRight,
  UserCheck, AlertTriangle, Cpu, Network
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Suspense } from "react";

function FraudCheckerContent() {
  const { language } = useLanguage();
  return (
    <div className="space-y-8 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner - Signature Style */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-7 text-white relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-xl blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Security Intelligence 🛡️</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-xl text-[10px] font-bold backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-xl animate-pulse" />
                Network Verified
              </div>
            </div>
            <p className="text-sm text-white/70">Authenticate entity reliability through multi-carrier logistical intelligence.</p>
          </div>
          <div className="flex gap-3">
             <div className="w-10 h-10 bg-white/15 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-all border border-white/10">
               <Shield size={16} />
             </div>
          </div>
        </div>
      </div>

      {/* Main Console Section */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-slate-100 dark:border-white/5 pb-8 gap-6">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl">
                  <ShieldAlert size={28} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Verification Console</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Initialize Phone Number Query Array</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                <ShieldCheck size={14} /> Encrypted Protocol
             </div>
          </div>
          <div className="max-w-4xl mx-auto py-10">
             <FraudChecker />
          </div>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: "Multi-Carrier Sync", 
            label: "7+ Providers",
            icon: Globe,
            desc: "Intelligence aggregated from Pathao, Steadfast, RedX, and other major logistics partners." 
          },
          { 
            title: "Real-time Reports", 
            label: "Shared Ledger",
            icon: Network,
            desc: "Access a shared manifest of fraudulent activities and cancellations from thousands of merchants." 
          },
          { 
            title: "Predictive Analytics", 
            label: "Yield Engine",
            icon: Cpu,
            desc: "Decide with precision based on historical delivery success rates and customer behavioral patterns." 
          },
        ].map((info, idx) => (
          <div key={idx} className="p-8 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 shadow-sm group hover:border-primary/30 transition-all flex items-start gap-6">
             <div className={`w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary shrink-0 shadow-inner border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform`}>
                <info.icon size={28} />
             </div>
             <div className="space-y-3 min-w-0">
               <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-1">{info.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{info.title}</p>
               </div>
               <p className="text-xs font-medium text-slate-500 dark:text-white/30 leading-relaxed">
                 {info.desc}
               </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FraudCheckerPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Security Protocol...</p></div>}>
      <FraudCheckerContent />
    </Suspense>
  );
}
