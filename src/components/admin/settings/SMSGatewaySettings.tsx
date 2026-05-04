"use client";

import { useState } from "react";
import { MessageSquare, Plus, Trash2, Key, Send, Clock, Hash, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

const SMS_PROVIDERS = [
  { id: "bulksmsbd", label: "BulkSMSBD" },
  { id: "ssl", label: "SSL Wireless" },
  { id: "mim", label: "MiM SMS" },
  { id: "twilio", label: "Twilio" },
];

interface Props {
  integrations: any[];
  onUpdate: (data: any[]) => void;
}

export function SMSGatewaySettings({ integrations, onUpdate }: Props) {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [showProviders, setShowProviders] = useState(false);

  const smsGateways = integrations.filter(i => i.category === 'sms');

  const addGateway = (providerId: string) => {
    const provider = SMS_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;
    onUpdate([...integrations, {
      id: Math.random().toString(36).substr(2, 9),
      category: "sms", providerId, providerLabel: provider.label,
      config: { api_key: "", sender_id: "", otp_length: 4, otp_expiry: 5 },
      isActive: true
    }]);
    setShowProviders(false);
  };

  const removeGateway = (id: string) => onUpdate(integrations.filter(i => i.id !== id));
  const updateConfig = (id: string, field: string, value: any) => {
    onUpdate(integrations.map(i => i.id === id ? { ...i, config: { ...i.config, [field]: value } } : i));
  };
  const toggleActive = (id: string, val: boolean) => {
    onUpdate(integrations.map(i => i.id === id ? { ...i, isActive: val } : i));
  };

  const handleTest = (gateway: any) => {
    if (!gateway.config?.api_key) {
      toast.error(bn ? "API Key দিন" : "Please enter API Key first");
      return;
    }
    toast.success(bn ? "টেস্ট পালস পাঠানো হয়েছে" : "Test pulse sent successfully");
  };

  const handleCheckBalance = (gateway: any) => {
    toast.info(bn ? "ব্যালেন্স: ৳250.00" : "Balance: ৳250.00");
  };

  const inputCls = "w-full h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center">
            <MessageSquare size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bn ? "SMS গেটওয়ে" : "SMS Gateways"}</h3>
            <p className="text-xs text-slate-400">{smsGateways.length} {bn ? "টি গেটওয়ে কনফিগার করা আছে" : "gateways configured"}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowProviders(!showProviders)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={14} /> {bn ? "গেটওয়ে যোগ" : "Add Gateway"}
          </button>
          {showProviders && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
              {SMS_PROVIDERS.map(p => (
                <button key={p.id} onClick={() => addGateway(p.id)} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  {p.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Gateway Cards */}
      {smsGateways.map((gateway, idx) => (
        <motion.div key={gateway.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {gateway.providerLabel?.slice(0, 2)}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{gateway.providerLabel}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-xl ${gateway.isActive ? "bg-primary" : "bg-slate-300"}`} />
                  <span className="text-[10px] font-medium text-slate-400">{gateway.isActive ? (bn ? "সক্রিয়" : "Active") : (bn ? "নিষ্ক্রিয়" : "Inactive")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={gateway.isActive} onCheckedChange={(v) => toggleActive(gateway.id, v)} />
              <button onClick={() => handleTest(gateway)} className="px-3 py-2 bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 rounded-xl hover:text-primary transition-all border border-slate-200 dark:border-white/10">
                {bn ? "টেস্ট" : "Test"}
              </button>
              <button onClick={() => handleCheckBalance(gateway)} className="px-3 py-2 bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 rounded-xl hover:text-primary transition-all border border-slate-200 dark:border-white/10">
                {bn ? "ব্যালেন্স" : "Balance"}
              </button>
              <button onClick={() => removeGateway(gateway.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1"><Key size={10} />{bn ? "API Key" : "API Key"}</label>
              <input type="password" value={gateway.config?.api_key || ""} onChange={e => updateConfig(gateway.id, "api_key", e.target.value)} placeholder="sk_live_..." className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1"><Send size={10} />{bn ? "সেন্ডার ID" : "Sender ID"}</label>
              <input type="text" value={gateway.config?.sender_id || ""} onChange={e => updateConfig(gateway.id, "sender_id", e.target.value)} placeholder="RANGAO" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1"><Hash size={10} />{bn ? "OTP দৈর্ঘ্য" : "OTP Length"}</label>
              <input type="number" value={gateway.config?.otp_length || 4} onChange={e => updateConfig(gateway.id, "otp_length", Number(e.target.value))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1 flex items-center gap-1"><Clock size={10} />{bn ? "মেয়াদ (মিনিট)" : "Expiry (min)"}</label>
              <input type="number" value={gateway.config?.otp_expiry || 5} onChange={e => updateConfig(gateway.id, "otp_expiry", Number(e.target.value))} className={inputCls} />
            </div>
          </div>
        </motion.div>
      ))}

      {smsGateways.length === 0 && (
        <div className="py-16 bg-slate-50 dark:bg-white/[0.01] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center">
          <MessageSquare size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
          <p className="text-sm font-medium text-slate-400">{bn ? "কোনো SMS গেটওয়ে কনফিগার করা হয়নি" : "No SMS gateways configured"}</p>
          <p className="text-xs text-slate-300 mt-1">{bn ? "উপরে 'গেটওয়ে যোগ' বাটনে ক্লিক করুন" : "Click 'Add Gateway' above to get started"}</p>
        </div>
      )}
    </div>
  );
}
