import { useState } from "react";
import { 
  Server, Plus, Trash2, ShieldCheck, Ticket, Smartphone, Globe, 
  Lock, Fingerprint, Key, Zap, ShieldAlert, Clock, MousePointer2,
  Bell, Mail, MessageSquare, Flame, Code2, Link, Database, Send,
  ChevronRight, Type, Info, Check, Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { Switch } from "@/components/ui/switch";

interface Props {
  integrations: any[];
  coupons: any[];
  blockedData: { ips: any[], numbers: any[] };
  advancedSettings: any;
  onUpdateIntegrations: (data: any[]) => void;
  onUpdateAdvanced: (data: any) => void;
  onRefresh: () => void;
}

const COURIER_PROVIDERS = [
  { id: "redx", label: "RedX Courier", logo: "RX" },
  { id: "steadfast", label: "Steadfast", logo: "SF" },
  { id: "pathao", label: "Pathao", logo: "PH" },
  { id: "carrybee", label: "Carrybee", logo: "CB" },
];

const SMS_PROVIDERS = [
  { id: "bulksmsbd", label: "BulkSMSBD", logo: "BS" },
  { id: "ssl", label: "SSL Wireless", logo: "SSL" },
  { id: "mim", label: "MiM SMS", logo: "MIM" },
  { id: "twilio", label: "Twilio", logo: "TW" },
];

const FRAUD_PROVIDERS = [
  { id: "fraudchecker", label: "Fraudchecker API", logo: "FC" },
];

export function APISettings({ 
  integrations, coupons, blockedData, advancedSettings,
  onUpdateIntegrations, onUpdateAdvanced, onRefresh 
}: Props) {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState("order_logic");

  const addIntegration = (providerId: string, category: string) => {
    const provider = [...COURIER_PROVIDERS, ...SMS_PROVIDERS, ...FRAUD_PROVIDERS].find(p => p.id === providerId);
    if (!provider) return;

    onUpdateIntegrations([...integrations, {
      id: Math.random().toString(36).substr(2, 9),
      category,
      providerId,
      providerLabel: provider.label,
      config: {
        otp_length: 4,
        otp_expiry: 5
      },
      isActive: true
    }]);
  };

  const removeIntegration = (id: string) => {
    onUpdateIntegrations(integrations.filter(i => i.id !== id));
  };

  const updateConfig = (id: string, field: string, value: any) => {
    onUpdateIntegrations(integrations.map(i => i.id === id ? { ...i, config: { ...i.config, [field]: value } } : i));
  };

  const updateAdvanced = (section: string, field: string, value: any) => {
    onUpdateAdvanced({
      ...advancedSettings,
      [section]: {
        ...advancedSettings[section],
        [field]: value
      }
    });
  };

  const updateNestedAdvanced = (section: string, sub: string, field: string, value: any) => {
    onUpdateAdvanced({
      ...advancedSettings,
      [section]: {
        ...advancedSettings[section],
        [sub]: {
          ...advancedSettings[section][sub],
          [field]: value
        }
      }
    });
  };

  const SectionHeader = ({ icon: Icon, title, desc, colorClass }: any) => (
    <div className="flex items-center gap-6 mb-10">
      <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center shadow-lg border border-white/10`}>
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{title}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1 opacity-60">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-10">
      {/* Module Selector - Circuit Style */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner relative group">
        {[
          { id: "order_logic", label: "Checkout Logic", icon: Zap },
          { id: "otp_config", label: "OTP Verification", icon: Smartphone },
          { id: "capi", label: "Facebook CAPI", icon: Globe },
          { id: "sms_gateways", label: "SMS Gateways", icon: MessageSquare },
          { id: "firebase", label: "Firebase", icon: Database },
          { id: "recovery", label: "Cart Recovery", icon: Flame },
          { id: "coupons", label: "Coupons", icon: Ticket },
          { id: "security", label: "Blacklist", icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              activeSubTab === tab.id 
              ? "bg-slate-950 text-white shadow-xl scale-105 border border-white/5" 
              : "text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon size={14} className={activeSubTab === tab.id ? "text-primary" : "opacity-40"} />
            {tab.label}
            {activeSubTab === tab.id && (
              <motion.div layoutId="tabSelectorGlow" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-xl shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* 1. ORDER LOGIC */}
          {activeSubTab === "order_logic" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-xl blur-3xl" />
                
                <SectionHeader 
                  icon={ShieldAlert} 
                  title="Checkout & Verification Logic" 
                  desc="Filter and secure order submissions"
                  colorClass="bg-rose-500/10 text-rose-500"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner group">
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">Delivery Success Filter</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Verify courier delivery history</p>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.success_filter_enabled}
                        onCheckedChange={(v) => updateAdvanced("order", "success_filter_enabled", v)}
                      />
                    </div>

                    <div className={`space-y-8 transition-all duration-500 ${advancedSettings.order?.success_filter_enabled ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-2"}`}>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Minimum Success Rate (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={advancedSettings.order?.success_threshold || 50}
                            onChange={(e) => updateAdvanced("order", "success_threshold", Number(e.target.value))}
                            className="w-full h-16 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                          <Percent size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Redirect URL for Low Success</label>
                        <div className="relative">
                           <input 
                            type="text" 
                            placeholder="https://yourstore.com/verify..."
                            value={advancedSettings.order?.low_success_redirect || ""}
                            onChange={(e) => updateAdvanced("order", "low_success_redirect", e.target.value)}
                            className="w-full h-16 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                          <Link size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">Block Zero History</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Only allow known numbers</p>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.filter_zero_history}
                        onCheckedChange={(v) => updateAdvanced("order", "filter_zero_history", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">Anti-Spam Filter</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">Prevent rapid order submissions</p>
                      </div>
                      <Switch 
                        checked={advancedSettings.order?.filter_rapid_submissions}
                        onCheckedChange={(v) => updateAdvanced("order", "filter_rapid_submissions", v)}
                      />
                    </div>
                    {advancedSettings.order?.filter_rapid_submissions && (
                       <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Minimum Interval (Seconds)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={advancedSettings.order?.min_submission_time || 30}
                            onChange={(e) => updateAdvanced("order", "min_submission_time", Number(e.target.value))}
                            className="w-full h-16 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                          <Clock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
                  <SectionHeader 
                    icon={Database} 
                    title="Order Frequency Limits" 
                    desc="Prevent abuse from same device/number/IP"
                    colorClass="bg-blue-500/10 text-blue-500"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: "device", label: "Device Node", sub: "Browser instance" },
                      { id: "number", label: "Signal Node", sub: "Phone identifier" },
                      { id: "ip", label: "Network Node", sub: "IP coordinates" }
                    ].map(limit => (
                      <div key={limit.id} className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 space-y-8 shadow-sm group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">{limit.label}</p>
                            <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">{limit.sub}</p>
                          </div>
                          <Switch 
                            checked={advancedSettings.order?.[`${limit.id}_limit_enabled`]}
                            onCheckedChange={(v) => updateAdvanced("order", `${limit.id}_limit_enabled`, v)}
                          />
                        </div>
                        <div className={`space-y-3 transition-all duration-500 ${advancedSettings.order?.[`${limit.id}_limit_enabled`] ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Block Duration (Hrs)</label>
                          <input 
                            type="number" 
                            value={advancedSettings.order?.[`${limit.id}_block_hours`] || 24}
                            onChange={(e) => updateAdvanced("order", `${limit.id}_block_hours`, Number(e.target.value))}
                            className="w-full h-14 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 2. OTP CONFIGURATION */}
          {activeSubTab === "otp_config" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-xl blur-[100px]" />
                
                <SectionHeader 
                  icon={Lock} 
                  title="OTP Verification Flow" 
                  desc="Configure how and when to verify orders"
                  colorClass="bg-gold/10 text-gold"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">Verification Protocol</label>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: "disabled", label: "Disabled", desc: "No verification, fastest checkout", icon: Zap },
                        { id: "all", label: "Mandatory", desc: "Always verify every order", icon: ShieldCheck },
                        { id: "conditional", label: "Conditional", desc: "Verify based on history", icon: Fingerprint }
                      ].map(mode => (
                        <button 
                          key={mode.id}
                          onClick={() => updateAdvanced("otp", "mode", mode.id)}
                          className={`flex items-start gap-6 p-8 rounded-xl border transition-all text-left group relative overflow-hidden ${
                            advancedSettings.otp?.mode === mode.id 
                            ? "bg-slate-950 text-white border-slate-950 shadow-2xl scale-[1.02]" 
                            : "bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:border-gold/30"
                          }`}
                        >
                          {advancedSettings.otp?.mode === mode.id && (
                             <motion.div layoutId="modeGlow" className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none" />
                          )}
                          <div className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${advancedSettings.otp?.mode === mode.id ? "border-gold bg-gold" : "border-slate-300 dark:border-white/10"}`}>
                            {advancedSettings.otp?.mode === mode.id && <Check size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                               <mode.icon size={16} className={advancedSettings.otp?.mode === mode.id ? "text-gold" : "text-slate-400"} />
                               <p className="text-sm font-black uppercase tracking-tight">{mode.label}</p>
                            </div>
                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${advancedSettings.otp?.mode === mode.id ? "text-slate-400" : "text-slate-400 opacity-60"}`}>{mode.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {advancedSettings.otp?.mode === "conditional" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-gold/5 rounded-xl border border-gold/10 space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Success Trigger (%)</label>
                           <span className="text-xl font-black text-gold">{advancedSettings.otp?.threshold || 50}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={advancedSettings.otp?.threshold || 50}
                          onChange={(e) => updateAdvanced("otp", "threshold", Number(e.target.value))}
                          className="w-full h-2 bg-gold/10 rounded-xl appearance-none cursor-pointer accent-gold"
                        />
                        <p className="text-[9px] text-slate-400 uppercase font-black leading-relaxed">Trigger verification if commercial success rate falls below threshold.</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">SMS Signal Template</label>
                      <div className="relative group">
                        <textarea 
                          rows={5}
                          value={advancedSettings.otp?.template}
                          onChange={(e) => updateAdvanced("otp", "template", e.target.value)}
                          className="w-full px-8 py-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black resize-none shadow-inner outline-none focus:ring-4 focus:ring-gold/10 transition-all leading-relaxed"
                          placeholder="Your code is {otp}..."
                        />
                        <div className="absolute right-6 bottom-6 flex gap-2">
                           {["{otp}", "{expiry}", "{site_name}"].map(tag => (
                             <button key={tag} className="px-3 py-1 bg-white dark:bg-white/10 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/5 hover:text-primary transition-colors">{tag}</button>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">Execution Gateway</label>
                      <div className="relative">
                        <select 
                          value={advancedSettings.otp?.provider_id}
                          onChange={(e) => updateAdvanced("otp", "provider_id", e.target.value)}
                          className="w-full h-16 pl-8 pr-12 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-black outline-none focus:ring-4 focus:ring-gold/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Logic Gateway</option>
                          {integrations.filter(i => i.category === 'sms').map(i => (
                            <option key={i.id} value={i.id}>{i.providerLabel}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
                  <SectionHeader 
                    icon={MousePointer2} 
                    title="Verification Interface UI" 
                    desc="Customize the appearance of the authentication portal"
                    colorClass="bg-indigo-500/10 text-indigo-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { key: "heading", label: "Matrix Title", icon: Type },
                      { key: "subheading", label: "Interface Directives", icon: Info },
                      { key: "button", label: "Execution Trigger", icon: Zap }
                    ].map(f => (
                      <div key={f.key} className="space-y-3 group">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 group-focus-within:text-primary transition-colors">{f.label}</label>
                        <div className="relative">
                           <input type="text" value={advancedSettings.otp?.popup?.[f.key]} onChange={(e) => updateNestedAdvanced("otp", "popup", f.key, e.target.value)} className="w-full h-14 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                           <f.icon size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 3. FACEBOOK CAPI */}
          {activeSubTab === "capi" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-xl blur-[120px]" />
                
                <SectionHeader 
                  icon={Globe} 
                  title="Meta Conversions Protocol" 
                  desc="Synchronize commercial signals directly to Meta servers"
                  colorClass="bg-blue-600/10 text-blue-600"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="flex items-center justify-between p-10 bg-blue-600 text-white rounded-xl shadow-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-xl blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                          <p className="text-xl font-black uppercase tracking-tighter">Meta CAPI Core</p>
                          <p className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">Enhanced server-side signal stream</p>
                        </div>
                        <Switch 
                          checked={advancedSettings.capi?.enabled}
                          onCheckedChange={(v) => updateAdvanced("capi", "enabled", v)}
                          className="data-[state=checked]:bg-white relative z-10"
                        />
                      </div>

                      <div className="p-10 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 space-y-6 shadow-inner group">
                        <div className="flex items-start gap-6">
                          <Switch 
                            checked={advancedSettings.capi?.strict_tracking}
                            onCheckedChange={(v) => updateAdvanced("capi", "strict_tracking", v)}
                          />
                          <div>
                            <p className="text-base font-black uppercase tracking-tighter text-slate-900 dark:text-white">Strict Node Verification</p>
                            <p className="text-[10px] text-slate-400 font-black mt-3 leading-relaxed uppercase tracking-[0.2em] opacity-60">
                              ENABLED: Synchronize only upon transaction confirmation.
                              <br />
                              DISABLED: Synchronize upon initial signal detection.
                            </p>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className={`space-y-8 transition-all duration-700 ${advancedSettings.capi?.enabled ? "opacity-100 translate-x-0" : "opacity-30 pointer-events-none translate-x-4"}`}>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Pixel Identification Node</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={advancedSettings.capi?.pixel_id || ""}
                            onChange={(e) => updateAdvanced("capi", "pixel_id", e.target.value)}
                            className="w-full h-16 px-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black shadow-inner outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                            placeholder="e.g. 1234567890"
                          />
                          <Fingerprint size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Access Token Vector</label>
                        <div className="relative">
                           <textarea 
                            rows={4}
                            value={advancedSettings.capi?.access_token || ""}
                            onChange={(e) => updateAdvanced("capi", "access_token", e.target.value)}
                            className="w-full p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-mono font-bold resize-none shadow-inner outline-none focus:ring-4 focus:ring-blue-600/10 transition-all leading-relaxed"
                            placeholder="EAAG..."
                          />
                          <Key size={18} className="absolute right-8 top-8 text-slate-300 opacity-40" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Experimental Test Code</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={advancedSettings.capi?.test_code || ""}
                            onChange={(e) => updateAdvanced("capi", "test_code", e.target.value)}
                            className="w-full h-16 px-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black shadow-inner outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                            placeholder="TEST12345"
                          />
                          <Code2 size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                      </div>
                   </div>
                </div>
              </section>
            </div>
          )}

          {/* 4. SMS GATEWAYS */}
          {activeSubTab === "sms_gateways" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                  <SectionHeader 
                    icon={MessageSquare} 
                    title="Signal Transmission Gateways" 
                    desc="Configure third-party SMS providers"
                    colorClass="bg-primary/10 text-primary"
                  />
                  <div className="relative group">
                    <button className="px-10 h-16 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 hover:bg-primary transition-all">
                      <Plus size={20} /> Initialize Gateway
                    </button>
                    <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden p-3 border-t-4 border-t-primary">
                       {SMS_PROVIDERS.map(p => (
                          <button 
                            key={p.id} 
                            onClick={() => addIntegration(p.id, "sms")} 
                            className="w-full text-left px-6 py-4 rounded-xl text-[10px] font-black text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all uppercase tracking-widest flex items-center justify-between"
                          >
                            {p.label}
                            <div className="w-2 h-2 rounded-xl bg-slate-100 dark:bg-white/5" />
                          </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                   {integrations.filter(i => i.category === 'sms').map((gateway, idx) => (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={gateway.id} className="p-10 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 space-y-12 shadow-inner group relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-xl bg-white dark:bg-white/10 border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-primary text-3xl shadow-2xl">
                              {gateway.providerId.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                               <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{gateway.providerLabel} Registry</h4>
                               <div className="flex items-center gap-3 mt-1.5">
                                 <div className={`w-2 h-2 rounded-xl ${gateway.isActive ? "bg-primary animate-pulse" : "bg-slate-300"}`} />
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{gateway.isActive ? "Operational" : "Offline"}</p>
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                             <button className="h-14 px-8 bg-white dark:bg-white/5 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all shadow-xl border border-slate-100 dark:border-white/10">Test Pulse</button>
                             <button onClick={() => removeIntegration(gateway.id)} className="w-14 h-14 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-xl border border-rose-500/20"><Trash2 size={22} /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                           <div className="space-y-3 group">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 group-focus-within:text-primary transition-colors">Authorization Key</label>
                              <div className="relative">
                                <input type="password" value={gateway.config?.api_key || ""} onChange={(e) => updateConfig(gateway.id, "api_key", e.target.value)} className="w-full h-16 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                <Key size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                              </div>
                           </div>
                           <div className="space-y-3 group">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 group-focus-within:text-primary transition-colors">Sender Mask Identity</label>
                              <div className="relative">
                                <input type="text" value={gateway.config?.sender_id || ""} onChange={(e) => updateConfig(gateway.id, "sender_id", e.target.value)} className="w-full h-16 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                <Send size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Code Size</label>
                                <input type="number" value={gateway.config?.otp_length || 4} onChange={(e) => updateConfig(gateway.id, "otp_length", Number(e.target.value))} className="w-full h-16 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Expiry Node</label>
                                <input type="number" value={gateway.config?.otp_expiry || 5} onChange={(e) => updateConfig(gateway.id, "otp_expiry", Number(e.target.value))} className="w-full h-16 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}

                   {integrations.filter(i => i.category === 'sms').length === 0 && (
                     <div className="py-32 bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center gap-6 opacity-40">
                        <MessageSquare size={64} className="animate-pulse text-slate-300" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">No Transmission Nodes Configured</p>
                     </div>
                   )}
                </div>
              </section>
            </div>
          )}

          {/* 5. FIREBASE CONFIG */}
          {activeSubTab === "firebase" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-xl blur-[120px]" />
                
                <SectionHeader 
                  icon={Database} 
                  title="Firebase Infrastructure" 
                  desc="SDK keys for analytics and persistent storage"
                  colorClass="bg-gold/10 text-gold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-4">
                   {[
                     { id: "api_key", label: "Kernel API Key", mono: true, icon: Key },
                     { id: "auth_domain", label: "Authentication Domain", mono: false, icon: Globe },
                     { id: "project_id", label: "Project Identifier", mono: false, icon: Code2 },
                     { id: "storage_bucket", label: "Storage Reservoir", mono: false, icon: Database },
                     { id: "messaging_sender_id", label: "Signaling Node ID", mono: true, icon: MessageSquare },
                     { id: "app_id", label: "Application ID", mono: true, icon: Smartphone }
                   ].map(field => (
                     <div key={field.id} className="space-y-3 group">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 group-focus-within:text-primary transition-colors">{field.label}</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={advancedSettings.firebase?.[field.id] || ""}
                            onChange={(e) => updateAdvanced("firebase", field.id, e.target.value)}
                            className={`w-full h-16 px-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-black shadow-inner outline-none focus:ring-4 focus:ring-gold/10 transition-all ${field.mono ? "font-mono tracking-tighter" : ""}`}
                          />
                          <field.icon size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                        </div>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

          {/* 6. ABANDONED CARTS */}
          {activeSubTab === "recovery" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 rounded-xl blur-[120px]" />
                
                <SectionHeader 
                  icon={Flame} 
                  title="Cart Recovery Automation" 
                  desc="Automatic remarketing signals for incomplete nodes"
                  colorClass="bg-rose-600/10 text-rose-600"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="flex items-center justify-between p-10 bg-rose-600 text-white rounded-xl shadow-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-xl blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                          <p className="text-xl font-black uppercase tracking-tighter">Recovery Engine</p>
                          <p className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">Automated Remarketing Logic</p>
                        </div>
                        <Switch 
                          checked={advancedSettings.recovery?.enabled}
                          onCheckedChange={(v) => updateAdvanced("recovery", "enabled", v)}
                          className="data-[state=checked]:bg-white relative z-10"
                        />
                      </div>

                      <div className={`space-y-8 transition-all duration-700 ${advancedSettings.recovery?.enabled ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-4"}`}>
                         <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6 group-focus-within:text-rose-500 transition-colors">Signal Gateway Provider</label>
                            <div className="relative">
                              <select 
                                value={advancedSettings.recovery?.provider_id}
                                onChange={(e) => updateAdvanced("recovery", "provider_id", e.target.value)}
                                className="w-full h-16 pl-8 pr-12 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-black outline-none focus:ring-4 focus:ring-rose-600/10 transition-all appearance-none cursor-pointer"
                              >
                                <option value="">Select Logic Gateway</option>
                                {integrations.filter(i => i.category === 'sms').map(i => (
                                  <option key={i.id} value={i.id}>{i.providerLabel}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={18} />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3 group">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-6 group-focus-within:text-rose-500 transition-colors">Initial Impulse (Min)</label>
                               <div className="relative">
                                  <input type="number" value={advancedSettings.recovery?.first_delay} onChange={(e) => updateAdvanced("recovery", "first_delay", Number(e.target.value))} className="w-full h-16 px-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black shadow-inner outline-none focus:ring-4 focus:ring-rose-600/10 transition-all" />
                                  <Clock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                               </div>
                            </div>
                            <div className="space-y-3 group">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-6 group-focus-within:text-rose-500 transition-colors">Secondary Pulse (Hrs)</label>
                               <div className="relative">
                                  <input type="number" value={advancedSettings.recovery?.second_delay} onChange={(e) => updateAdvanced("recovery", "second_delay", Number(e.target.value))} className="w-full h-16 px-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black shadow-inner outline-none focus:ring-4 focus:ring-rose-600/10 transition-all" />
                                  <Bell size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-40" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className={`space-y-10 transition-all duration-700 ${advancedSettings.recovery?.enabled ? "opacity-100 translate-x-0" : "opacity-30 pointer-events-none translate-x-6"}`}>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Initial Signal Payload</label>
                         <textarea rows={4} value={advancedSettings.recovery?.first_template} onChange={(e) => updateAdvanced("recovery", "first_template", e.target.value)} className="w-full p-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black resize-none shadow-inner outline-none focus:ring-4 focus:ring-rose-600/10 transition-all leading-relaxed" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Secondary Signal Payload</label>
                         <textarea rows={4} value={advancedSettings.recovery?.second_template} onChange={(e) => updateAdvanced("recovery", "second_template", e.target.value)} className="w-full p-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 rounded-xl text-sm font-black resize-none shadow-inner outline-none focus:ring-4 focus:ring-rose-600/10 transition-all leading-relaxed" />
                      </div>
                      <div className="flex flex-wrap gap-3 px-4">
                        {["{customer_name}", "{site_name}", "{checkout_url}"].map(tag => (
                          <span key={tag} className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border border-slate-200 dark:border-white/5">{tag}</span>
                        ))}
                      </div>
                   </div>
                </div>
              </section>
            </div>
          )}

          {/* 7. COUPONS */}
          {activeSubTab === "coupons" && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <SectionHeader icon={Ticket} title="Commercial Incentives" desc="Manage discount vouchers and commercial codes" colorClass="bg-purple-500/10 text-purple-500" />
                 <button onClick={async () => {
                   const code = prompt("Enter incentive code:");
                   if (!code) return;
                   const value = prompt("Enter discount magnitude:");
                   const type = confirm("Percentage discount? (Cancel for Fixed Settlement)") ? "percentage" : "fixed";
                   await supabase.from("coupons").insert({ 
                     code: code.toUpperCase(), 
                     discount_amount: Number(value), 
                     discount_type: type,
                     is_active: true,
                     min_order_amount: 500
                   });
                   onRefresh();
                 }} className="px-12 h-16 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-primary transition-all">
                   + Create Incentive
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                {coupons.map(c => (
                  <div key={c.id} className="p-10 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl space-y-8 group shadow-sm hover:border-primary/20 transition-all relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-xl blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:bg-primary/10 transition-colors">
                        <Zap size={28} className="text-primary" />
                      </div>
                      <button onClick={async () => {
                        if (confirm("Terminate this incentive node?")) {
                          await supabase.from("coupons").delete().eq("id", c.id);
                          onRefresh();
                        }
                      }} className="w-12 h-12 flex items-center justify-center bg-rose-500/5 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-xl"><Trash2 size={20} /></button>
                    </div>
                    <div className="relative z-10">
                      <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{c.code}</p>
                      <p className="text-[11px] text-primary font-black uppercase mt-2 tracking-[0.3em] animate-pulse">{c.discount_type === 'percentage' ? `${c.discount_amount}% DEPLETION` : `৳${c.discount_amount} SETTLEMENT`}</p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60 relative z-10">
                      <span className="flex items-center gap-2"><Database size={12} /> Min Value: ৳{c.min_order_amount}</span>
                      <span className={c.is_active ? "text-primary" : "text-rose-500"}>{c.is_active ? "ACTIVE" : "VOID"}</span>
                    </div>
                  </div>
                ))}
              </div>
              {coupons.length === 0 && (
                <div className="py-40 bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center gap-6 opacity-30">
                   <Ticket size={80} className="text-slate-300" />
                   <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em]">No Commercial Incentives Active</p>
                </div>
              )}
            </div>
          )}

          {/* 8. SECURITY */}
          {activeSubTab === "security" && (
            <div className="space-y-10">
              <section className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 dark:bg-white/5 rounded-xl blur-[120px]" />
                
                <SectionHeader icon={Lock} title="Blacklist Registry Protocol" desc="Terminate malicious commercial signal vectors" colorClass="bg-slate-950 text-white dark:bg-white dark:text-slate-900" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Blocked Network Vectors (IP)</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40">Permanent access denial</p>
                      </div>
                      <button onClick={async () => {
                        const ip = prompt("Identify Network Node (IP) for termination:");
                        if (ip) {
                          await supabase.from("blocked_ips").insert({ ip_address: ip });
                          onRefresh();
                        }
                      }} className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"><Plus size={20} /></button>
                    </div>
                    <div className="space-y-4">
                      {blockedData.ips.map(ip => (
                        <div key={ip.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 group shadow-inner">
                          <div className="flex items-center gap-4">
                            <Globe size={16} className="text-slate-400" />
                            <p className="text-xs font-mono font-bold">{ip.ip_address}</p>
                          </div>
                          <button onClick={async () => {
                            await supabase.from("blocked_ips").delete().eq("id", ip.id);
                            onRefresh();
                          }} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Blocked Signal Vectors (Phone)</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40">Communication blackout</p>
                      </div>
                      <button onClick={async () => {
                        const phone = prompt("Identify Signal Node (Phone) for termination:");
                        if (phone) {
                          await supabase.from("blocked_numbers").insert({ phone });
                          onRefresh();
                        }
                      }} className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"><Plus size={20} /></button>
                    </div>
                    <div className="space-y-4">
                      {blockedData.numbers.map(num => (
                        <div key={num.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 group shadow-inner">
                          <div className="flex items-center gap-4">
                            <Smartphone size={16} className="text-slate-400" />
                            <p className="text-xs font-mono font-bold">{num.phone}</p>
                          </div>
                          <button onClick={async () => {
                            await supabase.from("blocked_numbers").delete().eq("id", num.id);
                            onRefresh();
                          }} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
