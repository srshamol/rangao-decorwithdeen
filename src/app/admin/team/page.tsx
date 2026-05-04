"use client";

import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { 
  Users, UserPlus, Shield, ShieldCheck, 
  ShieldAlert, UserMinus, Edit, Mail, 
  Phone, Calendar, Clock, Search, 
  Filter, MoreHorizontal, CheckCircle2, 
  XCircle, AlertCircle, Trash2, RefreshCw,
  Activity, ArrowRight, X, ChevronRight,
  ShieldPlus, Lock, Download, Loader2,
  Key, LogIn, HardDrive, Zap, Headphones,
  FileText, ClipboardList, Package, ChevronDown,
  Eye, EyeOff, User, Briefcase, Building, MapPin,
  CalendarDays, Globe, UploadCloud, Smartphone,
  Plus, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { formatDate, formatRelativeDate } from "@/lib/date-utils";

type StaffRole = 'super_admin' | 'admin' | 'manager' | 'customer_support' | 'content_manager' | 'inventory_manager' | 'production' | 'moderator' | 'user';

interface StaffUser {
  id: string;
  full_name: string;
  email: string;
  username?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'invited';
  role: StaffRole;
  job_title?: string;
  department?: string;
  address?: string;
  joining_date?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  staff_name: string;
  role: StaffRole;
  action_type: string;
  description: string;
  ip_address: string;
  created_at: string;
}

function AdminTeamContent() {
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<StaffRole>('production');
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'invited' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<StaffUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<StaffUser | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Invite Form
  const [inviteForm, setInviteForm] = useState({ 
    email: "", 
    full_name: "", 
    username: "",
    password: "",
    confirmPassword: "",
    role: "admin" as StaffRole, 
    phone: "",
    jobTitle: "",
    department: "",
    address: "",
    joiningDate: new Date().toISOString().split('T')[0],
    status: "active" as 'active' | 'inactive' | 'invited'
  });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Subscribe to realtime updates for staff activity
    const channel = supabase
      .channel('staff-activity')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'staff_profiles' 
      }, () => {
        fetchInitialData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_roles' 
      }, () => {
        fetchInitialData();
      })
      .subscribe();

    // Refresh every 60s to update relative time strings (e.g. "5 seconds ago")
    const interval = setInterval(() => {
      fetchInitialData();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchInitialData = async () => {
    let activeRole: StaffRole = 'production';
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      // Hard override for primary owner
      if (session.user.email?.toLowerCase() === 'rangao.bd@gmail.com') {
        activeRole = 'super_admin';
      } else {
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
        if (roleData) activeRole = roleData.role as StaffRole;
      }
      setCurrentUserRole(activeRole);
    }

    // 1. Fetch roles and profiles in parallel
    const [rolesResponse, profilesResponse] = await Promise.all([
      supabase.from('user_roles').select('*'),
      supabase.from('staff_profiles').select('*')
    ]);

    const roles = rolesResponse.data || [];
    const profiles = profilesResponse.data || [];
    
    if (profiles.length > 0) {
      const combined = profiles.map((p: any) => {
        let userRole = roles.find((r: any) => r.user_id === p.id)?.role || 'production';
        if (p.email?.toLowerCase() === 'rangao.bd@gmail.com') userRole = 'super_admin';
        
        return {
          ...p,
          role: userRole as StaffRole,
          status: p.status || 'active'
        };
      });
      setStaff(combined as StaffUser[]);
    } else if (roles.length > 0) {
      const staffFromRoles = roles.map((r: any) => ({
        id: r.user_id,
        full_name: r.user_id.substring(0, 8),
        email: `staff_${r.user_id.substring(0, 8)}@rangao.com`,
        role: r.role as StaffRole,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }));
      setStaff(staffFromRoles as StaffUser[]);
    } else {
      // Last resort: Show current user with the correctly identified activeRole
      if (session?.user) {
        setStaff([{
          id: session.user.id,
          full_name: activeRole === 'super_admin' ? "Super Admin (Owner)" : "Staff Member",
          email: session.user.email || "",
          role: activeRole,
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString() // Show current activity
        }] as StaffUser[]);
      }
    }

    // Fetch Activity Logs (gracefully handle missing table)
    try {
      const { data: logs } = await supabase
        .from('staff_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (logs) setActivityLogs(logs as ActivityLog[]);
    } catch { /* table may not exist yet */ }

    setLoading(false);
  };

  const logActivity = async (action: string, desc: string) => {
    if (!currentUser) return;
    try {
      await supabase.from('staff_activity_logs').insert({
        staff_id: currentUser.id,
        action_type: action,
        description: desc,
        ip_address: "Client-side"
      });
    } catch (err) { 
      console.error("Logging error:", err);
    }
    fetchInitialData();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteForm.password !== inviteForm.confirmPassword) {
      toast.error(language === 'bn' ? "পাসওয়ার্ড মিলছে না!" : "Passwords do not match!");
      return;
    }
    setInviting(true);
    try {
      // Call our internal API to create the user with password
      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email,
          password: inviteForm.password,
          username: inviteForm.username,
          fullName: inviteForm.full_name,
          role: inviteForm.role,
          phone: inviteForm.phone,
          jobTitle: inviteForm.jobTitle,
          department: inviteForm.department,
          address: inviteForm.address,
          joiningDate: inviteForm.joiningDate,
          status: inviteForm.status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create staff member");
      }
      
      await logActivity('create_staff', `Created staff account for ${inviteForm.email} as ${inviteForm.role}`);
      toast.success(language === 'bn' ? "অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে ✅" : "Account created successfully ✅");
      setShowInviteModal(false);
      setInviteForm({ 
        email: "", full_name: "", username: "", password: "", confirmPassword: "", 
        role: "admin", phone: "", jobTitle: "", department: "", address: "", 
        joiningDate: new Date().toISOString().split('T')[0], status: "active" 
      });
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff member");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!showEditModal) return;
    
    // Check if we are updating basic info (only allowed for Super Admin or the user themselves)
    const isSuperAdmin = currentUserRole === 'super_admin';
    
    try {
      if (isSuperAdmin) {
        // Use the new server-side API for full updates
        const response = await fetch('/api/admin/update-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: showEditModal.id,
            email: showEditModal.email,
            username: showEditModal.username,
            fullName: showEditModal.full_name,
            role: showEditModal.role,
            phone: showEditModal.phone,
            status: showEditModal.status
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to update staff");
      } else {
        // Limited update for standard Admins
        // Update role
        await supabase.from('user_roles').upsert({ user_id: showEditModal.id, role: showEditModal.role }, { onConflict: 'user_id' });
        // Update profile status
        await supabase.from('staff_profiles').update({ status: showEditModal.status }).eq('id', showEditModal.id);
      }
      
      await logActivity('update_staff', `Updated staff member: ${showEditModal.full_name} (${showEditModal.id})`);
      toast.success(language === 'bn' ? "স্টাফ তথ্য আপডেট করা হয়েছে" : "Staff member updated successfully");
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update staff");
    } finally {
      setShowEditModal(null);
    }
  };

  const handleDeleteStaff = async () => {
    if (!showDeleteModal) return;
    try {
      // Remove from user_roles
      await supabase.from('user_roles').delete().eq('user_id', showDeleteModal.id);
      // Remove from staff_profiles
      try {
        await supabase.from('staff_profiles' as any).delete().eq('id', showDeleteModal.id);
      } catch { /* table may not exist */ }
      
      await logActivity('delete', `Removed staff: ${showDeleteModal.full_name}`);
      toast.success(language === 'bn' ? "স্টাফ মুছে ফেলা হয়েছে" : "Staff member deleted");
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete staff");
    } finally {
      setShowDeleteModal(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s: any) => s.status === 'active').length,
      inactive: staff.filter((s: any) => s.status === 'inactive').length,
      invited: staff.filter((s: any) => s.status === 'invited').length,
    };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s: any) => {
      const matchesTab = activeTab === 'all' || s.status === activeTab;
      const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [staff, activeTab, searchQuery]);

  const getRoleBadgeConfig = (role: StaffRole) => {
    const isBn = language === 'bn';
    switch (role) {
      case 'super_admin': return { label: isBn ? 'সুপার অ্যাডমিন' : 'Super Admin', color: '#C9A24D', bg: 'bg-[#C9A24D]/10', text: 'text-[#C9A24D]', icon: ShieldCheck };
      case 'admin': return { label: isBn ? 'অ্যাডমিন' : 'Admin', color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: ShieldCheck };
      case 'manager': return { label: isBn ? 'ম্যানেজার' : 'Manager', color: '#3B82F6', bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Users };
      case 'customer_support': return { label: isBn ? 'কাস্টমার সাপোর্ট' : 'Support', color: '#8B5CF6', bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Headphones };
      case 'content_manager': return { label: isBn ? 'কনটেন্ট ম্যানেজার' : 'Content', color: '#F59E0B', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: FileText };
      case 'inventory_manager': return { label: isBn ? 'ইনভেন্টরি ম্যানেজার' : 'Inventory', color: '#EF4444', bg: 'bg-rose-500/10', text: 'text-rose-500', icon: ClipboardList };
      default: return { label: isBn ? 'ইউজার' : 'User', color: '#64748b', bg: 'bg-slate-500/10', text: 'text-slate-500', icon: ShieldAlert };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{t("active")}</span>;
      case 'inactive': return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{t("inactive")}</span>;
      case 'invited': return <span className="px-3 py-1 bg-gold/10 text-gold rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">{t("pending")}</span>;
      default: return null;
    }
  };

  // Permission Checks
  if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 shadow-2xl">
        <div className="w-24 h-24 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-8 shadow-inner">
          <Lock size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter  mb-4">{language === 'bn' ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-slate-500 max-w-md font-bold  uppercase text-[11px] tracking-widest">{language === 'bn' ? "এই পৃষ্ঠাটি শুধুমাত্র সুপার অ্যাডমিন ও অ্যাডমিনদের জন্য সংরক্ষিত।" : "This page is restricted to Super Admins and Admins only."}</p>
        <button onClick={() => window.history.back()} className="mt-10 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
           {language === 'bn' ? "ফিরে যান" : "Go Back"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 selection:bg-primary/20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">
            {t("team_management")}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
            {t("team_management_desc")}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex-1 md:flex-none h-12 px-6 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            <Mail size={16} />
            {t("invite_member")}
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex-1 md:flex-none h-12 px-6 bg-[#064e3b] text-white rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus size={18} />
            {t("add_new_member")}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("total_members"), value: stats.total, sub: t("active_members"), color: "text-blue-500", bg: "bg-blue-500/10", icon: Users },
          { label: t("active_members"), value: stats.active, sub: t("active"), color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { label: t("invite_sent"), value: stats.invited, sub: t("pending"), color: "text-amber-500", bg: "bg-amber-500/10", icon: UserPlus },
          { label: t("inactive_members"), value: stats.inactive, sub: t("inactive"), color: "text-rose-500", bg: "bg-rose-500/10", icon: UserMinus },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all group flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{stat.value}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-60">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Controls & Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-xl overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-50/50 dark:bg-white/2">
           {/* Role Tabs */}
           <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: t("all_members") },
                { id: 'active', label: t("active") },
                { id: 'invited', label: t("invite_sent") },
                { id: 'inactive', label: t("inactive") },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#064e3b] text-white shadow-lg shadow-emerald-900/20 scale-105' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {tab.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-xl text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
                    {tab.id === 'all' ? staff.length : staff.filter(s => s.status === tab.id).length}
                  </span>
                </button>
              ))}
           </div>

           {/* Search & Actions */}
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#064e3b] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={t("search_staff_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-6 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                />
              </div>
              <button className="h-12 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Filter size={16} />
                {t("filter")}
              </button>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-white/1">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("member")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("role")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("department")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("joining_date")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("status")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">{t("last_active")}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredStaff.map((member, idx) => {
                const roleConfig = getRoleBadgeConfig(member.role);
                return (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 dark:hover:bg-white/1 transition-colors"
                  >
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform text-xs"
                            style={{ backgroundColor: roleConfig.color }}
                          >
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              member.full_name[0].toUpperCase()
                            )}
                          </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                {member.full_name}
                                {member.id === currentUser?.id && (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-xl uppercase">
                                    {t("you")}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 tracking-tight">{member.email}</p>
                           </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className={`inline-flex items-center px-3 py-1.5 ${roleConfig.bg} ${roleConfig.text} rounded-lg border ${roleConfig.text.replace('text-', 'border-')}/10`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{roleConfig.label}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{member.department || "General"}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-tighter">{formatDate(member.created_at, 'dd MMMM, yyyy', language)}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(member.created_at, 'hh:mm a', language)}</p>
                    </td>
                    <td className="px-8 py-5">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {member.last_login ? formatRelativeDate(member.last_login, language) : (language === 'bn' ? "—" : "—")}
                          </p>
                          {member.last_login && (new Date().getTime() - new Date(member.last_login).getTime()) < 120000 && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[7px] font-black uppercase tracking-widest">Live</span>
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                        <div className="relative inline-block">
                           <button 
                             onClick={() => setActiveActionMenu(activeActionMenu === member.id ? null : member.id)}
                             className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all"
                           >
                              <MoreHorizontal size={18} />
                           </button>
                           
                           <AnimatePresence>
                             {activeActionMenu === member.id && (
                               <>
                                 <motion.div 
                                   initial={{ opacity: 0 }} 
                                   animate={{ opacity: 1 }} 
                                   exit={{ opacity: 0 }} 
                                   onClick={() => setActiveActionMenu(null)}
                                   className="fixed inset-0 z-40" 
                                 />
                                 <motion.div 
                                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                   animate={{ opacity: 1, scale: 1, y: 0 }}
                                   exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                   className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden"
                                 >
                                    <div className="p-2 space-y-1">
                                       <button 
                                         onClick={() => { setActiveActionMenu(null); setShowEditModal(member); }}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                       >
                                          <Eye size={16} className="text-[#064e3b]" />
                                          {t("view_edit")}
                                       </button>
                                       <button 
                                         onClick={() => { setActiveActionMenu(null); setShowDeleteModal(member); }}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all"
                                       >
                                          <Trash2 size={16} />
                                          {t("delete_member")}
                                       </button>
                                    </div>
                                 </motion.div>
                               </>
                             )}
                           </AnimatePresence>
                        </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log Section */}
      <div className="bg-slate-900/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-xl p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mr-[-300px] mt-[-300px] opacity-50" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] ml-[-200px] mb-[-200px] opacity-30" />
         
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 relative z-10">
            <div>
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Activity className="text-[#064e3b]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{t("staff_activity_log")}</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1">{t("recent_modifications")}</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => toast.info("Activity log data synced")} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <Download size={14} /> {t("export_csv")}
               </button>
            </div>
         </div>

         <div className="space-y-3 relative z-10">
            {activityLogs.length > 0 ? activityLogs.map((log: ActivityLog, i: number) => (
              <div key={log.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white/2 border border-white/5 rounded-xl hover:bg-white/4 transition-all group hover:scale-[1.01] duration-300">
                 <div className="flex items-center gap-6">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-primary border border-white/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                       {(log.staff_name || "S")[0].toUpperCase()}
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[11px] font-black uppercase tracking-widest text-white/90 group-hover:text-primary transition-colors">{log.staff_name || "System Staff"}</span>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-white/5 rounded-lg text-white/40 border border-white/5">{log.role || "Operator"}</span>
                       </div>
                       <p className="text-sm font-bold text-white/50 tracking-tight leading-relaxed">"{log.action_type}: {log.description}"</p>
                    </div>
                 </div>
                 <div className="mt-4 lg:mt-0 flex items-center gap-8 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2"><HardDrive size={12} className="opacity-50"/> {log.ip_address || "Internal"}</div>
                    <div className="flex items-center gap-2"><Clock size={12} className="opacity-50"/> {formatRelativeDate(log.created_at, language)}</div>
                 </div>
              </div>
            )) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-white/2 border border-white/5 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                   <Activity className="text-white/10" size={32} />
                   <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl animate-pulse" />
                </div>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">{t("no_activity")}</p>
                <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-2">All operational nodes are synchronized and idle</p>
              </div>
            )}
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInviteModal(false)} className="fixed inset-0 bg-slate-950/80 z-[100] backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] z-[110] p-4 lg:p-0">
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="px-10 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-20">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                           <UserPlus size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                             {t("add_new_member")}
                           </h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                             {t("team_management_desc")}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setShowInviteModal(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
                  </div>
                  
                  <form onSubmit={handleCreateStaff} className="overflow-y-auto">
                     <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Side: Form */}
                        <div className="p-10 space-y-10">
                           <div className="space-y-6">
                              <div className="flex items-center gap-3 mb-2">
                                 <User size={18} className="text-emerald-500" />
                                 <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t("personal_info")}</h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("full_name")} *</label>
                                    <input required value={inviteForm.full_name} onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" placeholder={t("full_name")} />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("email_address")} *</label>
                                    <input required type="email" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" placeholder={t("email_address")} />
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("password")} *</label>
                                    <div className="relative">
                                       <input required type={showPassword ? "text" : "password"} value={inviteForm.password} onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})} className="w-full h-12 px-5 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" placeholder={t("password")} />
                                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors">
                                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                       </button>
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("confirm_password")} *</label>
                                    <div className="relative">
                                       <input required type={showConfirmPassword ? "text" : "password"} value={inviteForm.confirmPassword} onChange={(e) => setInviteForm({...inviteForm, confirmPassword: e.target.value})} className="w-full h-12 px-5 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" placeholder={t("confirm_password")} />
                                       <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors">
                                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("job_title")}</label>
                                    <input value={inviteForm.jobTitle} onChange={(e) => setInviteForm({...inviteForm, jobTitle: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" placeholder={t("job_title")} />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("department")}</label>
                                    <div className="relative group">
                                       <select value={inviteForm.department} onChange={(e) => setInviteForm({...inviteForm, department: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner appearance-none">
                                          <option value="">{t("select_department")}</option>
                                          <option value="Sales">Sales</option>
                                          <option value="Support">Support</option>
                                          <option value="Operations">Operations</option>
                                          <option value="Inventory">Inventory</option>
                                       </select>
                                       <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("joining_date")}</label>
                                    <div className="relative">
                                       <input type="date" value={inviteForm.joiningDate} onChange={(e) => setInviteForm({...inviteForm, joiningDate: e.target.value})} className="w-full h-12 px-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" />
                                       <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("status")}</label>
                                    <div className="relative group">
                                       <select value={inviteForm.status} onChange={(e) => setInviteForm({...inviteForm, status: e.target.value as any})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner appearance-none">
                                          <option value="active">{t("active")}</option>
                                          <option value="inactive">{t("inactive")}</option>
                                          <option value="invited">{t("pending")}</option>
                                       </select>
                                       <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Right Side: Role & Profile */}
                        <div className="flex-1 p-10 bg-slate-50/50 dark:bg-white/1 space-y-10">
                           {/* Role Selection */}
                           <div className="space-y-5">
                              <div className="flex flex-col gap-1">
                                 <h3 className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight">{language === 'bn' ? "ভূমিকা (Role) নির্বাচন করুন" : "Assign Mission Role"}</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{language === 'bn' ? "টিম মেম্বারের জন্য উপযুক্ত ভূমিকা নির্বাচন করুন" : "Define organizational permissions"}</p>
                              </div>
                              <div className="space-y-2.5">
                                 {[
                                   { id: 'admin', label: 'অ্যাডমিন', desc: 'সম্পূর্ণ অ্যাক্সেস, সকল কিছু পরিচালনা করতে পারবেন', icon: ShieldCheck, color: 'emerald' },
                                   { id: 'manager', label: 'ম্যানেজার', desc: 'অর্ডার, প্রোডাক্ট ও কাস্টমার ম্যানেজ করতে পারবেন', icon: Users, color: 'blue' },
                                   { id: 'customer_support', label: 'কাস্টমার সাপোর্ট', desc: 'শুধু কাস্টমার ও অর্ডার সম্পর্কিত কাজ করতে পারবেন', icon: Headphones, color: 'purple' },
                                   { id: 'content_manager', label: 'কনটেন্ট ম্যানেজার', desc: 'প্রোডাক্ট, ব্লগ ও মিডিয়া ম্যানেজ করতে পারবেন', icon: FileText, color: 'orange' },
                                   { id: 'inventory_manager', label: 'ইনভেন্টরি ম্যানেজার', desc: 'শুধু ইনভেন্টরি ও স্টক ম্যানেজ করতে পারবেন', icon: ClipboardList, color: 'rose' },
                                 ].map(r => (
                                   <label key={r.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group relative ${inviteForm.role === r.id ? `bg-${r.color}-500/5 border-${r.color}-500/40 shadow-sm` : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200'}`}>
                                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${inviteForm.role === r.id ? `bg-${r.color}-500 text-white shadow-lg shadow-${r.color}-500/20` : `bg-${r.color}-500/10 text-${r.color}-500`}`}>
                                         <r.icon size={22} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <p className={`text-[11px] font-black uppercase tracking-widest ${inviteForm.role === r.id ? `text-${r.color}-600` : 'text-slate-900 dark:text-white'}`}>{r.label}</p>
                                         <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{r.desc}</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${inviteForm.role === r.id ? `border-${r.color}-500 bg-${r.color}-500` : 'border-slate-200 dark:border-white/10'}`}>
                                        {inviteForm.role === r.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                      </div>
                                      <input type="radio" name="role" checked={inviteForm.role === r.id} onChange={() => setInviteForm({...inviteForm, role: r.id as StaffRole})} className="hidden" />
                                   </label>
                                 ))}
                              </div>
                           </div>

                           {/* Profile Image */}
                           <div className="space-y-4">
                              <h3 className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight">{language === 'bn' ? "প্রোফাইল ছবি (ঐচ্ছিক)" : "Profile Identity (Optional)"}</h3>
                              <div className="group relative">
                                 <div className="w-full h-40 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-emerald-50/30 hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                       <UploadCloud size={28} />
                                    </div>
                                    <div className="text-center">
                                       <p className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-widest">{language === 'bn' ? "ছবি আপলোড করুন" : "Upload Identity Image"}</p>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">JPG, PNG or WEBP (Max 2MB)</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Footer Actions */}
                     <div className="px-10 py-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900 sticky bottom-0 z-20">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live System Sync Enabled</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <button type="button" onClick={() => setShowInviteModal(false)} className="px-8 h-12 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/8 transition-all">
                              {language === 'bn' ? "বাতিল করুন" : "Abort Initialization"}
                           </button>
                           <button disabled={inviting} type="submit" className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
                              {inviting ? <Loader2 className="animate-spin" size={18}/> : <UserPlus size={18} strokeWidth={3}/>}
                              {language === 'bn' ? "টিম মেম্বার যুক্ত করুন" : "Finalize Personnel Addition"}
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </motion.div>
          </>
        )}

        {showEditModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(null)} className="fixed inset-0 bg-slate-950/80 z-[100] backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[550px] z-[110] p-6 lg:p-0">
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
                  <div className="h-20 bg-slate-900 dark:bg-white px-10 flex items-center justify-between text-white dark:text-slate-900">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 dark:bg-slate-900/10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner"><Edit size={20}/></div>
                        <div>
                           <h2 className="text-lg font-black uppercase tracking-tighter ">{language === 'bn' ? "স্টাফ তথ্য পরিবর্তন" : "Update Personnel"}</h2>
                           <p className="text-[8px] font-bold opacity-60 uppercase tracking-[0.3em]">{showEditModal.full_name}</p>
                        </div>
                     </div>
                     <button onClick={() => setShowEditModal(null)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
                  </div>
                  
                  <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                     {/* Identity Section (Super Admin only) */}
                     {(currentUserRole === 'super_admin') && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "নাম" : "Full Name"}</label>
                             <input value={showEditModal.full_name} onChange={(e) => setShowEditModal({...showEditModal, full_name: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "ইউজারনেম" : "Username"}</label>
                             <input value={showEditModal.username || ""} onChange={(e) => setShowEditModal({...showEditModal, username: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "ইমেইল" : "Email"}</label>
                             <input value={showEditModal.email} onChange={(e) => setShowEditModal({...showEditModal, email: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "ফোন" : "Phone"}</label>
                             <input value={showEditModal.phone || ""} onChange={(e) => setShowEditModal({...showEditModal, phone: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                          </div>
                       </div>
                     )}

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "রোল পরিবর্তন করুন" : "Update Access Level"}</label>
                        <div className="grid grid-cols-1 gap-2">
                           {[
                             { id: 'super_admin', label: 'সুপার অ্যাডমিন', desc: 'ফুল অ্যাক্সেস', icon: ShieldCheck, color: 'emerald', disabled: currentUserRole !== 'super_admin' },
                             { id: 'admin', label: 'অ্যাডমিন', desc: 'অ্যাডমিন অ্যাক্সেস', icon: ShieldCheck, color: 'emerald' },
                             { id: 'manager', label: 'ম্যানেজার', desc: 'ম্যানেজমেন্ট অ্যাক্সেস', icon: Users, color: 'blue' },
                             { id: 'customer_support', label: 'কাস্টমার সাপোর্ট', desc: 'সাপোর্ট অ্যাক্সেস', icon: Headphones, color: 'purple' },
                             { id: 'content_manager', label: 'কনটেন্ট ম্যানেজার', desc: 'কনটেন্ট অ্যাক্সেস', icon: FileText, color: 'orange' },
                             { id: 'inventory_manager', label: 'ইনভেন্টরি ম্যানেজার', desc: 'ইনভেন্টরি অ্যাক্সেস', icon: ClipboardList, color: 'rose' },
                           ].map(r => (
                             <button 
                                key={r.id} 
                                disabled={r.disabled}
                                onClick={() => setShowEditModal({...showEditModal, role: r.id as StaffRole})} 
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                  showEditModal.role === r.id 
                                    ? `bg-${r.color}-500/5 border-${r.color}-500` 
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'
                                } ${r.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                             >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  showEditModal.role === r.id 
                                    ? `bg-${r.color}-500 text-white` 
                                    : `bg-${r.color}-500/10 text-${r.color}-500`
                                }`}>
                                   <r.icon size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                   <p className={`text-[11px] font-black uppercase tracking-widest ${showEditModal.role === r.id ? `text-${r.color}-600` : 'text-slate-900 dark:text-white'}`}>{r.label}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{r.desc}</p>
                                </div>
                                {showEditModal.role === r.id && <div className={`w-4 h-4 bg-${r.color}-500 rounded-full flex items-center justify-center`}><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">{language === 'bn' ? "স্ট্যাটাস" : "Operational Status"}</label>
                        <div className="grid grid-cols-2 gap-3">
                           {['active', 'inactive'].map(s => (
                             <button key={s} onClick={() => setShowEditModal({...showEditModal, status: s as any})} className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${showEditModal.status === s ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">{s === 'active' ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 py-4">
                        <button onClick={() => setShowEditModal(null)} className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">{language === 'bn' ? "বাতিল" : "Cancel"}</button>
                        <button onClick={handleUpdateStaff} className="flex-[2] h-14 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                           {language === 'bn' ? "আপডেট করুন" : "Confirm Update"}
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}

        {showDeleteModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(null)} className="fixed inset-0 bg-slate-950/90 z-100 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[450px] z-110 p-6 lg:p-0">
               <div className="bg-white dark:bg-slate-950 rounded-xl border-2 border-rose-500/20 shadow-2xl p-10 text-center">
                  <div className="w-24 h-24 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner border border-rose-500/20">
                     <AlertCircle size={48} className="animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter  mb-4">⚠️ {language === 'bn' ? "স্টাফ ডিলিট করুন" : "Purge Personnel"}</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400  mb-10">
                     {language === 'bn' ? `আপনি কি নিশ্চিত যে ${showDeleteModal.full_name}-কে সিস্টেম থেকে মুছে ফেলতে চান? এই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।` : `Are you absolutely certain you want to purge ${showDeleteModal.full_name} from the ledger? This action is irreversible.`}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setShowDeleteModal(null)} className="h-14 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">{language === 'bn' ? "বাতিল" : "Abort"}</button>
                     <button onClick={handleDeleteStaff} className="h-14 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all ">{language === 'bn' ? "স্থায়ীভাবে ডিলিট" : "Confirm Purge"}</button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminTeam() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse ">Synchronizing Team Matrix...</p></div>}>
      <AdminTeamContent />
    </Suspense>
  );
}
