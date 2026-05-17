"use client";

import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, Suspense, useRef } from "react";
import { 
  User, Mail, Phone, Shield, Lock, 
  Key, Save, Loader2, Camera, LogIn,
  Activity, CheckCircle2, AlertCircle,
  Clock, ShieldCheck, Zap, AtSign
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

function AdminProfileContent() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    email: "",
    phone: "",
    role: "production",
    created_at: "",
  });

  // Password Change State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [changingPass, setChangingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setSession(session);
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('staff_profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', session.user.id).single()
      ]);
      
      if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          role: roleRes.data?.role || 'production'
        });
      } else {
        // Fallback for initial setup
        setProfile({
          full_name: session.user.email?.split('@')[0] || "User",
          email: session.user.email || "",
          username: session.user.user_metadata?.username || "",
          role: roleRes.data?.role || 'production',
          created_at: session.user.created_at
        });
      }
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('staff_profiles')
        .upsert({
          id: session.user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone
        })
        .select('*')
        .single();

      if (updateError) throw updateError;

      if (updatedData) {
        setProfile((prev: any) => ({
          ...prev,
          ...updatedData,
          role: prev.role
        }));
      }

      toast.success(t("profile_saved"));
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(t("profile_update_failed") + ": " + (err.message || "Permission error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('staff_profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success(t("avatar_updated"));
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(t("upload_failed"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error(t("passwords_mismatch"));
      return;
    }
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("password_changed"));
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setChangingPass(false);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'super_admin': return { label: t('super_admin'), color: 'text-[#C9A24D]', bg: 'bg-[#C9A24D]/10', icon: ShieldCheck };
      case 'admin': return { label: t('admin_role'), color: 'text-[#52B788]', bg: 'bg-[#52B788]/10', icon: Shield };
      case 'moderator': return { label: t('moderator'), color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', icon: Zap };
      default: return { label: t('production'), color: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10', icon: Activity };
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t("syncing_profile")}</p>
    </div>
  );

  const roleConfig = getRoleConfig(profile.role);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 selection:bg-primary/20">
      {/* Header Banner - Signature Style */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-primary/20 rounded-xl p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-xl blur-[120px] -mr-[250px] -mt-[250px] opacity-60" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-xl blur-[100px] -ml-[150px] -mb-[150px] opacity-30" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
               <div className="w-36 h-36 rounded-xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-5xl font-black border border-white/10 shadow-2xl group-hover:scale-105 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover relative z-10" />
                  ) : (
                    <span className="relative z-10">{profile.full_name[0]?.toUpperCase()}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                  )}
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleAvatarUpload} 
                 className="hidden" 
                 accept="image/*" 
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={uploadingAvatar}
                 className="absolute -bottom-3 -right-3 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-2xl border-4 border-slate-950 hover:rotate-12 hover:scale-110 transition-all group/cam disabled:opacity-50"
               >
                  {uploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} className="group-hover/cam:scale-110 transition-transform" />}
               </button>
            </div>
            <div className="text-center md:text-left space-y-4">
               <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{profile.full_name}</h1>
                     <div className={`px-4 py-1.5 ${roleConfig.bg} ${roleConfig.color} rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 backdrop-blur-xl shadow-xl`}>
                        <roleConfig.icon size={12} className="animate-pulse" />
                        {roleConfig.label}
                     </div>
                  </div>
                  <p className="text-sm font-bold text-white/30 uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-3">
                     <Clock size={14} className="text-primary/50" /> 
                     {t("member_since")} 
                     <span className="text-white/60">{new Date(profile.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("verified_identity")}</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                    <Zap size={14} className="text-gold" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("active_node")}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Profile Form */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group/card">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner group-hover/card:scale-110 transition-transform duration-500">
                  <User size={22} />
               </div>
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{t("personal_info")}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{t("basic_profile_settings")}</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("full_name")}</label>
                  <div className="relative group/input">
                     <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-primary transition-colors" size={18} />
                     <input 
                       required 
                       value={profile.full_name} 
                       onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all shadow-inner" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("username")}</label>
                  <div className="relative opacity-40 grayscale-[0.5]">
                     <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       disabled 
                       value={profile.username || "NOT_SET"} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold outline-none cursor-not-allowed" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("email")}</label>
                  <div className="relative opacity-40 grayscale-[0.5]">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       disabled 
                       value={profile.email} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold outline-none cursor-not-allowed" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("phone_number")}</label>
                  <div className="relative group/input">
                     <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-primary transition-colors" size={18} />
                     <input 
                       value={profile.phone || ""} 
                       onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all shadow-inner" 
                       placeholder="01XXXXXXXXX"
                     />
                  </div>
               </div>

               <button disabled={saving} type="submit" className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4 group/btn overflow-hidden relative active:scale-95">
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-3">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover/btn:scale-110 transition-transform" />}
                    {t("save_profile")}
                  </span>
               </button>
            </form>
         </div>

         {/* Password Form */}
         <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group/card">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gold/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold shadow-inner group-hover/card:scale-110 transition-transform duration-500">
                  <Key size={22} />
               </div>
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{t("access_security")}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{t("update_access_credentials")}</p>
               </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("existing_key")}</label>
                  <div className="relative group/input">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-gold transition-colors" size={18} />
                     <input 
                       type="password" 
                       required 
                       value={passwords.current} 
                       onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold/20 transition-all shadow-inner" 
                       placeholder="••••••••"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("new_secure_key")}</label>
                  <div className="relative group/input">
                     <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-gold transition-colors" size={18} />
                     <input 
                       type="password" 
                       required 
                       value={passwords.new} 
                       onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold/20 transition-all shadow-inner" 
                       placeholder="••••••••"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("verify_new_key")}</label>
                  <div className="relative group/input">
                     <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-gold transition-colors" size={18} />
                     <input 
                       type="password" 
                       required 
                       value={passwords.confirm} 
                       onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                       className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold/20 transition-all shadow-inner" 
                       placeholder="••••••••"
                     />
                  </div>
               </div>

               <button disabled={changingPass} type="submit" className="w-full h-14 bg-linear-to-r from-amber-500 to-gold text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-gold/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95 group/btn">
                  {changingPass ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                  {t("update_password")}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t("syncing_profile")}</p></div>}>
      <AdminProfileContent />
    </Suspense>
  );
}
