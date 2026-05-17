"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Timer, RefreshCw, X, ArrowRight, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EliteOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isVerifying: boolean;
  isResending: boolean;
  language: "bn" | "en";
}

export function EliteOTPModal({ 
  isOpen, 
  onClose,
  phone, 
  onVerify, 
  onResend, 
  isVerifying, 
  isResending,
  language 
}: EliteOTPModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isBn = language === "bn";

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Auto-focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } else {
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(60);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last or next empty
    const nextIndex = data.length < 6 ? data.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length === 6) {
      onVerify(code);
    } else {
      toast.error(isBn ? "সঠিক ৬ ডিজিটের কোড দিন" : "Please enter a valid 6-digit code");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <VisuallyHidden>
            <DialogHeader>
                <DialogTitle>OTP Verification</DialogTitle>
                <DialogDescription>Enter the verification code sent to your phone</DialogDescription>
            </DialogHeader>
        </VisuallyHidden>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 relative overflow-hidden"
        >
          {/* Elite Background Accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-emerald-500/5 blur-[100px] rounded-full" />
            <div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full" />
          </div>

          <div className="relative p-10 flex flex-col items-center">
            {/* Header Icon Section */}
            <div className="relative mb-8">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[2rem] flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-inner"
              >
                <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
                <ShieldCheck className="text-emerald-500 dark:text-emerald-400 w-12 h-12 relative z-10" strokeWidth={1.5} />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center">
                <Smartphone size={18} className="text-slate-400" />
              </div>
            </div>

            {/* Typography Section */}
            <div className="text-center space-y-3 mb-10">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isBn ? "যাচাই করুন" : "Verification"}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {isBn ? "আপনার ফোনে কোড পাঠানো হয়েছে" : "Enter Code Sent To"}
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                  <span className="opacity-40 tracking-tighter">••••••</span>
                  <span>{phone.slice(-4)}</span>
                </div>
              </div>
            </div>

            {/* OTP Input Grid */}
            <div className="flex gap-3 mb-10 justify-center w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-16 md:w-14 md:h-20 text-center text-3xl font-black rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-400/10 transition-all outline-none text-slate-900 dark:text-white"
                />
              ))}
            </div>

            {/* Primary Action */}
            <Button 
              onClick={handleSubmit}
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-slate-900/20 dark:shadow-emerald-500/20 transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isVerifying ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="animate-spin" size={20} />
                    <span>{isBn ? "যাচাই হচ্ছে..." : "Verifying..."}</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <span>{isBn ? "অর্ডার সম্পন্ন করুন" : "Complete Order"}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Footer / Resend Section */}
            <div className="mt-8 text-center w-full">
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <Timer size={14} className="text-slate-400 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {isBn ? `পুনরায় পাঠান ${timeLeft} সে.` : `Resend in ${timeLeft}s`}
                  </p>
                </div>
              ) : (
                <button 
                  onClick={() => { setTimeLeft(60); onResend(); }}
                  disabled={isResending}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                    {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {isBn ? "নতুন কোড পাঠান" : "Resend Security Code"}
                  </span>
                </button>
              )}
            </div>

            {/* Close / Dismiss */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
