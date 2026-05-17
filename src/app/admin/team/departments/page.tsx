"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Edit2, Trash2, Search, Users,
  X, Check, ChevronRight, Briefcase, BarChart3,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  memberCount: number;
  color: string;
  description: string;
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: "1", name: "General", code: "GEN", head: "Super Admin", memberCount: 2, color: "#10b981", description: "General administration and overall operations." },
  { id: "2", name: "Sales", code: "SLS", head: "—", memberCount: 0, color: "#3b82f6", description: "Handles customer acquisition and order conversion." },
  { id: "3", name: "Logistics", code: "LOG", head: "—", memberCount: 0, color: "#f59e0b", description: "Manages delivery and courier coordination." },
  { id: "4", name: "Finance", code: "FIN", head: "—", memberCount: 0, color: "#8b5cf6", description: "Oversees accounting, revenue tracking, and reporting." },
  { id: "5", name: "Support", code: "SUP", head: "—", memberCount: 0, color: "#ef4444", description: "Handles customer inquiries, complaints, and tickets." },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#64748b"];

export default function DepartmentsPage() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", color: "#10b981" });

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", description: "", color: "#10b981" });
    setShowModal(true);
  };

  const openEdit = (dep: Department) => {
    setEditing(dep);
    setForm({ name: dep.name, code: dep.code, description: dep.description, color: dep.color });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and Code are required.");
      return;
    }
    if (editing) {
      setDepartments(prev => prev.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast.success("Department updated.");
    } else {
      const newDep: Department = {
        id: Date.now().toString(),
        name: form.name,
        code: form.code.toUpperCase(),
        head: "—",
        memberCount: 0,
        color: form.color,
        description: form.description,
      };
      setDepartments(prev => [...prev, newDep]);
      toast.success("Department created.");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    setDeleteId(null);
    toast.success("Department deleted.");
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Green Header Banner */}
      <div className="bg-primary rounded-xl p-5 text-white relative overflow-hidden shadow-lg"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 70%), var(--primary)' }}>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-xl blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">
                <Link href="/admin/team" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft size={10} /> Team Management
                </Link>
                <ChevronRight size={10} />
                <span className="text-white">Departments</span>
              </div>
              <h1 className="text-xl font-black tracking-tight">Department Management</h1>
              <p className="text-white/60 text-[11px] font-medium mt-0.5">
                {departments.length} departments · {departments.reduce((a, d) => a + d.memberCount, 0)} total members
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-10 px-5 bg-white text-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shrink-0"
          >
            <Plus size={15} /> New Department
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Depts", value: departments.length, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Total Members", value: departments.reduce((a, d) => a + d.memberCount, 0), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Heads", value: departments.filter(d => d.head !== "—").length, icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg. Size", value: departments.length ? (departments.reduce((a, d) => a + d.memberCount, 0) / departments.length).toFixed(1) : 0, icon: BarChart3, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">
            {filtered.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                {["Department", "Code", "Head", "Members", "Description", "Actions"].map(col => (
                  <th key={col} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filtered.map(dep => (
                <motion.tr
                  key={dep.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black shadow-sm"
                        style={{ backgroundColor: dep.color }}>
                        {dep.code.slice(0, 2)}
                      </div>
                      <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{dep.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                      {dep.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">{dep.head}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{dep.memberCount}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-[200px]">
                    <p className="text-[10px] font-medium text-slate-400 truncate">{dep.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(dep)}
                        className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(dep.id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Building2 size={32} className="text-slate-200 dark:text-white/10 mx-auto mb-3" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No departments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 20 }}
              className="relative z-10 bg-white dark:bg-[#0c0c0c] rounded-xl border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editing ? "Edit Department" : "New Department"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {editing ? `Editing: ${editing.name}` : "Add a new team department"}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Marketing"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-10 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. MKT"
                      maxLength={5}
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="w-full h-10 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Color</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setForm(f => ({ ...f, color: c }))}
                          className="w-7 h-7 rounded-xl transition-transform hover:scale-110 relative"
                          style={{ backgroundColor: c }}
                        >
                          {form.color === c && <Check size={13} className="text-white absolute inset-0 m-auto" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of this department..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="h-9 px-5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} className="h-9 px-5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Check size={14} />
                  {editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="relative z-10 bg-white dark:bg-[#0c0c0c] rounded-xl border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Delete Department?</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-1">This action cannot be undone. Members will be unassigned.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-rose-500/20">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
