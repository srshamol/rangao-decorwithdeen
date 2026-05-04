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

function CategoryManagementContent() {
  const [categories, setCategories] = useState<any[]>([]);
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
    categoriesList.forEach(c => {
      countsMap[c.id] = { products: 0, subs: 0 };
    });

    // Count subs
    categoriesList.forEach(c => {
      if (c.parent_id && countsMap[c.parent_id]) {
        countsMap[c.parent_id].subs += 1;
      }
    });

    // Count products
    const { data: prodData } = await supabase.from("products").select("category");
    if (prodData) {
      prodData.forEach(p => {
        // Find category by name (the product table uses category names)
        // Wait, better to find by ID if possible, but the schema uses category names.
        const cat = categoriesList.find(c => c.name === p.category);
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
      setCategories(categories.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(newStatus === 'active' ? 'ক্যাটাগরি সক্রিয় করা হয়েছে' : 'ক্যাটাগরি নিষ্ক্রিয় করা হয়েছে');
    } else {
      toast.error("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  const handleHomepageToggle = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    const { error } = await supabase.from("categories").update({ show_on_homepage: newVal } as any).eq("id", id);
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, show_on_homepage: newVal } : c));
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

  const filtered = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (c.name_bn && c.name_bn.includes(searchQuery)) ||
                         c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? (c.status === 'active' || c.status === true) : (c.status === 'inactive' || c.status === false));
    const matchesParent = parentFilter === "all" || c.parent_id === parentFilter;
    
    return matchesSearch && matchesStatus && matchesParent;
  });

  if (loading && categories.length === 0) return (
    <div className="space-y-10 pb-32 max-w-[1400px] mx-auto animate-pulse px-6 pt-10">
      <div className="h-10 w-40 bg-slate-100 dark:bg-white/[0.03] rounded-xl mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-white/[0.03] rounded-2xl" />)}
      </div>
      <div className="h-16 bg-slate-100 dark:bg-white/[0.03] rounded-xl" />
      <div className="h-[600px] bg-slate-100 dark:bg-white/[0.03] rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-10 pb-32 max-w-[1400px] mx-auto px-6 pt-10 selection:bg-primary/20 bg-slate-50/30 dark:bg-transparent min-h-screen">
      {/* Breadcrumbs & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <span>হোম</span>
              <ChevronRight size={14} />
              <span className="text-primary/60">ক্যাটাগরি</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">ক্যাটাগরি</h1>
        </div>
        <button 
          onClick={handleAdd} 
          className="px-8 h-14 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all flex items-center gap-3 shadow-2xl shadow-emerald-900/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> নতুন ক্যাটাগরি যোগ করুন
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "মোট ক্যাটাগরি", value: categories.length, sub: "সকল ক্যাটাগরি", icon: LayoutGrid, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "সাব ক্যাটাগরি", value: Object.values(counts).reduce((acc, curr) => acc + curr.subs, 0), sub: "সকল সাব ক্যাটাগরি", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "সক্রিয় ক্যাটাগরি", value: categories.filter(c => c.status === 'active' || c.status === true).length, sub: "প্রকাশিত ক্যাটাগরি", icon: Eye, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "নিষ্ক্রীয় ক্যাটাগরি", value: categories.filter(c => c.status === 'inactive' || c.status === false).length, sub: "আর্কাইভড ক্যাটাগরি", icon: Archive, color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={32} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{stat.value}</p>
              <p className={`text-[10px] font-bold ${stat.color} uppercase tracking-tight`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 p-4 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="relative group flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ক্যাটাগরি সার্চ করুন..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-5 h-14 rounded-xl border border-slate-100 dark:border-white/10">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">স্ট্যাটাস</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                >
                   <option value="all">সব</option>
                   <option value="active">সক্রিয়</option>
                   <option value="inactive">নিষ্ক্রিয়</option>
                </select>
             </div>
             <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-5 h-14 rounded-xl border border-slate-100 dark:border-white/10">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">প্যারেন্ট ক্যাটাগরি</span>
                <select 
                  value={parentFilter} 
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold outline-none cursor-pointer max-w-[150px]"
                >
                   <option value="all">সব</option>
                   {categories.filter(c => !c.parent_id).map(c => (
                     <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
                   ))}
                </select>
             </div>
             <button className="h-14 px-6 bg-emerald-900 text-white rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 transition-all">
                <Filter size={18} /> ফিল্টার
             </button>
             <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
             <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500 scale-105' : 'text-slate-400 hover:text-slate-600'}`}><ListFilter size={20}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500 scale-105' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20}/></button>
             </div>
          </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">ক্যাটাগরি নাম</th>
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">প্যারেন্ট ক্যাটাগরি</th>
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">সাব ক্যাটাগরি</th>
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">প্রোডাক্ট সংখ্যা</th>
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">স্ট্যাটাস</th>
                <th className="px-8 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">হোমপেজ</th>
                <th className="px-8 py-7 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((cat) => {
                const parent = categories.find(c => c.id === cat.parent_id);
                const stats = counts[cat.id] || { products: 0, subs: 0 };
                
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 p-1 group-hover:scale-105 transition-all shadow-sm shrink-0">
                           {cat.image ? (
                             <img src={cat.image} className="w-full h-full object-cover rounded-xl" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300 bg-white dark:bg-slate-800 rounded-xl">
                                {cat.icon ? <span className="text-2xl">{cat.icon}</span> : <Box size={24} />}
                             </div>
                           )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[15px] font-black text-slate-900 dark:text-white mb-0.5 truncate uppercase tracking-tight">{cat.name_bn || cat.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{cat.slug || 'no-slug'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {parent ? (parent.name_bn || parent.name) : '—'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-700 dark:text-slate-300">{stats.subs}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-700 dark:text-slate-300">{stats.products}</span>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => handleStatusToggle(cat.id, cat.status)}
                         className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${cat.status === 'active' || cat.status === true ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                       >
                          <div className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' || cat.status === true ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {cat.status === 'active' || cat.status === true ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                       </button>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => handleHomepageToggle(cat.id, cat.show_on_homepage)}
                         className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.show_on_homepage ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
                       >
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.show_on_homepage ? 'translate-x-4' : 'translate-x-1'}`} />
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(cat)} className="w-10 h-10 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all active:scale-90" title="এডিট করুন">
                             <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="w-10 h-10 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all active:scale-90" title="ডিলিট করুন">
                             <Trash2 size={18} />
                          </button>
                          <a 
                            href={`/shop?category=${cat.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all active:scale-90" 
                            title="স্টোরে দেখুন"
                          >
                             <ExternalLink size={18} />
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
        <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-transparent">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">মোট {filtered.length} টি ক্যাটাগরি</p>
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
        <DialogContent className="max-w-[1200px] w-full p-0 rounded-2xl border-none overflow-hidden bg-white dark:bg-[#0c0c0c] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
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
                             <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
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
                                   <div className={`w-3 h-3 rounded-full ${form.status ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                   <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">সক্রিয়</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setForm(prev => ({...prev, status: !prev.status}))}
                                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${form.status ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${form.status ? 'left-8' : 'left-1'}`} />
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">ক্যাটাগরিটি সাইটে প্রদর্শন করা হবে</p>
                             </div>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mt-4">
                                <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-full ${form.show_on_homepage ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                   <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">হোমপেজে দেখান</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setForm(prev => ({...prev, show_on_homepage: !prev.show_on_homepage}))}
                                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${form.show_on_homepage ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${form.show_on_homepage ? 'left-8' : 'left-1'}`} />
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
                             <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
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
                             <div className="w-1.5 h-6 bg-gold rounded-full" />
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
