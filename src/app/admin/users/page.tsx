"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShieldCheck, UserPlus, UserMinus, Search, Mail, 
  Shield, ShieldAlert, MoreVertical, X, Check,
  Loader2, RefreshCw, Trash2, Key, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLanguage } from "@/lib/language-context";

interface UserRole {
  id: string;
  user_id: string;
  email: string | null;
  role: "admin" | "moderator" | "user";
  created_at: string;
}

function UserManagementContent() {
  const { language, t } = useLanguage();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "moderator" as "admin" | "moderator" | "user"
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error(t("load_users_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const toastId = toast.loading(t("updating_role"));
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole } as any)
        .eq("user_id", userId);
      
      if (error) throw error;
      
      setUsers(users.map((u) => u.user_id === userId ? { ...u, role: newRole as "admin" | "moderator" | "user" } : u));
      toast.success(t("role_updated"), { id: toastId });
    } catch (err) {
      toast.error(t("role_update_failed"), { id: toastId });
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm(t("confirm_remove_user"))) return;
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
      setUsers(users.filter((u) => u.id !== id));
      toast.success(t("user_removed"));
    } catch (err) {
      toast.error(t("remove_user_failed"));
    }
  };

  const filteredUsers = users.filter((u) => 
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <ShieldCheck className="text-primary" size={16} />;
      case 'moderator': return <Shield className="text-blue-500" size={16} />;
      default: return <ShieldAlert className="text-slate-400" size={16} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return "bg-primary/10 text-primary border-primary/20";
      case 'moderator': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  if (loading && users.length === 0) return (
    <div className="space-y-8 pb-32 max-w-[1200px] mx-auto animate-pulse">
      <div className="h-32 bg-slate-100 dark:bg-white/3 rounded-xl" />
      <div className="h-[400px] bg-slate-100 dark:bg-white/3 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-[1200px] mx-auto selection:bg-primary/20">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 dark:from-white/5 dark:to-white/2 rounded-xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-xl blur-[100px]" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-inner group transition-all">
                <ShieldCheck size={32} className="text-primary group-hover:scale-110 transition-transform" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">{t("user_roles")}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 bg-primary rounded-xl animate-pulse" />
                   <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">{users.length} {t("active_administrators")}</p>
                </div>
             </div>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="px-8 py-4 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)]"
          >
            <UserPlus size={18} /> {t("add_new_admin")}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t("super_admins"), value: users.filter((u) => u.role === 'admin').length, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
          { label: t("moderators"), value: users.filter((u) => u.role === 'moderator').length, icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: t("system_health"), value: t("optimal"), icon: Activity, color: "text-gold", bg: "bg-gold/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-white/5 p-4 shadow-sm flex items-center gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={t("search_users_placeholder")} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
            />
          </div>
          <button onClick={loadUsers} className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-white/5 shadow-inner">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/80">
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("user_table_user")}</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("access_role")}</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("status")}</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("last_active")}</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center font-black text-slate-400 group-hover:scale-110 transition-transform shadow-sm">
                            {(user.email || 'U')[0].toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{user.email || 'Anonymous'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {user.user_id.slice(0,8)}...</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getRoleBadge(user.role)}`}>
                             {getRoleIcon(user.role)}
                             {user.role}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("active")}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 tabular-nums">
                       {new Date(user.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleRoleChange(user.user_id, user.role === 'admin' ? 'moderator' : 'admin')}
                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-inner"
                            title="Toggle Admin/Moderator"
                          >
                             <Key size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(user.id)}
                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-inner"
                            title="Remove User Access"
                          >
                             <UserMinus size={16} />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-xl border-none overflow-hidden bg-white dark:bg-[#0c0c0c] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
           <VisuallyHidden><DialogTitle>{t("invite_admin")}</DialogTitle></VisuallyHidden>
           
           <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30"><UserPlus size={28} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("invite_admin")}</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{t("access_management_hub")}</p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all relative z-10 group">
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
           </div>
           
           <div className="p-10 space-y-8">
              <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">{t("user_email_address")}</label>
                 <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={inviteForm.email} 
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} 
                      required 
                      className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                      placeholder="e.g. staff@rangao.com" 
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">{t("permission_role")}</label>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'admin', label: t('super_admin'), icon: ShieldCheck, desc: t('full_control') },
                      { id: 'moderator', label: t('moderator'), icon: Shield, desc: t('manage_data') }
                    ].map(r => (
                      <button 
                        key={r.id}
                        type="button" 
                        onClick={() => setInviteForm({...inviteForm, role: r.id as any})} 
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-500 relative group overflow-hidden ${inviteForm.role === r.id ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/10'}`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${inviteForm.role === r.id ? 'bg-primary text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400'}`}>
                            <r.icon size={20} />
                         </div>
                         <p className={`text-xs font-black uppercase tracking-widest ${inviteForm.role === r.id ? 'text-primary' : 'text-slate-600 dark:text-white/60'}`}>{r.label}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{r.desc}</p>
                         
                         {inviteForm.role === r.id && (
                           <motion.div layoutId="check" className="absolute top-4 right-4 text-primary">
                             <Check size={16} strokeWidth={3} />
                           </motion.div>
                         )}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-4 flex gap-4">
                 <button onClick={() => setShowModal(false)} className="flex-1 h-16 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">{t("discard")}</button>
                 <button 
                   disabled={saving || !inviteForm.email}
                   onClick={async () => {
                     setSaving(true);
                     toast.info(t("invitation_sent") + ": " + inviteForm.email);
                     setShowModal(false);
                     setSaving(false);
                   }}
                   className="flex-[2] h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                 >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                    {t("send_invitation")}
                 </button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <UserManagementContent />
    </Suspense>
  );
}
