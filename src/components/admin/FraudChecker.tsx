import { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Loader2, AlertTriangle, 
  TrendingUp, TrendingDown, Package, X, ExternalLink,
  Phone, Search, MessageSquare, User, Calendar, Clock, RefreshCcw,
  Activity, LayoutGrid, Check, Zap, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

const API_URL = "/api/admin/fraud-check";
const CACHE_KEY_PREFIX = "fraud_cache_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CourierStats {
  name: string;
  logo: string;
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

interface FraudResponse {
  status: string;
  data: {
    [key: string]: CourierStats | {
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    } | string;
    summary: {
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    };
  };
  reports: Array<{
    id: string;
    name: string;
    details: string;
    created_at: string;
    courierLogo: string;
    courierName: string;
  }>;
}

export function FraudChecker({ phone: initialPhone, onClose }: { phone?: string, onClose?: () => void }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState(initialPhone || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const checkFraud = async (phoneNumber: string, force = false) => {
    if (!phoneNumber) return;
    
    if (!force) {
      const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${phoneNumber}`);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setResult(data);
            setIsCached(true);
            return;
          }
        } catch (e) {
          localStorage.removeItem(`${CACHE_KEY_PREFIX}${phoneNumber}`);
        }
      }
    }

    setLoading(true);
    setIsCached(false);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber })
      });
      const data = await response.json();
      if (data.status === "success") {
        setResult(data);
        localStorage.setItem(`${CACHE_KEY_PREFIX}${phoneNumber}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        // Trigger global update for mini-scores
        window.dispatchEvent(new CustomEvent('fraud-check-updated', { detail: phoneNumber }));
      } else {
        setError(data.message || "No data found for this number.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      checkFraud(initialPhone);
    }
  }, [initialPhone]);

  const summary = result?.data?.summary;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {!initialPhone && (
<div className="px-[2%] sm:px-4 bg-slate-50 dark:bg-white/1 border-b border-slate-100 dark:border-white/5">
           <div className="relative max-w-md mx-auto">
             <Phone className="absolute left-[1.5%] sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
             <input 
               type="text" 
               placeholder={t("enter_phone")} 
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && checkFraud(phone)}
               className="w-full min-h-[2.5rem] sm:h-10 pl-[2.5%] sm:pl-10 pr-28 py-1 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[clamp(11px,2.5vw,14px)] font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
             />
             <button 
               onClick={() => checkFraud(phone)}
               disabled={loading || !phone}
               className="absolute right-[1%] sm:right-1.5 top-1/2 -translate-y-1/2 min-h-[1.5rem] sm:h-6 px-[1.5%] sm:px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[clamp(7px,2vw,9px)] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-md hover:opacity-90"
             >
               {loading ? <Loader2 className="animate-spin" size={13} /> : t("search")}
             </button>
           </div>
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pr-2">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-48 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-xl animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("searching_networks")}</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center space-y-3"
            >
              <AlertTriangle className="mx-auto text-rose-400" size={32} />
              <p className="text-xs font-bold text-rose-500">{error}</p>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left: Total Score Hub - Ultra Compact Premium */}
                <div className="lg:w-[260px] shrink-0 w-full">
                  <div className="bg-[#0f172a] rounded-xl p-6 text-white relative overflow-hidden flex flex-col shadow-2xl border border-white/5 h-full">
                     {/* Decorative background elements */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-xl blur-[100px] -mr-32 -mt-32" />
                     
                     <div className="relative z-10 flex flex-col h-full justify-between">
                        {/* Header Area */}
                        <div>
                           <div className="flex items-start justify-between mb-6">
                              <div className="flex flex-col gap-2">
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#052e16] border border-emerald-500/20 rounded-xl w-fit">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-xl animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Intel</span>
                                 </div>
                                 <h3 className="text-sm font-black text-white uppercase tracking-wider ml-1">Overall Hub</h3>
                              </div>
                              <div className="text-right">
                                 <p className={`text-4xl font-black tracking-tighter ${(summary?.success_ratio || 0) > 80 ? 'text-emerald-400' : (summary?.success_ratio || 0) < 40 ? 'text-rose-400' : 'text-amber-400'}`}>{(summary?.success_ratio || 0)}%</p>
                                 <div className={`mt-1 inline-block px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${(summary?.success_ratio || 0) > 80 ? 'bg-emerald-500/20 text-emerald-400' : (summary?.success_ratio || 0) < 40 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {(summary?.success_ratio || 0) > 80 ? t('Safe') : (summary?.success_ratio || 0) < 40 ? t('Risk') : t('Caution')}
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/10 relative group/hub">
                              <div className="text-center border-r border-white/5">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("total_label")}</p>
                                 <p className="text-lg font-black text-white">{summary?.total_parcel}</p>
                              </div>
                              <div className="text-center border-r border-white/5">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Del</p>
                                 <p className="text-lg font-black text-emerald-400">{summary?.success_parcel}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ret</p>
                                 <p className="text-lg font-black text-rose-400">{summary?.cancelled_parcel}</p>
                              </div>
                              
                              <button 
                                 onClick={() => checkFraud(phone, true)}
                                 className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/hub:opacity-100 p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-sm border border-white/10 z-20"
                              >
                                 <RefreshCcw size={12} />
                              </button>
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-xl shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Sync Active</span>
                           </div>
                           <Activity size={12} className="text-slate-700" />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Right: Courier Matrix - No stretch */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 px-1">
                     <div className="w-1 h-2.5 bg-slate-300 dark:bg-white/10 rounded-xl" />
                     <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{t("courier_intelligence")}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {['steadfast', 'carrybee', 'redx', 'pathao', 'paperfly', 'parceldex'].map((key, idx) => {
                      const value = result.data[key] as CourierStats;
                      if (!value || typeof value !== 'object' || !value.name) return null;
                      const isSafe = value.success_ratio > 80;
                      const isRisk = value.success_ratio < 40;

                      return (
                        <motion.div 
                           key={key} 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.03 }}
                           className="bg-white dark:bg-[#0d0d0e] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden flex flex-col h-full min-h-[160px]"
                        >
                           <div className="p-6 flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-center justify-center p-2 shadow-inner">
                                    <img src={value.logo} alt={value.name} className="w-full h-full object-contain grayscale group-hover/card:grayscale-0 transition-all opacity-80 group-hover/card:opacity-100" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{value.name}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isSafe ? 'text-emerald-500' : isRisk ? 'text-rose-500' : 'text-amber-500'}`}>
                                       {isSafe ? t('Safe') : isRisk ? t('Risk') : t('Caution')}
                                    </p>
                                 </div>
                              </div>
                              <p className={`text-2xl font-black tracking-tighter ${isSafe ? 'text-emerald-500' : isRisk ? 'text-rose-500' : 'text-amber-500'}`}>{value.success_ratio}%</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 dark:border-white/5">
                               <div className="text-center border-r border-slate-100 dark:border-white/5">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("total_label")}</p>
                                  <p className="text-base font-black text-slate-900 dark:text-white">{value.total_parcel}</p>
                               </div>
                               <div className="text-center border-r border-slate-100 dark:border-white/5">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery</p>
                                  <p className="text-base font-black text-emerald-500">{value.success_parcel}</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cancel</p>
                                  <p className="text-base font-black text-rose-500">{value.cancelled_parcel}</p>
                               </div>
                            </div>
                          </div>
                          
                          {/* Dynamic Progress Bar - Bottom Stick */}
                          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-white/5 overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${value.success_ratio}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                                className={`h-full shadow-sm ${isSafe ? 'bg-emerald-500' : isRisk ? 'bg-rose-500' : 'bg-amber-500'}`}
                             />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fraud Reports - Compact Detail */}
              {result.reports.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <ShieldAlert size={12} className="text-rose-500" />
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-rose-500">{t("recent_complaints")}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {result.reports.map((report) => (
                      <div key={report.id} className="p-4 rounded-xl bg-rose-500/2 border border-rose-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-500/5 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-sm border border-slate-100 dark:border-white/5">
                            <img src={report.courierLogo} alt={report.courierName} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{report.courierName}</p>
                            <p className="text-[11px] font-bold text-rose-500 mt-0.5 leading-tight">"{report.details}"</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                           <div className="flex items-center gap-1.5"><User size={9} /> {report.name}</div>
                           <div className="flex items-center gap-1.5"><Calendar size={9} /> {report.created_at}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-48 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-200 dark:text-white/5 shadow-inner">
                <Search size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("check_history")}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{t("checking_7_networks")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {onClose && (
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-white/5">
          <button 
            onClick={onClose}
            className="w-full h-10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            {t("close")}
          </button>
        </div>
      )}
    </div>
  );
}

export function FraudMiniScore({ phone }: { phone: string }) {
  const [data, setData] = useState<{
    total_parcel: number;
    success_parcel: number;
    cancelled_parcel: number;
    success_ratio: number;
  } | null>(null);

  useEffect(() => {
    const checkCache = () => {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${phone}`);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          setData(data.data.summary);
        } catch (e) {}
      }
    };

    checkCache();
    
    const handleSync = (e: Event) => {
       const detail = (e as CustomEvent).detail;
       if (detail === phone || !detail) {
          checkCache();
       }
    };

    window.addEventListener('storage', checkCache);
    window.addEventListener('fraud-check-updated', handleSync);
    
    return () => {
       window.removeEventListener('storage', checkCache);
       window.removeEventListener('fraud-check-updated', handleSync);
    };
  }, [phone]);

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 mt-1.5"
    >
       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <Package size={7} className="text-slate-500" />
          <span className="text-[8px] font-black text-slate-500 leading-none">{data.total_parcel}</span>
       </div>
       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <Check size={7} className="text-emerald-500" />
          <span className="text-[8px] font-black text-emerald-400 leading-none">{data.success_parcel}</span>
       </div>
       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <X size={7} className="text-rose-500" />
          <span className="text-[8px] font-black text-rose-500 leading-none">{data.cancelled_parcel}</span>
       </div>
    </motion.div>
  );
}

export function FraudSummaryPanel({ phone }: { phone: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<FraudResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFraud = async () => {
      const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${phone}`);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setResult(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({ phone })
        });
        const data = await response.json();
        if (data.status === "success") {
          setResult(data);
          localStorage.setItem(`${CACHE_KEY_PREFIX}${phone}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    checkFraud();
  }, [phone]);

  if (loading) return (
    <div className="py-6 flex flex-col items-center justify-center space-y-2">
       <Loader2 className="animate-spin text-primary" size={18} />
       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading intel...</p>
    </div>
  );

  if (error || !result) return (
    <div className="py-4 text-center">
       <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error || "No intelligence"}</p>
    </div>
  );

  const summary = result.data.summary;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
       {summary.success_ratio < 40 && (
<motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-[2%] sm:p-8 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center space-y-3"
             >
               <AlertTriangle className="mx-auto text-rose-400" size={28} />
               <p className="text-[clamp(11px,2.5vw,14px)] font-bold text-rose-500">{error}</p>
             </motion.div>
       )}
       
       <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
             <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={16} />
             </div>
             <div>
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{t("fraud_intelligence")}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aggregated Results</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => {
                   const reportText = `Fraud Report for ${phone}:\nScore: ${summary.success_ratio}%\nDelivered: ${summary.success_parcel}\nReturned: ${summary.cancelled_parcel}\nTotal: ${summary.total_parcel}`;
                   navigator.clipboard.writeText(reportText);
                   toast.success("Report copied");
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary transition-all border border-slate-200/50 dark:border-white/5"
             >
                <RefreshCcw size={12} />
             </button>
             <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-fraud-checker', { detail: phone }))}
                className="px-3 py-1.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
             >
                <ExternalLink size={12} /> {t("full_intel")}
             </button>
          </div>
       </div>
       
       <div className="relative group px-1">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
             {/* Total Score Hub - Panel Version */}
             <div className="lg:w-[260px] shrink-0 w-full">
                <div className="bg-[#0f172a] rounded-xl p-6 text-white relative overflow-hidden flex flex-col shadow-2xl border border-white/5 h-full">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-xl blur-[100px] -mt-32" />
                   
                   <div className="relative z-10 flex flex-col h-full items-center text-center">
                      {/* Header Area - Vertical Stack */}
                      <div className="mb-6 w-full flex flex-col items-center">
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#052e16] border border-emerald-500/20 rounded-xl w-fit mb-4">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-xl animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Intel</span>
                         </div>
                         
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Score</p>
                         <h2 className={`text-6xl font-black tracking-tighter leading-none mb-4 ${summary.success_ratio > 80 ? 'text-emerald-400' : summary.success_ratio < 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {summary.success_ratio}%
                         </h2>
                         
                         <div className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${summary.success_ratio > 80 ? 'bg-emerald-500 text-white' : summary.success_ratio < 40 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {summary.success_ratio > 80 ? t('Safe Account') : summary.success_ratio < 40 ? t('High Risk') : t('Caution Advised')}
                         </div>
                      </div>

                      {/* Metrics Grid - Centered & Expanded */}
                      <div className="w-full grid grid-cols-3 gap-2 py-6 border-t border-white/10 relative group/hub mt-auto">
                         <div className="text-center border-r border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("total_label")}</p>
                            <p className="text-xl font-black text-white">{summary.total_parcel}</p>
                         </div>
                         <div className="text-center border-r border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Delivery</p>
                            <p className="text-xl font-black text-emerald-400">{summary.success_parcel}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cancel</p>
                            <p className="text-xl font-black text-rose-400">{summary.cancelled_parcel}</p>
                         </div>

                         <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('fraud-check-updated', { detail: phone }))}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/hub:opacity-100 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-md border border-white/10 z-20"
                         >
                            <RefreshCcw size={14} />
                         </button>
                      </div>
                   </div>
                   
                   {/* Dynamic Progress Bar - Bottom Stick */}
                   <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${summary.success_ratio}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className={`h-full shadow-[0_0_8px_rgba(16,185,129,0.3)] ${summary.success_ratio > 80 ? 'bg-emerald-500' : summary.success_ratio < 40 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      />
                   </div>
                </div>
             </div>

             {/* Courier Grid - right side - No Stretch */}
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {['steadfast', 'carrybee', 'redx', 'pathao', 'paperfly', 'parceldex'].map((key, idx) => {
                   const value: any = result.data[key as keyof typeof result.data];
                   if (!value || typeof value !== 'object' || !value.name) return null;
                   const isSafe = value.success_ratio > 80;
                   const isRisk = value.success_ratio < 40;

                   return (
                      <motion.div 
                         key={key} 
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.03 }}
                         className="bg-white dark:bg-[#0d0d0e] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden flex flex-col h-full"
                      >
                         <div className="p-4 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-center justify-center p-1.5 shadow-inner">
                                    <img src={value.logo} alt={value.name} className="w-full h-full object-contain grayscale group-hover/card:grayscale-0 transition-all opacity-80 group-hover/card:opacity-100" />
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{value.name}</p>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isSafe ? 'text-emerald-500' : isRisk ? 'text-rose-500' : 'text-amber-500'}`}>
                                       {isSafe ? t('Safe') : isRisk ? t('Risk') : t('Caution')}
                                    </p>
                                 </div>
                              </div>
                              <p className={`text-xl font-black tracking-tighter ${isSafe ? 'text-emerald-500' : isRisk ? 'text-rose-500' : 'text-amber-500'}`}>{value.success_ratio}%</p>
                            </div>

                            <div className="grid grid-cols-3 gap-1 py-2 border-y border-slate-100 dark:border-white/5">
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("total_label")}</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{value.total_parcel}</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Delivery</p>
                                  <p className="text-sm font-black text-emerald-500">{value.success_parcel}</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cancel</p>
                                  <p className="text-sm font-black text-rose-500">{value.cancelled_parcel}</p>
                               </div>
                            </div>
                         </div>
                         
                         {/* Dynamic Progress Bar - Bottom Stick */}
                         <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-white/5 overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${value.success_ratio}%` }}
                               transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                               className={`h-full shadow-sm ${isSafe ? 'bg-emerald-500' : isRisk ? 'bg-rose-500' : 'bg-amber-500'}`}
                            />
                         </div>
                      </motion.div>
                   );
                })}
             </div>
          </div>
       </div>

       {/* Intelligence Reports Feed - Compact */}
       {result.reports.length > 0 && (
          <div className="space-y-3 px-1 mt-2">
             <div className="flex items-center gap-2">
                <ShieldAlert size={12} className="text-rose-500" />
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">{t("recent_complaints")}</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.reports.slice(0, 4).map((report) => (
                   <div key={report.id} className="p-3 rounded-xl bg-rose-500/2 border border-rose-500/10 flex items-center justify-between gap-3 hover:bg-rose-500/5 transition-all group/report">
                      <div className="flex items-center gap-2.5">
                         <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-sm border border-slate-100 dark:border-white/5 group-hover/report:scale-110 transition-transform">
                            <img src={report.courierLogo} alt={report.courierName} className="w-full h-full object-contain" />
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{report.courierName}</p>
                            <p className="text-[10px] font-bold text-rose-500 leading-tight mt-0.5 line-clamp-1">"{report.details}"</p>
                         </div>
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">
                         {report.created_at}
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}
    </motion.div>
  );
}
