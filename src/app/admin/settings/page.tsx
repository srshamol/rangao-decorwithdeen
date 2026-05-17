"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, Globe, Layout, ShieldAlert, Smartphone,
  MessageSquare, Truck, BarChart3, Database, Megaphone,
  Zap, Save, Loader2, AlertTriangle, Check, X,
  ChevronRight, Flame, Info, Bell, Menu, Palette, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { AdminSettings as AdminSettingsType, OrderNotifications, LowStockAlerts, CustomerNotification } from "@/types/admin";

// Settings sub-components
import { OrderControlSettings } from "@/components/admin/settings/OrderControlSettings";
import { CourierSettings } from "@/components/admin/settings/CourierSettings";
import { MarketingSettings } from "@/components/admin/settings/MarketingSettings";
import { AutomationSettings } from "@/components/admin/settings/AutomationSettings";
import { FacebookCAPISettings } from "@/components/admin/settings/FacebookCAPISettings";
import { NotificationSettings } from "@/components/admin/settings/NotificationSettings";
import { OTPSettings } from "@/components/admin/settings/OTPSettings";
import { SMSGatewaySettings } from "@/components/admin/settings/SMSGatewaySettings";
import { FirebaseSettings } from "@/components/admin/settings/FirebaseSettings";
import { APISettings } from "@/components/admin/settings/APISettings";

const getSettingsTabs = (t: (key: string) => string) => [
  { id: "operations", label: t("ops_logistics") || "Operations & Logistics", icon: Truck, desc: t("ops_desc") || "Orders, Shipping, Fraud", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { id: "growth", label: t("growth_marketing") || "Growth & Marketing", icon: Megaphone, desc: t("growth_desc") || "Campaigns, CAPI, Recovery", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
  { id: "infrastructure", label: t("tech_infra") || "Technical Infrastructure", icon: Database, desc: t("infra_desc") || "OTP, Firebase, Security", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
];

interface AdvancedSettingsData {
  order: any;
  otp: {
    otp_mode: string;
    otp_threshold: number;
    template: string;
    popup: { heading: string; subheading: string; button: string };
    [key: string]: any;
  };
  capi: { enabled: boolean; strict_tracking: boolean; pixel_id: string; access_token: string; test_code: string };
  firebase: any;
  recovery: {
    enabled: boolean;
    first_delay: number;
    second_delay: number;
    first_template: string;
    second_template: string;
  };
}

export default function AdminSettings() {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const SETTINGS_TABS = getSettingsTabs(t);
  const [activeTab, setActiveTab] = useState<string>("operations");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialDataRef = useRef<string>("");

  // State for all settings
  const [integrations, setIntegrations] = useState<any[]>([]); // Keep any[] for generic integrations for now, but better than implicit any
  const [courierSettings, setCourierSettings] = useState<{
    steadfast_key: string;
    steadfast_secret: string;
    steadfast_is_sandbox: boolean;
    steadfast_base_url: string;
    default_courier: string;
    couriers: any[];
  }>({
    steadfast_key: "", steadfast_secret: "", steadfast_is_sandbox: false,
    steadfast_base_url: "", default_courier: "steadfast",
    couriers: []
  });
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsData>({
    order: {},
    otp: {
      otp_mode: "disabled", otp_threshold: 50,
      template: "আপনার OTP কোড: {otp}। {expiry} মিনিট কার্যকর। - {site_name}",
      popup: { heading: "নম্বর যাচাই করুন", subheading: "আপনার ফোনে ৬-ডিজিটের কোড পাঠানো হয়েছে", button: "যাচাই করুন ও অর্ডার দিন" }
    },
    capi: { enabled: false, strict_tracking: true, pixel_id: "", access_token: "", test_code: "" },
    firebase: {},
    recovery: {
      enabled: false, first_delay: 30, second_delay: 24,
      first_template: "হ্যালো {customer_name}, আপনি কার্টে পণ্য রেখেছেন। অর্ডার সম্পন্ন করুন: {checkout_url}",
      second_template: "এখনও আগ্রহী? SAVE10 কোড ব্যবহার করুন। আপনার কার্ট: {checkout_url}"
    }
  });
  const [marketingData, setMarketingData] = useState<{
    campaigns: any[];
    templates: { id: string; name: string; type: string; message: string }[];
    audiences: any[];
  }>({
    campaigns: [],
    templates: [
      { id: "t1", name: "স্বাগতম SMS", type: "sms", message: "আসসালামু আলাইকুম {customer_name}! রাঙাও তে স্বাগতম 🌟 আমাদের সেরা ইসলামিক ডেকোর কালেকশন দেখুন: {checkout_url}" },
      { id: "t2", name: "অফার SMS", type: "sms", message: "{customer_name}, রাঙাও তে বিশেষ ছাড়! {discount_code} কোড ব্যবহার করে {product_name} এ বিশেষ ডিসকাউন্ট পান 🎁 {checkout_url}" },
      { id: "t3", name: "WhatsApp প্রোমো", type: "whatsapp", message: "আসসালামু আলাইকুম {customer_name}! 🌙\n\nরাঙাও এর নতুন কালেকশন এসেছে!\n\n✨ {product_name}\n💰 বিশেষ মূল্যে পেতে: {checkout_url}\n\nকোড: {discount_code}" }
    ],
    audiences: []
  });
  const [notificationSettings, setNotificationSettings] = useState<{
    order_notifications: OrderNotifications;
    low_stock_alerts: LowStockAlerts;
    customer_notifications: Record<string, CustomerNotification>;
  }>({
    order_notifications: { enabled: true, admin_emails: [], admin_phones: [], channels: ['email'] },
    low_stock_alerts: { enabled: true, threshold: 5 },
    customer_notifications: {
      order_placed: { sms: true, email: true, template: "আসসালামু আলাইকুম {customer_name}! আপনার অর্ডার #{order_id} গ্রহণ করা হয়েছে। অর্ডারটি কনফার্ম করতে আমরা কল করবো। ধন্যবাদ।" },
      order_confirmed: { sms: true, email: false, template: "অভিনন্দন {customer_name}! আপনার অর্ডার #{order_id} কনফার্ম করা হয়েছে। শীঘ্রই এটি শিপড হবে।" },
      order_shipped: { sms: true, email: false, template: "সুসংবাদ {customer_name}! আপনার অর্ডার #{order_id} শিপড হয়েছে। ট্র্যাকিং আইডি: {tracking_id}। বিস্তারিত: {checkout_url}" },
      out_for_delivery: { sms: true, email: false, template: "হ্যালো {customer_name}, আপনার অর্ডার #{order_id} আজ ডেলিভারি হতে পারে। রাইডার আপনাকে কল করবে।" },
      order_delivered: { sms: true, email: true, template: "আপনার অর্ডার #{order_id} ডেলিভারি করা হয়েছে। ধন্যবাদ!" },
      order_cancelled: { sms: true, email: true, template: "দুঃখিত, আপনার অর্ডার #{order_id} বাতিল করা হয়েছে।" },
      order_returned: { sms: true, email: true, template: "আমরা আপনার রিটার্ন করা অর্ডার #{order_id} পেয়েছি।" }
    }
  });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [blockedData, setBlockedData] = useState({ ips: [], numbers: [] });
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>({
    operations: "logic",
    growth: "marketing",
    infrastructure: "otp"
  });

  // Get current state snapshot for change detection
  const getStateSnapshot = useCallback(() => {
    return JSON.stringify({ 
      courierSettings, advancedSettings, notificationSettings, 
      marketingData 
    });
  }, [courierSettings, advancedSettings, notificationSettings, marketingData]);

  // Detect unsaved changes
  useEffect(() => {
    if (!loading && initialDataRef.current) {
      const current = getStateSnapshot();
      setHasUnsavedChanges(current !== initialDataRef.current);
    }
  }, [getStateSnapshot, loading]);

  // Warn on page leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const [role, setRole] = useState<string>('production');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email === 'rangao.bd@gmail.com') {
          setRole('super_admin');
        } else {
          const { data: rData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
          if (rData) setRole(rData.role);
        }
      }

      const [configsRes] = await Promise.all([
        supabase.from("store_configs").select("*"),
      ]);

      if (configsRes.data) {
        const deepMerge = (target: any, source: any) => {
          if (!source) return target;
          const output = { ...target };
          Object.keys(source).forEach(key => {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              output[key] = deepMerge(target[key] || {}, source[key]);
            } else {
              output[key] = source[key];
            }
          });
          return output;
        };

        configsRes.data.forEach((item: any) => {
          if (item.id === "integrations") setIntegrations((item.value as any[]) || []);
          if (item.id === "courier_settings") setCourierSettings(prev => deepMerge(prev, item.value));
          if (item.id === "advanced_settings") setAdvancedSettings(prev => deepMerge(prev, item.value));
          if (item.id === "marketing_data") setMarketingData(prev => deepMerge(prev, item.value));
          if (item.id === "notification_settings") setNotificationSettings(prev => deepMerge(prev, item.value));
        });
      }

      // Fetch Blacklist Data
      const { data: bIps } = await supabase.from("blocked_ips").select("*");
      const { data: bNumbers } = await supabase.from("blocked_numbers").select("*");
      const { data: cData } = await supabase.from("coupons").select("*");

      if (bIps || bNumbers) setBlockedData({ ips: bIps || [], numbers: bNumbers || [] });
      if (cData) setCoupons(cData);

      // Set initial snapshot after data loads
      setTimeout(() => {
        initialDataRef.current = JSON.stringify({
          integrations, 
          courierSettings, advancedSettings, notificationSettings, 
          marketingData
        });
      }, 150);
    } catch (err) {
      toast.error(t("settings_load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading(t("saving_changes"));
    try {
      const updates = [
        supabase.from("store_configs").upsert({ id: "integrations", value: integrations }),
        supabase.from("store_configs").upsert({ id: "courier_settings", value: courierSettings }),
        supabase.from("store_configs").upsert({ id: "advanced_settings", value: advancedSettings }),
        supabase.from("store_configs").upsert({ id: "marketing_data", value: marketingData }),
        supabase.from("store_configs").upsert({ id: "notification_settings", value: notificationSettings }),
      ];

      await Promise.all(updates);
      toast.success(t("settings_save_success"), { id: toastId });
      initialDataRef.current = getStateSnapshot();
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(t("settings_save_failed"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const currentData = JSON.stringify({
      advanced: advancedSettings.order,
      otp: advancedSettings.otp,
      capi: advancedSettings.capi,
      firebase: advancedSettings.firebase,
      recovery: advancedSettings.recovery,
      courier: courierSettings,
      marketing: marketingData,
      notifications: notificationSettings,
      integrations: integrations
    });
    setHasUnsavedChanges(currentData !== initialDataRef.current);
  }, [advancedSettings, courierSettings, marketingData, notificationSettings, integrations]);

  const activeTabData = SETTINGS_TABS.find(t => t.id === activeTab);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-xl animate-spin" />
          <Settings className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={24} />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Initializing Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 selection:bg-primary/20">
      
      {/* Header Banner - Standard Admin Style */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold">{isBn ? "সেটিংস স্টুডিও" : "Settings Studio"}</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-xl text-xs font-medium uppercase">
                <Zap size={12} className="text-white animate-pulse" />
                System v4.2
              </div>
            </div>
            <p className="text-xs text-white/60">{isBn ? "আপনার স্টোরের অপারেশন এবং ইনফ্রাস্ট্রাকচার ম্যানেজ করুন" : "Manage store operations, technical infrastructure, and security protocols"}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="h-10 px-4 bg-white/10 rounded-xl flex items-center gap-2 border border-white/5 shadow-inner">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">System Ready</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Simplified Sidebar */}
        <nav className="sticky top-24 space-y-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                }`}>
                  <tab.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                   <span className="text-xs font-bold block">
                     {tab.label}
                   </span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/60" />}
              </button>
            );
          })}
        </nav>

        {/* Simplified Content Area */}
        <div className="min-h-[600px] animate-in fade-in duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
               {activeTabData && <activeTabData.icon size={24} />}
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                 {activeTabData?.label}
               </h2>
               <p className="text-xs text-slate-500 font-medium mt-2">{activeTabData?.desc}</p>
            </div>
          </div>

          {/* Animated Module Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-10"
            >
              {activeTab === "operations" && (
                <div className="space-y-6">
                  <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 w-fit shadow-inner">
                    {[
                      { id: "logic", label: "Checkout Logic", icon: Zap },
                      { id: "courier", label: "Logistics Hub", icon: Truck }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubTabs({ ...activeSubTabs, operations: sub.id })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                          activeSubTabs.operations === sub.id 
                          ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <sub.icon size={14} />
                        {sub.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="animate-in fade-in duration-300">
                    {activeSubTabs.operations === "logic" && (
                      <OrderControlSettings
                        settings={advancedSettings.order || {}}
                        onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, order: { ...advancedSettings.order, ...data } })}
                      />
                    )}
                    {activeSubTabs.operations === "courier" && (
                      <CourierSettings
                        settings={courierSettings}
                        onUpdate={(newSettings: any) => setCourierSettings(newSettings)}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "growth" && (
                <div className="space-y-6">
                  <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 w-fit shadow-inner overflow-x-auto no-scrollbar">
                    {[
                      { id: "marketing", label: "Marketing", icon: Megaphone },
                      { id: "capi", label: "F-CAPI", icon: BarChart3 },
                      { id: "recovery", label: "Recovery", icon: RefreshCw },
                      { id: "notifications", label: "Alerts", icon: Bell }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubTabs({ ...activeSubTabs, growth: sub.id })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                          activeSubTabs.growth === sub.id 
                          ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <sub.icon size={14} />
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  <div className="animate-in fade-in duration-300">
                    {activeSubTabs.growth === "marketing" && (
                      <MarketingSettings
                        data={marketingData}
                        integrations={integrations}
                        onUpdate={(data: any) => setMarketingData({ ...marketingData, ...data })}
                      />
                    )}
                    {activeSubTabs.growth === "capi" && (
                      <FacebookCAPISettings
                        settings={advancedSettings.capi || {}}
                        onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, capi: { ...advancedSettings.capi, ...data } })}
                      />
                    )}
                    {activeSubTabs.growth === "recovery" && (
                      <AutomationSettings
                        settings={advancedSettings.recovery || {}}
                        integrations={integrations}
                        onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, recovery: { ...advancedSettings.recovery, ...data } })}
                      />
                    )}
                    {activeSubTabs.growth === "notifications" && (
                      <NotificationSettings
                        settings={notificationSettings}
                        onUpdate={(data: any) => setNotificationSettings({ ...notificationSettings, ...data })}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "infrastructure" && (
                <div className="space-y-6">
                  <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 w-fit shadow-inner overflow-x-auto no-scrollbar">
                    {[
                      { id: "otp", label: "OTP Portal", icon: Smartphone },
                      { id: "sms", label: "SMS Hub", icon: MessageSquare },
                      { id: "firebase", label: "Firebase", icon: Database },
                      { id: "security", label: "Security", icon: ShieldAlert }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubTabs({ ...activeSubTabs, infrastructure: sub.id })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                          activeSubTabs.infrastructure === sub.id 
                          ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <sub.icon size={14} />
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  <div className="animate-in fade-in duration-300">
                    {activeSubTabs.infrastructure === "otp" && (
                      <OTPSettings
                        settings={advancedSettings.otp || {}}
                        integrations={integrations}
                        onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, otp: { ...advancedSettings.otp, ...data } })}
                        onUpdateIntegrations={(val: any[]) => setIntegrations(val)}
                      />
                    )}
                    {activeSubTabs.infrastructure === "sms" && (
                      <SMSGatewaySettings
                        integrations={integrations}
                        onUpdate={(val: any[]) => setIntegrations(val)}
                      />
                    )}
                    {activeSubTabs.infrastructure === "firebase" && (
                      <FirebaseSettings
                        settings={advancedSettings.firebase || {}}
                        onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, firebase: { ...advancedSettings.firebase, ...data } })}
                      />
                    )}
                    {activeSubTabs.infrastructure === "security" && (
                      <APISettings
                        integrations={integrations}
                        coupons={coupons}
                        blockedData={blockedData}
                        advancedSettings={advancedSettings}
                        onUpdateIntegrations={(data) => setIntegrations(data)}
                        onUpdateAdvanced={(data) => setAdvancedSettings(data)}
                        onRefresh={fetchSettings}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Publication Bar - High Contrast Elite */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 flex items-center justify-between gap-12 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] border border-white/10 dark:border-slate-200 min-w-[600px]"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center">
                <Flame size={20} className="text-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[13px] font-black uppercase tracking-tight">
                  {isBn ? "অপ্রকাশিত পরিবর্তন" : "Staging: Unsaved Config"}
                </p>
                <p className="text-[10px] opacity-60 font-medium uppercase tracking-[0.1em]">
                  {isBn ? "সেভ না করলে পরিবর্তনগুলো কার্যকর হবে না" : "Configuration changes are staged but not active"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => { fetchSettings(); setHasUnsavedChanges(false); }}
                className="h-12 px-6 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 dark:hover:bg-slate-100 rounded-xl transition-all"
              >
                {t("discard")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 px-10 bg-emerald-600 dark:bg-emerald-50 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {t("save_changes")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
