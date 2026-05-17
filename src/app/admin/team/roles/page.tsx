"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldPlus, 
  Users, Lock, Edit, Trash2, Search, 
  ChevronRight, CheckCircle2, XCircle, 
  LayoutDashboard, ShoppingCart, Box, User, 
  Truck, BarChart3, PieChart, Settings, 
  Headset, Download, Plus, X, ChevronDown,
  ArrowRight, ArrowLeft, Info, Check,
  Zap, HardDrive, ClipboardList, Eye, EyeOff
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

// --- Types ---

type PermissionAction = 'view' | 'add' | 'edit' | 'delete' | 'export';

interface ModulePermission {
  id: string;
  name_bn: string;
  name_en: string;
  icon: any;
  actions: PermissionAction[];
}

interface RolePermissions {
  [moduleId: string]: PermissionAction[];
}

interface SystemRole {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  description_bn: string;
  description_en: string;
  icon: any;
  type: 'system' | 'custom';
  memberCount: number;
  permissions: RolePermissions;
  color: string;
}

// --- Constants ---

const MODULES: ModulePermission[] = [
  { id: 'dashboard', name_bn: 'ড্যাশবোর্ড', name_en: 'Dashboard', icon: LayoutDashboard, actions: ['view'] },
  { id: 'orders', name_bn: 'অর্ডারসমূহ', name_en: 'Orders', icon: ShoppingCart, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'products', name_bn: 'প্রোডাক্ট', name_en: 'Products', icon: Box, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'customers', name_bn: 'কাস্টমার', name_en: 'Customers', icon: User, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'delivery', name_bn: 'ডেলিভারি', name_en: 'Delivery', icon: Truck, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'reports', name_bn: 'রিপোর্টসমূহ', name_en: 'Reports', icon: BarChart3, actions: ['view', 'export'] },
  { id: 'finance', name_bn: 'ফাইন্যান্স', name_en: 'Finance', icon: PieChart, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'support', name_bn: 'টিকিট / সাপোর্ট', name_en: 'Ticket / Support', icon: Headset, actions: ['view', 'add', 'edit', 'delete', 'export'] },
  { id: 'settings', name_bn: 'সেটিংস', name_en: 'Settings', icon: Settings, actions: ['view', 'edit'] },
];

const INITIAL_ROLES: SystemRole[] = [
  {
    id: '1',
    name_bn: 'সুপার অ্যাডমিন',
    name_en: 'Super Admin',
    slug: 'super_admin',
    description_bn: 'সিস্টেমের সম্পূর্ণ অ্যাক্সেস এবং সব মডিউল ব্যবহারের ক্ষমতা।',
    description_en: 'Full access to the system and ability to use all modules.',
    icon: ShieldCheck,
    type: 'system',
    memberCount: 1,
    color: '#10b981',
    permissions: MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.actions }), {})
  },
  {
    id: '2',
    name_bn: 'অ্যাডমিন',
    name_en: 'Admin',
    slug: 'admin',
    description_bn: 'সিস্টেম পরিচালনা এবং টিম ম্যানেজমেন্টের ক্ষমতা।',
    description_en: 'Ability to manage the system and team.',
    icon: Shield,
    type: 'system',
    memberCount: 3,
    color: '#3b82f6',
    permissions: MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.actions.filter(a => a !== 'delete') }), {})
  },
  {
    id: '3',
    name_bn: 'ম্যানেজার',
    name_en: 'Manager',
    slug: 'manager',
    description_bn: 'অর্ডার এবং প্রোডাক্ট ম্যানেজমেন্টের দায়িত্ব।',
    description_en: 'Responsible for order and product management.',
    icon: Zap,
    type: 'custom',
    memberCount: 5,
    color: '#f59e0b',
    permissions: {
      dashboard: ['view'],
      orders: ['view', 'add', 'edit'],
      products: ['view', 'add', 'edit'],
      customers: ['view'],
      delivery: ['view'],
    }
  },
  {
    id: '4',
    name_bn: 'অপারেটর',
    name_en: 'Operator',
    slug: 'operator',
    description_bn: 'দৈনন্দিন ডাটা এন্ট্রি এবং সাধারণ কাজ।',
    description_en: 'Daily data entry and general tasks.',
    icon: HardDrive,
    type: 'custom',
    memberCount: 8,
    color: '#8b5cf6',
    permissions: {
      dashboard: ['view'],
      orders: ['view', 'add'],
      products: ['view'],
    }
  },
  {
    id: '5',
    name_bn: 'ডেলিভারি বয়',
    name_en: 'Delivery Boy',
    slug: 'delivery_boy',
    description_bn: 'পণ্য ডেলিভারি এবং স্ট্যাটাস আপডেট।',
    description_en: 'Product delivery and status updates.',
    icon: Truck,
    type: 'custom',
    memberCount: 15,
    color: '#ef4444',
    permissions: {
      dashboard: ['view'],
      delivery: ['view', 'edit'],
    }
  },
  {
    id: '6',
    name_bn: 'অ্যাকাউন্ট্যান্ট',
    name_en: 'Accountant',
    slug: 'accountant',
    description_bn: 'আর্থিক লেনদেন এবং রিপোর্ট পর্যবেক্ষণ।',
    description_en: 'Monitoring financial transactions and reports.',
    icon: PieChart,
    type: 'custom',
    memberCount: 2,
    color: '#ec4899',
    permissions: {
      dashboard: ['view'],
      finance: ['view', 'export'],
      reports: ['view', 'export'],
    }
  }
];

export default function RolesPermissionsPage() {
  const { language, t } = useLanguage();
  const [roles, setRoles] = useState<SystemRole[]>(INITIAL_ROLES);
  const [activeRole, setActiveRole] = useState<SystemRole>(INITIAL_ROLES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);

  // Modal Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Headset",
    permissions: {} as RolePermissions
  });

  const filteredRoles = roles.filter(role => 
    role.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
    role.name_bn.includes(searchQuery)
  );

  const getActionLabel = (action: PermissionAction) => {
    return t(action);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
            {t("roles_permissions")}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-70">
            {t("roles_permissions_desc")}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t("search_roles_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="h-12 px-6 bg-[#064e3b] text-white rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus size={18} />
            {t("add_new_role")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: t("total_roles"), value: roles.length, sub: t("active_roles"), icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: t("custom_roles"), value: roles.filter(r => r.type === 'custom').length, sub: t("system_roles"), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: t("max_permission"), value: 'Super Admin', sub: t("full_access"), icon: Lock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: t("min_permission"), value: 'Delivery Boy', sub: t("limited_access"), icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-60">{stat.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main View: Roles & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Role List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t("role_list")}
            </h2>
          </div>
          <div className="space-y-3">
            {filteredRoles.map((role) => (
              <motion.button
                key={role.id}
                onClick={() => setActiveRole(role)}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${activeRole.id === role.id ? 'bg-white dark:bg-white/10 border-[#064e3b] shadow-xl shadow-emerald-900/5' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: role.color }}
                  >
                    <role.icon size={22} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{language === 'bn' ? role.name_bn : role.name_en}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role.memberCount} {t("members_count")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter ${role.type === 'system' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {role.type === 'system' ? t("system_role") : t("custom_role")}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <MoreHorizontal size={14} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Permission Matrix */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {t("permission_matrix")}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {t("selected_role")} <span className="text-primary">{language === 'bn' ? activeRole.name_bn : activeRole.name_en}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={activeRole.id} onChange={(e) => setActiveRole(roles.find(r => r.id === e.target.value) || roles[0])} className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20">
                   {roles.map(r => (
                     <option key={r.id} value={r.id}>{language === 'bn' ? r.name_bn : r.name_en}</option>
                   ))}
                </select>
                <button className="h-10 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Edit size={14} /> {t("edit_role")}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-white/[0.01]">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("module")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("view")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("add")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("edit")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("delete")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("export")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {MODULES.map((module) => (
                    <tr key={module.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
                            <module.icon size={18} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{language === 'bn' ? module.name_bn : module.name_en}</span>
                        </div>
                      </td>
                      {['view', 'add', 'edit', 'delete', 'export'].map((action) => {
                        const hasAction = module.actions.includes(action as PermissionAction);
                        const isGranted = activeRole.permissions[module.id]?.includes(action as PermissionAction);
                        
                        return (
                          <td key={action} className="px-6 py-5 text-center">
                            {!hasAction ? (
                              <div className="flex justify-center">
                                <div className="w-5 h-px bg-slate-200 dark:bg-white/10" />
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                {isGranted ? (
                                  <div className="w-6 h-6 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Check size={14} strokeWidth={4} />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-blue-50/30 dark:bg-blue-500/5 border-t border-slate-100 dark:border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Info size={18} />
              </div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-relaxed">
                {t("permission_note")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal - Full Screen or Large Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#0c0c0c] w-full max-w-[1200px] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col relative z-10 border border-slate-200 dark:border-white/5"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-[#064e3b] uppercase tracking-[0.3em] mb-2">
                    <span>{t("roles_permissions")}</span>
                    <ChevronRight size={12} />
                    <span className="text-slate-400">{t("add_new_role")}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {t("add_new_role")}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70">
                    {t("roles_permissions_desc")}
                  </p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all duration-500"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Stepper */}
              <div className="px-10 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-center gap-20">
                {[
                  { n: 1, l: t("role_info") },
                  { n: 2, l: t("set_permissions") },
                  { n: 3, l: t("review") }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s.n ? 'bg-[#064e3b] text-white scale-110 shadow-lg shadow-emerald-900/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                      {s.n}
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${step >= s.n ? 'text-[#064e3b]' : 'text-slate-400'}`}>
                        {s.l}
                      </p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter opacity-50">
                        {i === 0 ? t("name_desc") : i === 1 ? t("select_modules") : t("verify_details")}
                      </p>
                    </div>
                    {i < 2 && <div className={`w-20 h-px ${step > s.n ? 'bg-[#064e3b]' : 'bg-slate-200 dark:bg-white/10'}`} />}
                  </div>
                ))}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Left Column: Form Content */}
                  <div className="lg:col-span-8 space-y-10">
                    {step === 1 && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                              {t("role_name")} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              placeholder={t("role_name_placeholder")}
                              className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none shadow-inner"
                            />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("role_name")}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                              {t("role_slug")} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              placeholder={t("role_slug_placeholder")}
                              className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none shadow-inner"
                            />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("role_slug_desc")}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                              {t("role_desc")}
                            </label>
                            <textarea 
                              rows={3}
                              placeholder={t("role_desc_placeholder")}
                              className="w-full p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none shadow-inner resize-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                              {t("role_icon")}
                            </label>
                            <div className="relative group">
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#064e3b]">
                                <Headset size={20} />
                              </div>
                              <select className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none shadow-inner appearance-none">
                                <option>হেডসেট (Support)</option>
                                <option>শিল্ড (Admin)</option>
                                <option>ইউজার (Standard)</option>
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:rotate-180 transition-transform" size={18} />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("role_icon_desc")}</p>
                          </div>
                        </div>

                        <div className="space-y-6 pt-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {t("select_permissions_title")}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("select_permissions_desc")}</p>
                          </div>

                          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("module")}</th>
                                  <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t("view")}</th>
                                  <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t("add")}</th>
                                  <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t("edit")}</th>
                                  <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t("delete")}</th>
                                  <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t("export")}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {MODULES.map((module) => (
                                  <tr key={module.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                          <module.icon size={14} />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{language === 'bn' ? module.name_bn : module.name_en}</span>
                                      </div>
                                    </td>
                                    {['view', 'add', 'edit', 'delete', 'export'].map((action) => {
                                      const hasAction = module.actions.includes(action as PermissionAction);
                                      return (
                                        <td key={action} className="px-4 py-4 text-center">
                                          {!hasAction ? (
                                            <div className="flex justify-center">
                                              <div className="w-4 h-px bg-slate-200 dark:bg-white/10" />
                                            </div>
                                          ) : (
                                            <div className="flex justify-center">
                                              <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded-xl border-2 border-slate-300 dark:border-white/10 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                              />
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Column: Summary Panel */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-0 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-8 space-y-8">
                       <div className="flex items-center justify-between px-2">
                         <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                           {t("role_summary")}
                         </h3>
                         <div className="w-2 h-2 rounded-xl bg-primary animate-pulse" />
                       </div>

                       <div className="p-6 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl flex items-center gap-5 shadow-sm group">
                          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Headset size={32} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1.5 uppercase tracking-tighter">Support Agent</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">support_agent</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("role_desc")}</p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                              {language === 'bn' 
                                ? "কাস্টমার সাপোর্ট এবং টিকিট ব্যবস্থাপনায় সহায়তা করবে।" 
                                : "Assists in customer support and ticket management operations."}
                            </p>
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("total_permissions")}</p>
                               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-xl">11 {t("authorized")}</span>
                             </div>
                             <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("primary_access")}</p>
                                <div className="flex flex-wrap gap-2">
                                  {['টিকিট / সাপোর্ট', 'অর্ডারসমূহ', 'প্রোডাক্ট', 'কাস্টমার'].map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-tighter rounded-xl border border-emerald-500/10">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                             </div>
                          </div>

                          <div className="pt-4 space-y-4 border-t border-slate-200/60 dark:border-white/5">
                             <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("creator_auto")}</p>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">Rangao Admin</p>
                             </div>
                             <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("created_date")}</p>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t("today_date")}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-10 py-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="h-12 px-8 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-all border border-slate-200 dark:border-white/10 hover:border-rose-500/20 bg-white dark:bg-white/5 shadow-sm"
                >
                  {t("cancel")}
                </button>
                <div className="flex items-center gap-4">
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="h-12 px-8 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-white/10 flex items-center gap-3 hover:bg-slate-100 transition-all"
                    >
                      <ArrowLeft size={18} />
                      {t("back")}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (step < 3) setStep(step + 1);
                      else {
                        toast.success("New role created successfully!");
                        setShowCreateModal(false);
                      }
                    }}
                    className="h-12 px-8 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                  >
                    {step === 3 ? t("save_role") : t("next_step")}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-xl" />
      </div>
    </div>
  );
}

// Helper icons for the list view since we're using components as properties
const MoreHorizontal = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);
