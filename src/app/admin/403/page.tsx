"use client";

import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import Link from "next/link";

export default function ForbiddenPage() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const gen = settings?.general_settings || {};
  const bn = language === 'bn';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 selection:bg-rose-500/20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon Animation */}
        <div className="relative">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-32 h-32 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto border-2 border-rose-500/20 shadow-2xl relative z-10"
          >
            <ShieldAlert size={60} className="text-rose-500" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/10 rounded-xl blur-3xl z-0"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white"
          >
            403 - {bn ? "অনুমতি নেই" : "ACCESS DENIED"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10"
          >
            {bn 
              ? "দুঃখিত, আপনার এই পেজে প্রবেশের অনুমতি নেই। দয়া করে সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।" 
              : "SORRY, YOU DO NOT HAVE SUFFICIENT PERMISSIONS TO VIEW THIS RESOURCE. PLEASE CONTACT YOUR SYSTEM ADMINISTRATOR."}
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Link href="/admin" className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group">
            <Home size={18} />
            {bn ? "ড্যাশবোর্ডে ফিরুন" : "BACK TO DASHBOARD"}
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex-1 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={18} />
            {bn ? "পূর্ববর্তী পেজ" : "GO BACK"}
          </button>
        </motion.div>

        {/* Security Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4 }}
          className="pt-10 flex items-center justify-center gap-2 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]"
        >
          <Lock size={10} />
          SECURED BY {gen.store_name || "RANGAO"} RBAC ENGINE
        </motion.div>
      </div>
    </div>
  );
}
