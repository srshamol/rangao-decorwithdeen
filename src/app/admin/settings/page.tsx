"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, Globe, Layout, ShieldAlert, Smartphone,
  MessageSquare, Truck, BarChart3, Database, Megaphone,
  Zap, Save, Loader2, AlertTriangle, Check, X,
  ChevronRight, Flame, Info, Bell, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

// Settings sub-components
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { HomepageSettings } from "@/components/admin/settings/HomepageSettings";
import { OrderControlSettings } from "@/components/admin/settings/OrderControlSettings";
import { OTPSettings } from "@/components/admin/settings/OTPSettings";
import { SMSGatewaySettings } from "@/components/admin/settings/SMSGatewaySettings";
import { CourierSettings } from "@/components/admin/settings/CourierSettings";
import { FacebookCAPISettings } from "@/components/admin/settings/FacebookCAPISettings";
import { FirebaseSettings } from "@/components/admin/settings/FirebaseSettings";
import { MarketingSettings } from "@/components/admin/settings/MarketingSettings";
import { AutomationSettings } from "@/components/admin/settings/AutomationSettings";
import { NotificationSettings } from "@/components/admin/settings/NotificationSettings";
import { NavigationSettings } from "@/components/admin/settings/NavigationSettings";

const getSettingsTabs = (t: any) => [
  { id: "general", label: t("general"), icon: Globe, desc: t("company_info"), color: "text-primary", bg: "bg-emerald-50 dark:bg-primary/10" },
  { id: "homepage", label: t("homepage"), icon: Layout, desc: t("frontend_control"), color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: "order_control", label: t("order_control"), icon: ShieldAlert, desc: t("anti_fraud"), color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
  { id: "otp", label: t("otp_sms"), icon: Smartphone, desc: t("verification"), color: "text-gold", bg: "bg-amber-50 dark:bg-gold/10" },
  { id: "courier", label: t("courier"), icon: Truck, desc: t("logistics"), color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { id: "capi", label: t("facebook_capi"), icon: BarChart3, desc: t("tracking"), color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: "firebase", label: t("firebase"), icon: Database, desc: t("infrastructure"), color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
  { id: "marketing", label: t("marketing"), icon: Megaphone, desc: t("growth_engine"), color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", badge: "NEW" },
  { id: "automation", label: t("automation"), icon: Flame, desc: t("cart_recovery"), color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-500/10" },
  { id: "notifications", label: t("notifications"), icon: Bell, desc: t("alert_settings"), color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10" },
  { id: "navigation", label: t("navigation"), icon: Menu, desc: t("header_menu_control"), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
];

export default function AdminSettings() {
  const { t } = useLanguage();
  const SETTINGS_TABS = getSettingsTabs(t);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialDataRef = useRef<string>("");

  // State for all settings
  const [generalSettings, setGeneralSettings] = useState<any>({});
  const [designSettings, setDesignSettings] = useState<any>({
    hero_slides: [], home_banners: [], home_cta: {}, trust_badges: [],
    show_categories: true, show_featured: true, show_combo: true,
    show_logo: true, show_name: true, show_tagline: true,
    featured_product_ids: [], combo_product_ids: [], selected_categories: [],
    hero_text: {}, categories_text: {}, featured_text: {}, why_choose_text: {},
    combo_text: {}, gallery_text: {}, reviews_text: {}, quote_text: {}, cta_text: {}
  });
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [courierSettings, setCourierSettings] = useState<any>({
    steadfast_key: "", steadfast_secret: "", steadfast_is_sandbox: false,
    steadfast_base_url: "", default_courier: "steadfast",
    couriers: []
  });
  const [advancedSettings, setAdvancedSettings] = useState<any>({
    order: {},
    otp: {
      mode: "disabled", threshold: 50,
      template: "আপনার OTP কোড: {otp}। {expiry} মিনিট কার্যকর। - {site_name}",
      popup: { heading: "নম্বর যাচাই করুন", subheading: "আপনার ফোনে ৪-ডিজিটের কোড পাঠানো হয়েছে", button: "যাচাই করুন ও অর্ডার দিন" }
    },
    capi: { enabled: false, strict_tracking: true, pixel_id: "", access_token: "", test_code: "" },
    firebase: {},
    recovery: {
      enabled: false, first_delay: 30, second_delay: 24,
      first_template: "হ্যালো {customer_name}, আপনি কার্টে পণ্য রেখেছেন। অর্ডার সম্পন্ন করুন: {checkout_url}",
      second_template: "এখনও আগ্রহী? SAVE10 কোড ব্যবহার করুন। আপনার কার্ট: {checkout_url}"
    }
  });
  const [marketingData, setMarketingData] = useState<any>({
    campaigns: [],
    templates: [
      { id: "t1", name: "স্বাগতম SMS", type: "sms", message: "আসসালামু আলাইকুম {customer_name}! রাঙাও তে স্বাগতম 🌟 আমাদের সেরা ইসলামিক ডেকোর কালেকশন দেখুন: {checkout_url}" },
      { id: "t2", name: "অফার SMS", type: "sms", message: "{customer_name}, রাঙাও তে বিশেষ ছাড়! {discount_code} কোড ব্যবহার করে {product_name} এ বিশেষ ডিসকাউন্ট পান 🎁 {checkout_url}" },
      { id: "t3", name: "WhatsApp প্রোমো", type: "whatsapp", message: "আসসালামু আলাইকুম {customer_name}! 🌙\n\nরাঙাও এর নতুন কালেকশন এসেছে!\n\n✨ {product_name}\n💰 বিশেষ মূল্যে পেতে: {checkout_url}\n\nকোড: {discount_code}" }
    ],
    audiences: []
  });
  const [notificationSettings, setNotificationSettings] = useState<any>({
    order_notifications: { enabled: true, admin_emails: [], admin_phones: [], channels: ["email", "sms"] },
    low_stock_alerts: { enabled: true, threshold: 5 },
    customer_notifications: {
      order_placed: { sms: true, email: true, template: "আসসালামু আলাইকুম {customer_name}! আপনার অর্ডার #{order_id} গ্রহণ করা হয়েছে। অর্ডারটি কনফার্ম করতে আমরা কল করবো। ধন্যবাদ।" },
      order_confirmed: { sms: true, email: false, template: "অভিনন্দন {customer_name}! আপনার অর্ডার #{order_id} কনফার্ম করা হয়েছে। শীঘ্রই এটি শিপড হবে।" },
      order_shipped: { sms: true, email: false, template: "সুসংবাদ {customer_name}! আপনার অর্ডার #{order_id} শিপড হয়েছে। ট্র্যাকিং আইডি: {tracking_id}। বিস্তারিত: {checkout_url}" },
      out_for_delivery: { sms: true, email: false, template: "হ্যালো {customer_name}, আপনার অর্ডার #{order_id} আজ ডেলিভারি হতে পারে। রাইডার আপনাকে কল করবে।" },
      order_delivered: { sms: true, email: false, template: "আলহামদুলিল্লাহ! আপনার অর্ডার #{order_id} সফলভাবে ডেলিভারি হয়েছে। রাঙাও এর সাথে থাকার জন্য ধন্যবাদ।" },
      order_cancelled: { sms: true, email: false, template: "দুঃখিত, আপনার অর্ডার #{order_id} বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের কল করুন।" }
    }
  });
  const [navigationSettings, setNavigationSettings] = useState<any>({
    header_links: [],
    show_categories: true,
    promo_badge: { text_bn: "", text_en: "", href: "", enabled: false }
  });

  // Get current state snapshot for change detection
  const getStateSnapshot = useCallback(() => {
    return JSON.stringify({ generalSettings, designSettings, integrations, courierSettings, advancedSettings, notificationSettings, navigationSettings, marketingData });
  }, [generalSettings, designSettings, integrations, courierSettings, advancedSettings, notificationSettings, navigationSettings, marketingData]);

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
        const design: any = { ...designSettings };
        configsRes.data.forEach((item: any) => {
          if (item.id === "general_settings") setGeneralSettings((item.value as any) || {});
          if (item.id === "hero_slides") design.hero_slides = (item.value as any) || [];
          if (item.id === "home_banners") design.home_banners = (item.value as any) || [];
          if (item.id === "home_cta") design.home_cta = (item.value as any) || {};
          if (item.id === "trust_badges") design.trust_badges = (item.value as any) || [];
          if (item.id === "homepage_config") Object.assign(design, (item.value as any) || {});
          if (item.id === "integrations") setIntegrations((item.value as any) || []);
          if (item.id === "courier_settings") setCourierSettings((prev: any) => ({ ...prev, ...((item.value as any) || {}) }));
          if (item.id === "advanced_settings") setAdvancedSettings((prev: any) => ({ ...prev, ...((item.value as any) || {}) }));
          if (item.id === "marketing_data") setMarketingData((prev: any) => ({ ...prev, ...((item.value as any) || {}) }));
          if (item.id === "notification_settings") setNotificationSettings((item.value as any) || {});
          if (item.id === "navigation_settings") setNavigationSettings((item.value as any) || { header_links: [], show_categories: true, promo_badge: { text_bn: "", text_en: "", href: "", enabled: false } });
        });
        setDesignSettings(design);
      }

      // Set initial snapshot after data loads
      setTimeout(() => {
        initialDataRef.current = JSON.stringify({
          generalSettings, designSettings, integrations, courierSettings, advancedSettings, notificationSettings, navigationSettings, marketingData
        });
      }, 100);
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
        supabase.from("store_configs").upsert({ id: "general_settings", value: generalSettings }),
        supabase.from("store_configs").upsert({ id: "hero_slides", value: designSettings.hero_slides }),
        supabase.from("store_configs").upsert({ id: "home_banners", value: designSettings.home_banners }),
        supabase.from("store_configs").upsert({ id: "home_cta", value: designSettings.home_cta }),
        supabase.from("store_configs").upsert({ id: "trust_badges", value: designSettings.trust_badges }),
        supabase.from("store_configs").upsert({ id: "homepage_config", value: {
          show_categories: designSettings.show_categories,
          show_featured: designSettings.show_featured,
          show_combo: designSettings.show_combo,
          show_logo: designSettings.show_logo,
          show_name: designSettings.show_name,
          show_tagline: designSettings.show_tagline,
          featured_product_ids: designSettings.featured_product_ids,
          combo_product_ids: designSettings.combo_product_ids,
          selected_categories: designSettings.selected_categories,
          hero_text: designSettings.hero_text,
          categories_text: designSettings.categories_text,
          featured_text: designSettings.featured_text,
          why_choose_text: designSettings.why_choose_text,
          combo_text: designSettings.combo_text,
          gallery_text: designSettings.gallery_text,
          reviews_text: designSettings.reviews_text,
          quote_text: designSettings.quote_text,
          cta_text: designSettings.cta_text,
        }}),
        supabase.from("store_configs").upsert({ id: "integrations", value: integrations }),
        supabase.from("store_configs").upsert({ id: "courier_settings", value: courierSettings }),
        supabase.from("store_configs").upsert({ id: "advanced_settings", value: advancedSettings }),
        supabase.from("store_configs").upsert({ id: "marketing_data", value: marketingData }),
        supabase.from("store_configs").upsert({ id: "notification_settings", value: notificationSettings }),
        supabase.from("store_configs").upsert({ id: "navigation_settings", value: navigationSettings }),
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

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-8 pb-32 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-5 w-96 bg-slate-100 dark:bg-white/3 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-8">
          <div className="space-y-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-white/3 rounded-xl" />
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-16 bg-slate-100 dark:bg-white/3 rounded-xl" />
            <div className="h-64 bg-slate-100 dark:bg-white/3 rounded-xl" />
            <div className="h-48 bg-slate-100 dark:bg-white/3 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 shadow-xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm font-medium max-w-md">
          This section is restricted to Administrators only. Please contact the system owner if you believe this is an error.
        </p>
      </div>
    );
  }

  const activeTabData = SETTINGS_TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-8 pb-40 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("settings")}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-[52px]">
            {t("manage_store_config")}
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

        {/* Sidebar Navigation */}
        <nav className="sticky top-28 space-y-1.5 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-3 shadow-sm">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/3"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  isActive ? "bg-white/20" : tab.bg
                }`}>
                  <tab.icon size={18} className={isActive ? "text-white" : tab.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-semibold truncate ${isActive ? "text-white" : ""}`}>
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xl ${
                        isActive ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-gold/20 text-amber-700 dark:text-amber-400"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${isActive ? "text-white/70" : "text-slate-400 dark:text-slate-500"}`}>
                    {tab.desc}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTab"
                    className="absolute right-3 w-1.5 h-1.5 bg-white rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {activeTabData && (
                <div className={`w-10 h-10 rounded-xl ${activeTabData.bg} flex items-center justify-center`}>
                  <activeTabData.icon size={20} className={activeTabData.color} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeTabData?.label}
                </h2>
                <p className="text-xs text-slate-400">{activeTabData?.desc}</p>
              </div>
            </div>
          </div>

          {/* Animated Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeTab === "general" && (
                <GeneralSettings
                  settings={generalSettings}
                  onUpdate={(data: Partial<AdminSettings>) => setGeneralSettings({ ...generalSettings, ...data })}
                />
              )}

              {activeTab === "homepage" && (
                <HomepageSettings
                  settings={designSettings}
                  onUpdate={(data: any) => setDesignSettings({ ...designSettings, ...data })}
                />
              )}

              {activeTab === "order_control" && (
                <OrderControlSettings
                  settings={advancedSettings.order || {}}
                  onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, order: { ...advancedSettings.order, ...data } })}
                />
              )}

              {activeTab === "otp" && (
                <OTPSettings
                  settings={advancedSettings.otp || {}}
                  integrations={integrations}
                  onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, otp: { ...advancedSettings.otp, ...data } })}
                  onUpdateIntegrations={setIntegrations}
                />
              )}

              {activeTab === "courier" && (
                <CourierSettings
                  settings={courierSettings}
                  onUpdate={(newSettings: any) => setCourierSettings(newSettings)}
                />
              )}

              {activeTab === "capi" && (
                <FacebookCAPISettings
                  settings={advancedSettings.capi || {}}
                  onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, capi: { ...advancedSettings.capi, ...data } })}
                />
              )}

              {activeTab === "firebase" && (
                <FirebaseSettings
                  settings={advancedSettings.firebase || {}}
                  onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, firebase: { ...advancedSettings.firebase, ...data } })}
                />
              )}

              {activeTab === "marketing" && (
                <MarketingSettings
                  data={marketingData}
                  integrations={integrations}
                  onUpdate={(data: any) => setMarketingData({ ...marketingData, ...data })}
                />
              )}

              {activeTab === "automation" && (
                <AutomationSettings
                  settings={advancedSettings.recovery || {}}
                  integrations={integrations}
                  onUpdate={(data: any) => setAdvancedSettings({ ...advancedSettings, recovery: { ...advancedSettings.recovery, ...data } })}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationSettings
                  settings={notificationSettings}
                  onUpdate={(data: any) => setNotificationSettings({ ...notificationSettings, ...data })}
                />
              )}
              
              {activeTab === "navigation" && (
                <NavigationSettings
                  settings={navigationSettings}
                  onUpdate={(data: any) => setNavigationSettings({ ...navigationSettings, ...data })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-[800px] mx-auto bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl shadow-slate-900/30 border border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {t("unsaved_changes")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("save_discard_msg")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchSettings();
                    setHasUnsavedChanges(false);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  {t("discard")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {t("save_changes")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
