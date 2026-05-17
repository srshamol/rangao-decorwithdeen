"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Pencil, Trash2, Search, Image as ImageIcon, LayoutGrid, 
  RefreshCw, Check, X, Loader2, Save, Link as LinkIcon,
  GripVertical, ListFilter, AlertCircle, Upload, ChevronRight,
  Filter, Box, MoreHorizontal, Layers, Eye, Archive, ChevronLeft, ExternalLink
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Category {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  parent_id?: string;
  icon?: string;
  image?: string;
  description?: string;
  sort_order?: number;
  status: string | boolean;
  show_on_homepage: boolean | string;
  meta_title?: string;
  meta_description?: string;
}

function CategoryManagementContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [counts, setCounts] = useState<Record<string, { products: number; subs: number }>>({});

  const [form, setForm] = useState({
    name: "",
    name_bn: "",
    slug: "",
    parent_id: "",
    icon: "",
    image: "",
    description: "",
    sort_order: "0",
    status: true,
    show_on_homepage: false,
    meta_title: "",
    meta_description: ""
  });

  const loadCategories = async () => {
    setLoading(true);
    const { data: catData, error: catError } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    
    if (catError) {
      toast.error("ক্যাটাগরি লোড করা সম্ভব হয়নি");
      setLoading(false);
      return;
    }

    const categoriesList = catData || [];
    setCategories(categoriesList);

    // Fetch subcategory and product counts
    const countsMap: Record<string, { products: number; subs: number }> = {};
    
    // Initialize counts
    categoriesList.forEach((c: any) => {
      countsMap[c.id] = { products: 0, subs: 0 };
    });

    // Count subs
    categoriesList.forEach((c: Category) => {
      if (c.parent_id && countsMap[c.parent_id]) {
        countsMap[c.parent_id].subs += 1;
      }
    });

    // Count products
    const { data: prodData } = await supabase.from("products").select("category");
    if (prodData) {
      prodData.forEach((p: any) => {
        // Find category by name (the product table uses category names)
        // Wait, better to find by ID if possible, but the schema uses category names.
        const cat = categoriesList.find((c: any) => c.name === p.category);
        if (cat) {
          countsMap[cat.id].products += 1;
        }
      });
    }

    setCounts(countsMap);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    setForm(prev => ({ 
      ...prev, 
      name_bn: val, 
      name: val, // Keep English name in sync for now if needed, or just val
      slug 
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, image: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      name_bn: "",
      slug: "",
      parent_id: "",
      icon: "",
      image: "",
      description: "",
      sort_order: String(categories.length + 1),
      status: true,
      show_on_homepage: false,
      meta_title: "",
      meta_description: ""
    });
    setShowModal(true);
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      name_bn: cat.name_bn || "",
      slug: cat.slug || "",
      parent_id: cat.parent_id || "",
      icon: cat.icon || "",
      image: cat.image || "",
      description: cat.description || "",
      sort_order: String(cat.sort_order || 0),
      status: cat.status === 'active' || cat.status === true,
      show_on_homepage: cat.show_on_homepage === true || cat.show_on_homepage === 'true',
      meta_title: cat.meta_title || "",
      meta_description: cat.meta_description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি ডিলিট করতে চান? এটি এই ক্যাটাগরির প্রোডাক্টগুলোতে প্রভাব ফেলতে পারে।")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("ডিলিট করা সম্ভব হয়নি");
    else {
      toast.success("ক্যাটাগরি ডিলিট করা হয়েছে");
      loadCategories();
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string | boolean) => {
    const isActive = currentStatus === 'active' || currentStatus === true;
    const newStatus = isActive ? 'inactive' : 'active';
    const { error } = await supabase.from("categories").update({ status: newStatus } as any).eq("id", id);
    if (!error) {
      setCategories(categories.map((c: Category) => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(newStatus === 'active' ? 'ক্যাটাগরি সক্রিয় করা হয়েছে' : 'ক্যাটাগরি নিষ্ক্রিয় করা হয়েছে');
    } else {
      toast.error("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  const handleHomepageToggle = async (id: string, currentVal: boolean | string) => {
    const isActive = currentVal === true || currentVal === 'true';
    const newVal = !isActive;
    const { error } = await supabase.from("categories").update({ show_on_homepage: newVal } as any).eq("id", id);
    if (!error) {
      setCategories(categories.map((c: Category) => c.id === id ? { ...c, show_on_homepage: newVal } : c));
      toast.success(newVal ? 'হোমপেজে দেখানো হবে' : 'হোমপেজ থেকে সরানো হয়েছে');
    } else {
      toast.error("পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      name: form.name,
      name_bn: form.name_bn,
      slug: form.slug,
      parent_id: form.parent_id || null,
      icon: form.icon || null,
      image: form.image || null,
      description: form.description || null,
      sort_order: Number(form.sort_order),
      status: form.status ? 'active' : 'inactive',
      show_on_homepage: form.show_on_homepage,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null
    };

    let error;
    if (editingId) {
      const res = await supabase.from("categories").update(data as any).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("categories").insert(data as any);
      error = res.error;
    }

    if (error) {
      toast.error("সেভ করা সম্ভব হয়নি: " + error.message);
    } else {
      toast.success("ক্যাটাগরি সফলভাবে সেভ করা হয়েছে");
      setShowModal(false);
      loadCategories();
    }
    setSaving(false);
  };

  const handleReorder = async (newOrder: any[]) => {
    setCategories(newOrder);
    const updates = newOrder.map((cat, index) => ({
      id: cat.id,
      sort_order: index + 1
    }));
    const { error } = await supabase.from("categories").upsert(updates as any);
    if (error) toast.error("অর্ডার সেভ করা সম্ভব হয়নি");
  };

  const filtered = categories.filter((c: Category) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (c.name_bn && c.name_bn.includes(searchQuery)) ||
                         c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? (c.status === 'active' || c.status === true) : (c.status === 'inactive' || c.status === false));
    const matchesParent = parentFilter === "all" || c.parent_id === parentFilter;
    return matchesSearch && matchesStatus && matchesParent;
  });

  if (loading && categories.length === 0) return (
    <div className="space-y-4 pb-32 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-24 bg-primary/20 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-white/[0.03] rounded-xl" />)}
      </div>
      <div className="h-16 bg-slate-100 dark:bg-white/[0.03] rounded-xl" />
      <div className="h-[500px] bg-slate-100 dark:bg-white/[0.03] rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-4 pb-32 max-w-[1400px] mx-auto selection:bg-primary/20">
      {/* Header Banner */}
      <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Category Management</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-xl animate-pulse" />
                <p className="text-xs text-white/60">{categories.length} categories total</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 bg-white text-primary rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-white/90 transition-all shadow-sm"
          >
            <Plus size={15} /> New Category
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: categories.length, icon: LayoutGrid, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Sub Categories", value: Object.values(counts).reduce((acc, curr) => acc + curr.subs, 0), icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Active", value: categories.filter((c: Category) => c.status === 'active' || c.status === true).length, icon: Eye, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
          { label: "Inactive", value: categories.filter((c: Category) => c.status === 'inactive' || c.status === false).length, icon: Archive, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-4 hover:shadow-sm transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 truncate mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/5 p-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-medium outline-none dark:text-slate-300"
             >
               <option value="all">All Status</option>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
             </select>
             <select
               value={parentFilter}
               onChange={(e) => setParentFilter(e.target.value)}
               className="h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-medium outline-none dark:text-slate-300"
             >
               <option value="all">All Parents</option>
               {categories.filter((c: Category) => !c.parent_id).map((c: Category) => (
                 <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
               ))}
             </select>
             <button className="h-9 px-3 bg-primary text-white rounded-xl flex items-center gap-1.5 text-xs font-medium hover:bg-primary/90 transition-all">
               <Filter size={13} /> Filter
             </button>
          </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Parent</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Subs</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Products</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Homepage</th>
                <th className="px-5 py-3 text-right text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((cat) => {
                const parent = categories.find(c => c.id === cat.parent_id);
                const stats = counts[cat.id] || { products: 0, subs: 0 };
                
                return (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                           {cat.image ? (
                             <img src={cat.image} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300">
                                {cat.icon ? <span className="text-sm">{cat.icon}</span> : <Box size={14} />}
                             </div>
                           )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{cat.name_bn || cat.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cat.slug || 'no-slug'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                       <span className="text-xs text-slate-500 dark:text-slate-400">
                          {parent ? (parent.name_bn || parent.name) : '—'}
                       </span>
                    </td>
                    <td className="px-5 py-3">
                       <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{stats.subs}</span>
                    </td>
                    <td className="px-5 py-3">
                       <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{stats.products}</span>
                    </td>
                     <td className="px-5 py-3">
                        <button
                          onClick={() => handleStatusToggle(cat.id, cat.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-medium transition-all ${cat.status === "active" || cat.status === true ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}
                        >
                           <div className={`w-1.5 h-1.5 rounded-xl ${cat.status === "active" || cat.status === true ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                           {cat.status === "active" || cat.status === true ? "Active" : "Inactive"}
                        </button>
                     </td>
                     <td className="px-5 py-3">
                        <button
                          onClick={() => handleHomepageToggle(cat.id, cat.show_on_homepage)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-xl transition-colors ${cat.show_on_homepage ? "bg-primary" : "bg-slate-200 dark:bg-white/10"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-xl bg-white transition-transform ${cat.show_on_homepage ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                     </td>
                     <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                           <button onClick={() => handleEdit(cat)} className="w-8 h-8 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" title="Edit">
                              <Pencil size={13} />
                           </button>
                           <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Delete">
                              <Trash2 size={13} />
                           </button>
                           <a href={`/shop?category=${cat.slug}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all" title="View">
                              <ExternalLink size={13} />
                           </a>
                        </div>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
           <p className="text-[10px] font-medium text-slate-400">{filtered.length} categories</p>
           <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-30" disabled>
                 <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                 {[1, 2, 3].map(p => (
                   <button key={p} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${p === 1 ? 'bg-emerald-900 text-white shadow-xl shadow-emerald-900/20' : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'}`}>
                     {p}
                   </button>
                 ))}
                 <span className="text-slate-300 mx-1">...</span>
                 <button className="w-10 h-10 rounded-xl text-xs font-black text-slate-400 hover:bg-white dark:hover:bg-white/5">6</button>
              </div>
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all">
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* Category Modular Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[1200px] w-full p-0 rounded-xl border-none overflow-hidden bg-white dark:bg-[#0c0c0c] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
           <VisuallyHidden><DialogTitle>Category Configuration</DialogTitle></VisuallyHidden>
           
           {/* Modal Header */}
           <div className="px-10 py-7 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0c0c0c]">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                    <LayoutGrid size={28} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                      {editingId ? 'ক্যাটাগরি তথ্য আপডেট করুন' : 'নতুন প্রোডাক্ট ক্যাটাগরি যোগ করুন'}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {editingId ? 'বিদ্যমান প্রোডাক্ট ক্যাটাগরি পরিবর্তন করুন' : 'একটি নতুন প্রোডাক্ট ক্যাটাগরি তৈরি করুন'}
                    </p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all">
                <X size={24} className="text-slate-400" />
              </button>
           </div>
           
           <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
              <form onSubmit={handleSubmit} className="p-10">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Side: Main Form */}
                    <div className="lg:col-span-7 space-y-10">
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-6 bg-emerald-500 rounded-xl" />
                             <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">ক্যাটাগরি তথ্য</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ক্যাটাগরি নাম *</label>
                                <input 
                                  required 
                                  value={form.name_bn} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!editingId) {
                                      handleNameChange(val);
                                    } else {
                                      setForm(prev => ({ ...prev, name_bn: val }));
                                    }
                                  }} 
                                  className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
                                  placeholder="যেমন: ইসলামিক ওয়াল আর্ট" 
                                />
                             </div>
                             
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">স্ল্যাগ (SLUG) *</label>
                                <div className="relative group">
                                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                   <input 
                                     required 
                                     value={form.slug} 
                                     onChange={(e) => setForm(prev => ({...prev, slug: e.target.value}))} 
                                     className="w-full h-12 pl-12 pr-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
                                     placeholder="যেমন: islamic-wall-art" 
                                   />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">URL এর জন্য ব্যবহার হবে। ইংরেজিতে ও হাইফেন ব্যবহার করবেন।</p>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)</label>
                                <div className="relative group">
                                   <select 
                                     value={form.parent_id} 
                                     onChange={(e) => setForm(prev => ({...prev, parent_id: e.target.value}))} 
                                     className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner appearance-none"
                                   >
                                      <option value="">কোন প্যারেন্ট ক্যাটাগরি নেই</option>
                                      {categories.filter(c => c.id !== editingId).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name_bn || cat.name}</option>
                                      ))}
                                   </select>
                                   <ListFilter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">এই ক্যাটাগরি কোন মূল ক্যাটাগরির অন্তর্ভুক্ত হলে নির্বাচন করুন।</p>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">বর্ণনা (ঐচ্ছিক)</label>
                                <div className="relative">
                                  <textarea 
                                    value={form.description} 
                                    onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))} 
                                    className="w-full h-28 p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner resize-none" 
                                    placeholder="এই ক্যাটাগরির সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..." 
                                    maxLength={300}
                                  />
                                  <div className="absolute bottom-3 right-4 text-[9px] font-bold text-slate-400">{form.description?.length || 0}/300</div>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 flex-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">আইকন (ঐচ্ছিক)</label>
                                   <div className="relative group">
                                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                      <input 
                                        value={form.icon} 
                                        onChange={(e) => setForm(prev => ({...prev, icon: e.target.value}))} 
                                        className="w-full h-12 pl-12 pr-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
                                        placeholder="আইকন নির্বাচন করুন" 
                                      />
                                   </div>
                                </div>
                                <div className="flex flex-col justify-end">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-2">SVG, PNG বা JPG ফাইল (সর্বোচ্চ 2MB)</p>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ক্যাটাগরি ইমেজ *</label>
                                <div className="grid grid-cols-1 gap-4">
                                   {form.image ? (
                                     <div className="relative group/img aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                                        <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-3">
                                           <button type="button" onClick={() => setForm(prev => ({ ...prev, image: "" }))} className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-xl"><Trash2 size={18} /></button>
                                        </div>
                                     </div>
                                   ) : (
                                     <label className="cursor-pointer">
                                        <div className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all group/box bg-slate-50 dark:bg-white/5 shadow-inner">
                                           {uploading ? (
                                              <Loader2 className="animate-spin text-emerald-500" size={32} />
                                           ) : (
                                              <>
                                                 <Upload className="text-slate-300 group-hover/box:text-emerald-500 transition-all mb-3" size={32} />
                                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover/box:text-emerald-500">ছবি আপলোড করুন</span>
                                                 <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">PNG, JPG, WEBP (সর্বোচ্চ 2MB) | সেরা সাইজ: 800x800px</span>
                                              </>
                                           )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                     </label>
                                   )}
                                </div>
                             </div>

                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-xl ${form.status ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                   <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">সক্রিয়</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setForm(prev => ({...prev, status: !prev.status}))}
                                  className={`w-14 h-7 rounded-xl relative transition-all duration-300 ${form.status ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-xl transition-all duration-300 shadow-lg ${form.status ? 'left-8' : 'left-1'}`} />
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">ক্যাটাগরিটি সাইটে প্রদর্শন করা হবে</p>
                             </div>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mt-4">
                                <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-xl ${form.show_on_homepage ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                   <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">হোমপেজে দেখান</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setForm(prev => ({...prev, show_on_homepage: !prev.show_on_homepage}))}
                                  className={`w-14 h-7 rounded-xl relative transition-all duration-300 ${form.show_on_homepage ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-xl transition-all duration-300 shadow-lg ${form.show_on_homepage ? 'left-8' : 'left-1'}`} />
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">হোমপেজে এই ক্যাটাগরিটি থাকবে</p>
                             </div>
                          </div>
                       </section>
                    </div>

                    {/* Right Side: Preview & SEO */}
                    <div className="lg:col-span-5 space-y-10">
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-6 bg-blue-500 rounded-xl" />
                             <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">প্রিভিউ</h3>
                          </div>
                          
                          <div className="bg-slate-50/50 dark:bg-white/2 rounded-xl p-12 border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-inner min-h-[400px]">
                             {/* Homepage Preview Card */}
                             <div className="w-64 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl flex flex-col items-center transform scale-110">
                                <div className="w-full aspect-square mb-6 relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50">
                                   {form.image ? (
                                     <img src={form.image} className="w-full h-full object-contain p-2" alt="Preview" />
                                   ) : (
                                     <ImageIcon size={48} className="text-slate-200" />
                                   )}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 text-center line-clamp-1">
                                   {form.name_bn || 'ক্যাটাগরি নাম'}
                                </h3>
                                <div className="flex items-center gap-1 text-[13px] font-bold text-[#0F3D2E] dark:text-emerald-400 opacity-60">
                                   দেখুন <ChevronRight size={14} strokeWidth={3} />
                                </div>
                             </div>
                          </div>
                       </section>

                       <section className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-6 bg-gold rounded-xl" />
                             <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">SEO সেটিংস (ঐচ্ছিক)</h3>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">মেটা টাইটেল</label>
                                <input 
                                  value={form.meta_title} 
                                  onChange={(e) => setForm(prev => ({...prev, meta_title: e.target.value}))} 
                                  className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 transition-all shadow-inner" 
                                  placeholder="যেমন: ইসলামিক ওয়াল আর্ট - Rangao" 
                                />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">সার্চ ইঞ্জিনে প্রদর্শিত হবে (সর্বোচ্চ 60 অক্ষর)</p>
                             </div>
                             
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">মেটা ডেসক্রিপশন</label>
                                <textarea 
                                  value={form.meta_description} 
                                  onChange={(e) => setForm(prev => ({...prev, meta_description: e.target.value}))} 
                                  className="w-full h-32 p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 transition-all shadow-inner resize-none" 
                                  placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ লিখুন..." 
                                />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">সার্চ ইঞ্জিনে প্রদর্শিত হবে (সর্বোচ্চ 160 অক্ষর)</p>
                             </div>
                          </div>
                       </section>
                    </div>
                 </div>

                 {/* Modal Footer */}
                 <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="px-8 h-12 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                    >
                      বাতিল করুন
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving || uploading} 
                      className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                       {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                       সংরক্ষণ করুন
                    </button>
                 </div>
              </form>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CategoryManagement() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <CategoryManagementContent />
    </Suspense>
  );
}
