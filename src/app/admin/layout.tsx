"use client";

import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShoppingCart, LogOut, Star, 
  ChevronDown, Users, Truck, BarChart3, 
  Settings, Menu, X, Box, Database, ShieldAlert,
  ClipboardList, Clock, CheckCircle2, AlertCircle, Megaphone,
  Globe, Moon, Sun, ShieldCheck, Zap, Bell, Layers,
  CreditCard, Search, ArrowRight, Activity, Command,
  Cpu, Layout, Inbox, Ghost, Tag, PieChart, Ticket, Signal,
  MessageSquare, User, Eye, EyeOff, Lock, Headset, LineChart, Shield, Sparkles, Palette
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

interface SidebarSubItem {
  label: string;
  href: string;
  icon?: any;
  badge?: number;
}

interface SidebarItemProps {
  item: {
    label: string;
    href?: string;
    icon: any;
    subItems?: SidebarSubItem[];
  };
  pathname: string;
  isSidebarCollapsed: boolean;
  isMobileOpen: boolean;
  language: string;
}

function SidebarItem({ item, pathname, isSidebarCollapsed, isMobileOpen, language }: SidebarItemProps) {
  const isActive = pathname === item.href;
  const hasSub = !!item.subItems;
  const isSubActive = hasSub && item.subItems!.some((s: SidebarSubItem) => pathname === s.href);
  const [isOpen, setIsOpen] = useState(isSubActive);

  return (
    <div className="relative">
      {hasSub ? (
        <div className="space-y-1">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`w-full flex items-center ${isSidebarCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between px-4'} py-3 rounded-xl text-[12px] font-bold transition-all group ${isSubActive ? "bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/2"}`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSubActive ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                <item.icon size={18} /> 
              </div>
              {(!isSidebarCollapsed || isMobileOpen) && <span>{item.label}</span>}
            </div>
            {(!isSidebarCollapsed || isMobileOpen) && <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90 opacity-30"}`} />}
          </button>
          
          <AnimatePresence>
            {isOpen && (!isSidebarCollapsed || isMobileOpen) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="ml-6 pl-4 border-l border-slate-100 dark:border-white/5 space-y-1"
              >
                {item.subItems!.map((sub: SidebarSubItem, sIdx: number) => {
                  const isSubItemActive = pathname === sub.href;
                  return (
                    <Link 
                      key={sIdx} 
                      href={sub.href} 
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all relative group ${isSubItemActive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSubItemActive ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10 group-hover:bg-slate-400"}`} />
                        <span>{sub.label}</span>
                      </div>
                      {(sub.badge ?? 0) > 0 && (
                        <span className="bg-[#064e3b] text-white px-2 py-0.5 rounded-lg text-[9px] font-black">
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link 
          href={item.href || "#"} 
          className={`flex items-center ${isSidebarCollapsed && !isMobileOpen ? 'justify-center px-0' : 'gap-3.5 px-4'} py-3 rounded-xl text-[12px] font-bold transition-all group relative ${isActive ? "bg-[#064e3b] text-white shadow-lg shadow-emerald-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/2 hover:text-slate-900 dark:hover:text-white"}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? "bg-white/10 text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
            <item.icon size={18} /> 
          </div>
          {(!isSidebarCollapsed || isMobileOpen) && (
            <>
              <span className="flex-1">{item.label}</span>
              {isActive && <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />}
            </>
          )}
          
          {isSidebarCollapsed && !isMobileOpen && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-100 shadow-2xl">
              {item.label}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
            </div>
          )}
        </Link>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();
  
  const gen = settings?.general_settings || {};
  const storeName = gen.store_name || "Rangao";

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const [isOrdersOpen, setIsOrdersOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    incomplete: 0,
    incompleteCarts: 0
  });

  const [role, setRole] = useState<string>("admin"); 
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const fetchOrderCounts = async () => {
    const { data, error } = await supabase.from("orders").select("status");
    if (!error && data) {
      const counts: Record<string, number> = {
        all: data.length,
        pending: 0,
        shipped: 0,
        delivered: 0,
        incomplete: 0,
        incompleteCarts: 0
      };
      data.forEach((o: { status: string }) => {
        if (counts[o.status] !== undefined) {
          counts[o.status]++;
        }
      });
      
      const { count } = await supabase.from("abandoned_carts").select("*", { count: "exact", head: true }).eq("is_recovered", false);
      counts.incompleteCarts = count || 0;
      
      setOrderCounts({
        all: counts.all,
        pending: counts.pending,
        shipped: counts.shipped,
        delivered: counts.delivered,
        incomplete: counts.incomplete,
        incompleteCarts: counts.incompleteCarts
      });
    }
  };

  const fetchUserRole = async (userId: string, userEmail?: string) => {
    // 1. Trigger server-side heartbeat for profile & activity sync
    try {
      await fetch('/api/admin/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail })
      });
    } catch (err) {
      console.error("Heartbeat failed:", err);
    }

    // 2. Fetch role (Client-side check for UI)
    if (userEmail === 'rangao.bd@gmail.com') {
      setRole('super_admin');
    } else {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      if (roleData) setRole(roleData.role);
    }

    // 3. Fetch profile details for UI
    const { data: profileData } = await supabase
      .from('staff_profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    
    if (profileData && !('error' in profileData)) {
      setFullName((profileData as any).full_name);
      setAvatarUrl((profileData as any).avatar_url || "");
    } else {
      setFullName(userEmail?.split('@')[0] || "Staff");
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrderCounts();
      fetchUserRole(session.user.id, session.user.email);
      const channel = supabase
        .channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrderCounts())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'abandoned_carts' }, () => fetchOrderCounts())
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'staff_profiles',
          filter: `id=eq.${session.user.id}`
        }, (payload: { new: any }) => {
          if (payload.new) {
            const updated = payload.new as any;
            if (updated.full_name) setFullName(updated.full_name);
            if (updated.avatar_url !== undefined) setAvatarUrl(updated.avatar_url || "");
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [session]);

  useEffect(() => {
    const isDark = localStorage.getItem("admin-theme") !== "light";
    if (isDark) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    // 3-second safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id, session.user.email);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id, session.user.email);
      setLoading(false);
      clearTimeout(safetyTimeout);
    }).catch(() => {
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => { 
      subscription.unsubscribe(); 
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    if (session) {
      fetch('/api/admin/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, userEmail: session.user.email })
      }).then();
    }
  }, [pathname, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    let loginEmail = identifier;

    // Check if identifier is likely a username (doesn't contain @)
    if (!identifier.includes("@")) {
      const { data: profile, error: profileError } = await supabase
        .from('staff_profiles')
        .select('email')
        .eq('username' as any, identifier)
        .single();

      if (profileError || !profile) {
        setError(t("username_not_found"));
        return;
      }
      loginEmail = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#050505]">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-[3px] border-primary/10 rounded-xl rotate-45" />
          <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-xl rotate-45 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-primary font-black">R</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex w-full bg-[#f8fafc] dark:bg-[#050505]">
        {/* Left Side - Image/Features */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#ebf3ee] dark:bg-[#0a1510] relative overflow-hidden p-12">
          {/* Image Background with Blur */}
          <div className="absolute inset-0 z-0">
             <img src="/admin-bg.png" alt="Background" className="w-full h-full object-cover opacity-60 dark:opacity-30 blur-[2px]" />
             <div className="absolute inset-0 bg-linear-to-tr from-[#ebf3ee] via-[#ebf3ee]/60 to-transparent dark:from-[#0a1510] dark:via-[#0a1510]/60" />
          </div>
          
          <div className="absolute top-20 -left-20 w-64 h-64 bg-[#1b6038]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              {gen.favicon ? (
                <div className="w-12 h-12 bg-white dark:bg-[#0c0c0c] rounded-xl flex items-center justify-center shadow-lg shadow-[#1b6038]/10 overflow-hidden">
                  <img src={gen.favicon} alt="Favicon" className="w-10 h-10 object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#1b6038] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#1b6038]/20">
                  {storeName ? storeName.charAt(0).toUpperCase() : 'R'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-[#1b6038] dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">{storeName || 'RANGAO'}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-[1.3] tracking-tight mb-4">
              {t("login_welcome")}<br/>
              <span className="text-[#1b6038] dark:text-emerald-400">{t("login_admin_panel")}</span>
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-12 max-w-sm leading-relaxed">
              {t("login_desc")}
            </p>

            <div className="space-y-6">
              {[
                { icon: LineChart, title: t("feature_control_title"), desc: t("feature_control_desc") },
                { icon: Box, title: t("feature_fast_title"), desc: t("feature_fast_desc") },
                { icon: ShieldCheck, title: t("feature_secure_title"), desc: t("feature_secure_desc") },
                { icon: Headset, title: t("feature_support_title"), desc: t("feature_support_desc") },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-emerald-900/30 flex items-center justify-center text-[#1b6038] dark:text-emerald-400 shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[24px] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 relative z-10">
              
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-16 h-16 bg-[#ebf3ee] dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5 border border-[#1b6038]/10">
                  <svg className="w-10 h-10 text-[#1b6038] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <rect x="9" y="11" width="6" height="5" rx="1" />
                    <path d="M10 11V9a2 2 0 1 1 4 0v2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t("admin_login_header")}</h2>
                <p className="text-sm font-medium text-slate-500">{t("login_to_account")}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("email_mobile")}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-11 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:border-[#1b6038] focus:ring-1 focus:ring-[#1b6038] outline-none transition-all placeholder:text-slate-400"
                      placeholder={t("enter_email_mobile")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("password_label")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:border-[#1b6038] focus:ring-1 focus:ring-[#1b6038] outline-none transition-all placeholder:text-slate-400"
                      placeholder={t("password_placeholder")}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#1b6038] focus:ring-[#1b6038]" />
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900">{t("remember_me")}</span>
                  </label>
                  <a href="#" className="text-[13px] font-bold text-[#1b6038] dark:text-emerald-400 hover:underline">{t("forgot_password")}</a>
                </div>

                {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs font-bold text-center">{error}</div>}

                <button type="submit" className="w-full h-12 mt-2 rounded-xl bg-[#1b6038] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#154d2c] transition-colors shadow-lg shadow-[#1b6038]/20 hover:shadow-[#1b6038]/30">
                  <Lock size={16} /> {t("login_button")}
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-1 border-t border-slate-200 dark:border-white/10"></div>
                  <span className="px-4 text-[13px] font-medium text-slate-400 bg-white dark:bg-[#0c0c0c]">{t("or")}</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-white/10"></div>
                </div>

                <button 
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } });
                    if (error) setError(error.message);
                  }}
                  className="w-full h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t("google_login")}
                </button>
              </form>
            </div>
            
            <p className="text-center text-xs font-medium text-slate-400 mt-8">
              © {currentYear} {storeName || 'Rangao'}. {t("copyright")}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const permissions: Record<string, string[]> = {
    super_admin: ['*'],
    admin: ['*'],
    moderator: [
      "/admin", 
      "/admin/orders", 
      "/admin/incomplete-orders", 
      "/admin/products", 
      "/admin/categories", 
      "/admin/notifications", 
      "/admin/inventory", 
      "/admin/marketing", 
      "/admin/coupons", 
      "/admin/customers",
      "/admin/reviews",
      "/admin/fraud-checker", 
      "/admin/combo",
      "/admin/visitor-tracking",
      "/admin/profile"
    ],
    production: [
      "/admin", 
      "/admin/orders", 
      "/admin/products", 
      "/admin/categories", 
      "/admin/inventory", 
      "/admin/profile"
    ],
  };

  const hasPermission = (path: string) => {
    if (role === 'super_admin' || role === 'admin') return true;
    const userPerms = permissions[role] || ["/admin", "/admin/profile"];
    return userPerms.includes(path);
  };

  const navGroups = [
    {
      title: t("main_menu"),
      items: [
        { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
        { 
          label: t("orders"), 
          icon: ShoppingCart, 
          subItems: [
            { href: "/admin/orders", label: t("all_orders"), icon: ClipboardList, badge: orderCounts.all },
            { href: "/admin/incomplete-orders", label: t("incomplete_orders"), icon: Ghost, badge: orderCounts.incompleteCarts },
          ].filter(sub => hasPermission(sub.href))
        },
        { href: "/admin/products", label: t("products"), icon: Box },
        { href: "/admin/combo", label: t("combo_offers"), icon: Sparkles },
        { href: "/admin/categories", label: t("categories"), icon: Layers },
        { href: "/admin/notifications", label: t("notifications"), icon: Bell },
        { href: "/admin/inventory", label: t("inventory"), icon: Database },
        { href: "/admin/finance", label: t("finance"), icon: PieChart },
        { href: "/admin/visitor-tracking", label: t("visitor_tracking"), icon: Signal },
      ].filter(item => {
        if (item.subItems) return item.subItems.length > 0;
        return hasPermission(item.href || "");
      })
    },
    {
      title: t("marketing_customers"),
      items: [
        { href: "/admin/marketing", label: t("marketing"), icon: Megaphone },
        { href: "/admin/coupons", label: t("coupons"), icon: Ticket },
        { href: "/admin/customers", label: t("customers"), icon: User },
        { href: "/admin/reviews", label: t("reviews"), icon: Star },
      ].filter(item => hasPermission(item.href || ""))
    },
    {
      title: t("system_settings"),
      items: [
        { href: "/admin/store-customize", label: language === 'bn' ? "স্টোর কাস্টমাইজ" : "Store Customize", icon: Palette },
        { href: "/admin/settings", label: t("settings"), icon: Settings },
        { 
          label: t("team_management"), 
          icon: Users,
          subItems: [
            { href: "/admin/team", label: t("team_members"), icon: User },
            { href: "/admin/team/roles", label: t("roles_permissions"), icon: ShieldCheck },
            { href: "/admin/team/departments", label: t("departments"), icon: Layers },
          ].filter(sub => hasPermission(sub.href))
        },
        { href: "/admin/courier", label: t("courier_management"), icon: Truck },
        { href: "/admin/fraud-checker", label: t("fraud_checker"), icon: ShieldAlert },
      ].filter(item => {
        if (item.subItems) return item.subItems.length > 0;
        return hasPermission(item.href || "");
      })
    }
  ].filter(group => group.items.length > 0);

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'super_admin': return t("super_admin_label");
      case 'admin': return t("admin_label");
      case 'moderator': return t("moderator_label");
      case 'production': return t("production_label");
      default: return r;
    }
  };

  return (
    <div className="h-screen bg-[#f8fafc] dark:bg-[#050505] flex overflow-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden" 
            onClick={() => setIsMobileOpen(false)} 
          />
        )}
      </AnimatePresence>
 
      {/* Sidebar - Elite Glassmorphic Design */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobileOpen ? 300 : (isSidebarCollapsed ? 100 : 320), 
          x: isMobileOpen ? 0 : 0, 
          left: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -320 : 0)
        }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0c0c0c] lg:sticky lg:top-0 flex flex-col h-screen border-r border-slate-100 dark:border-white/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[1px_0_10px_rgba(0,0,0,0.02)]`}
      >
        <div className={`flex flex-col h-full ${isSidebarCollapsed && !isMobileOpen ? 'overflow-visible' : 'overflow-hidden'}`}>
          {/* Logo Section - Card Style */}
          <div className="p-6">
            <div className={`bg-slate-50/50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl p-4 transition-all relative group ${isSidebarCollapsed && !isMobileOpen ? 'flex items-center justify-center' : ''}`}>
              <div className="flex items-center justify-between w-full">
                <Link href="/admin" className="flex items-center gap-3">
                  <div className="relative">
                    {gen.favicon ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0c] shadow-sm flex items-center justify-center">
                        <img src={gen.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {storeName ? storeName.charAt(0).toUpperCase() : 'R'}
                      </div>
                    )}
                  </div>
                  {(!isSidebarCollapsed || isMobileOpen) && (
                    <div className="flex flex-col">
                       <span className="font-black text-slate-900 dark:text-white text-lg tracking-wider uppercase leading-none">{storeName}</span>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("admin_panel")}</p>
                    </div>
                  )}
                </Link>
                
                {(!isSidebarCollapsed || isMobileOpen) && (
                  <button 
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
                  >
                    <Command size={14} className="opacity-50" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className={`flex-1 overflow-y-auto px-4 pb-6 no-scrollbar`}>
            <div className="space-y-6">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  {(!isSidebarCollapsed || isMobileOpen) && (
                    <div className="flex items-center gap-3 px-4 py-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{group.title}</span>
                       <div className="h-px w-full bg-slate-50 dark:bg-white/5" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {group.items.map((item, iIdx) => (
                      <SidebarItem 
                        key={iIdx} 
                        item={item} 
                        pathname={pathname} 
                        isSidebarCollapsed={isSidebarCollapsed} 
                        isMobileOpen={isMobileOpen}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Section - Reference Image Style */}
          <div className="p-4 border-t border-slate-50 dark:border-white/5">
            <button 
              onClick={handleLogout} 
              className={`w-full flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 text-rose-500 transition-all group relative overflow-hidden`}
            >
               <div className="flex items-center gap-3">
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                  {(!isSidebarCollapsed || isMobileOpen) && <span className="text-[12px] font-black uppercase tracking-wider">{t("logout")}</span>}
               </div>
               {(!isSidebarCollapsed || isMobileOpen) && (
                 <span className="text-[9px] font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                    {t("session_logout_desc")}
                 </span>
               )}

               {isSidebarCollapsed && !isMobileOpen && (
                 <div className="absolute left-full ml-4 px-3 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-100 shadow-2xl">
                   {t("logout")}
                   <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-rose-500 rotate-45" />
                 </div>
               )}
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar - Premium Integrated Design */}
        <header className="h-20 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-3xl border-b border-slate-200/40 dark:border-white/5 flex items-center px-6 lg:px-10 shrink-0 z-20 sticky top-0 transition-all">
          <button 
            onClick={() => { if (window.innerWidth < 1024) setIsMobileOpen(true); else setIsSidebarCollapsed(!isSidebarCollapsed); }} 
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-all bg-slate-50 dark:bg-white/5 rounded-xl shadow-inner group border border-slate-100 dark:border-white/5"
          >
             <Menu size={22} className={`${isSidebarCollapsed ? 'rotate-180' : ''} transition-transform duration-500`} />
          </button>
          
          <div className="flex items-center justify-between flex-1 ml-8">
            <div className="hidden sm:flex items-center gap-4 group cursor-pointer">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Activity size={18} className="animate-pulse" />
               </div>
               <div className="flex flex-col">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t("system_status")}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{t("all_services_active")}</p>
               </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/10 shadow-inner">
                 <button 
                   onClick={toggleDarkMode} 
                   className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary transition-all group relative overflow-hidden"
                 >
                    {isDarkMode ? <Sun size={18} className="relative z-10" /> : <Moon size={18} className="relative z-10" />}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
                 <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
                 <button 
                   onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')} 
                   className="px-5 h-10 flex items-center gap-3 rounded-xl text-slate-600 dark:text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all relative group overflow-hidden"
                 >
                    <Globe size={16} className="relative z-10 opacity-60" /> 
                    <span className="relative z-10 mt-0.5">{language}</span>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
              </div>
              
              <AdminNotifications />
              
              <Link href="/admin/profile" className="flex items-center gap-4 group cursor-pointer pl-6 border-l border-slate-100 dark:border-white/5">
                 <div className="text-right hidden md:block">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{fullName || session.user?.email?.split('@')[0]}</p>
                    <p className="text-[8px] font-bold text-primary uppercase tracking-[0.3em] leading-none mt-1">{getRoleBadge(role)}</p>
                 </div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-xl shadow-2xl group-hover:scale-105 transition-all duration-500 border-2 border-white/20 dark:border-slate-900/20 overflow-hidden">
                       {avatarUrl ? (
                          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                       ) : (
                          (fullName || session.user?.email)?.[0].toUpperCase()
                       )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-[#0c0c0c] flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </div>
                 </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-14 lg:py-12 transition-all relative no-scrollbar bg-slate-50/50 dark:bg-[#050505]">
           <div className="max-w-[1600px] mx-auto relative z-10">
              <motion.div 
                key={pathname} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              >
                 {hasPermission(pathname) ? children : (
                   <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
                      <div className="w-24 h-24 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-inner">
                         <ShieldAlert size={48} className="animate-bounce" />
                      </div>
                      <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                         {t("access_denied")}
                      </h1>
                      <p className="max-w-md text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-widest leading-loose">
                         {t("access_denied_desc")}
                      </p>
                      <Link href="/admin" className="px-8 py-4 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                         {t("return_to_dashboard")}
                      </Link>
                   </div>
                 )}
              </motion.div>
           </div>
        </main>
      </div>
    </div>
  );
}
