"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Timer, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OTPVerificationProps {
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isVerifying: boolean;
  isResending: boolean;
  language: "bn" | "en";
}

export function OTPVerification({ 
  phone, 
  onVerify, 
  onResend, 
  isVerifying, 
  isResending,
  language 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const isBn = language === "bn";

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    } else {
      toast.error(isBn ? "সঠিক ৬ ডিজিটের কোড দিন" : "Please enter a valid 6-digit code");
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20">
          <ShieldCheck className="text-primary w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {isBn ? "ভেরিফিকেশন কোড" : "Verification Code"}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {isBn 
            ? `${phone} নম্বরে একটি ৬ ডিজিটের কোড পাঠানো হয়েছে।` 
            : `A 6-digit code has been sent to ${phone}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <Input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="● ● ● ● ● ●"
            className="w-48 h-14 text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
            autoFocus
          />
        </div>

        <Button 
          type="submit" 
          disabled={isVerifying || otp.length !== 6}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isVerifying ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            isBn ? "কোড যাচাই করুন" : "Verify Code"
          )}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3">
        {timeLeft > 0 ? (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Timer size={14} />
            {isBn ? `পুনরায় কোড পাঠান (${timeLeft}s)` : `Resend code in (${timeLeft}s)`}
          </div>
        ) : (
          <button 
            onClick={() => { setTimeLeft(60); onResend(); }}
            disabled={isResending}
            className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
          >
            {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isBn ? "কোড পুনরায় পাঠান" : "Resend Verification Code"}
          </button>
        )}
      </div>
    </div>
  );
}
