"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Image as ImageIcon, Upload, Trash2, Copy, Search, 
  Filter, MoreVertical, Loader2, CheckCircle2, 
  AlertCircle, ExternalLink, RefreshCcw, FolderOpen,
  Grid, List as ListIcon, HardDrive, Download, X,
  Video, FileText, MoreHorizontal, Share2, Move,
  ChevronDown, ArrowUpDown, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  url: string;
  isFolder?: boolean;
  fullPath?: string;
  folderStats?: {
    size: number;
    count: number;
    latestDate: string;
  } | null;
}

const INITIAL_BUCKETS = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'store-assets', label: 'Store Assets' },
  { id: 'profiles', label: 'Profiles' },
];

export default function AdminMedia() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [buckets, setBuckets] = useState(INITIAL_BUCKETS);
  const [activeBucket, setActiveBucket] = useState(searchParams.get('bucket') || INITIAL_BUCKETS[0].id);
  const [currentPath, setCurrentPath] = useState(searchParams.get('path') || "");
  const [activeType, setActiveType] = useState('all');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [stats, setStats] = useState({
    all: 0,
    image: 0,
    video: 0,
    document: 0,
    other: 0,
    totalSize: 0,
    globalTotalSize: 0
  });

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeBucket) params.set('bucket', activeBucket);
    if (currentPath) params.set('path', currentPath);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeBucket, currentPath]);

  const fetchBuckets = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      if (data && data.length > 0) {
        const mappedBuckets = data.map((b: any) => ({
          id: b.id,
          label: b.name.charAt(0).toUpperCase() + b.name.slice(1).replace(/-/g, ' ')
        }));
        setBuckets(mappedBuckets);
      } else {
        setBuckets(INITIAL_BUCKETS);
      }
    } catch (err) {
      console.error("Error listing buckets:", err);
      setBuckets(INITIAL_BUCKETS);
    }
  };

  const fetchGlobalStats = async (bucketList = buckets) => {
    try {
      let total = 0;

      const getFolderSize = async (bucketId: string, path: string = '') => {
        let folderSize = 0;
        try {
          const { data } = await supabase.storage.from(bucketId).list(path, { limit: 100 });
          if (data) {
            for (const item of data) {
              if (item.id === null) { // Folder
                folderSize += await getFolderSize(bucketId, `${path ? path + '/' : ''}${item.name}`);
              } else {
                folderSize += item.metadata?.size || 0;
              }
            }
          }
        } catch (e) {
          console.warn(`Could not access bucket/folder: ${bucketId}/${path}`);
        }
        return folderSize;
      };

      for (const bucket of bucketList) {
        total += await getFolderSize(bucket.id);
      }
      setStats(prev => ({ ...prev, globalTotalSize: total }));
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(activeBucket).list(currentPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) throw error;

      if (data) {
        // Fetch detailed recursive stats for each folder in this view
        const enrichedFiles = await Promise.all(data.map(async (file: any) => {
          const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
          const { data: { publicUrl } } = supabase.storage.from(activeBucket).getPublicUrl(fullPath);
          
          const isFolder = file.id === null || !file.metadata;
          let folderInfo = null;
          
          if (isFolder) {
            // Get recursive stats for this folder
            const getStats = async (path: string) => {
              const { data: list } = await supabase.storage.from(activeBucket).list(path);
              let size = 0;
              let count = 0;
              let latestDate = file.updated_at;
              
              if (list) {
                for (const item of list) {
                  if (item.id === null) {
                    const sub = await getStats(`${path}/${item.name}`);
                    size += sub.size;
                    count += sub.count;
                  } else {
                    size += item.metadata?.size || 0;
                    count += 1;
                    if (!latestDate || new Date(item.updated_at) > new Date(latestDate)) {
                      latestDate = item.updated_at;
                    }
                  }
                }
              }
              return { size, count, latestDate };
            };
            folderInfo = await getStats(fullPath);
          }

          return { 
            ...file, 
            url: publicUrl, 
            fullPath,
            id: file.id || 'folder-' + file.name,
            isFolder,
            folderStats: folderInfo,
            updated_at: folderInfo?.latestDate || file.updated_at
          } as any;
        }));
        
        setFiles(enrichedFiles);
        
        // Fetch global recursive counts for tabs
        const getRecursiveCounts = async (path: string = '') => {
          const { data: list } = await supabase.storage.from(activeBucket).list(path);
          let counts = { all: 0, image: 0, video: 0, document: 0, other: 0 };
          
          if (list) {
            for (const item of list) {
              if (item.id === null) {
                const sub = await getRecursiveCounts(path ? `${path}/${item.name}` : item.name);
                counts.all += sub.all;
                counts.image += sub.image;
                counts.video += sub.video;
                counts.document += sub.document;
                counts.other += sub.other;
              } else {
                counts.all++;
                const mime = item.metadata?.mimetype || '';
                if (mime.startsWith('image/')) counts.image++;
                else if (mime.startsWith('video/')) counts.video++;
                else if (mime.includes('pdf') || mime.includes('doc')) counts.document++;
                else counts.other++;
              }
            }
          }
          return counts;
        };

        const recursiveCounts = await getRecursiveCounts();
        
        setStats(prev => ({ 
          ...recursiveCounts,
          totalSize: enrichedFiles.reduce((acc: number, f: any) => acc + (f.isFolder ? f.folderStats?.size : (f.metadata?.size || 0)), 0),
          globalTotalSize: prev.globalTotalSize 
        }));
      }
    } catch (error: any) {
      console.error("Error fetching files:", error);
      toast.error(error.message || "Failed to fetch files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      let currentBuckets = buckets;
      const { data } = await supabase.storage.listBuckets();
      if (data && data.length > 0) {
        currentBuckets = data.map((b: any) => ({
          id: b.id,
          label: b.name.charAt(0).toUpperCase() + b.name.slice(1).replace(/-/g, ' ')
        }));
        setBuckets(currentBuckets);
      }
      fetchGlobalStats(currentBuckets);
      fetchFiles();
    };
    init();
  }, [activeBucket, currentPath]);

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
    setSelectedIds([]);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
    setSelectedIds([]);
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(activeBucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success(language === 'bn' ? "ফাইল আপলোড সফল হয়েছে" : "File uploaded successfully");
      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই ফাইলটি মুছে ফেলতে চান?" : "Are you sure you want to delete this file?")) return;

    try {
      const { error } = await supabase.storage.from(activeBucket).remove([fileName]);
      if (error) throw error;

      toast.success(language === 'bn' ? "ফাইল মুছে ফেলা হয়েছে" : "File deleted successfully");
      fetchFiles();
      if (selectedFile?.name === fileName) setSelectedFile(null);
      setSelectedIds(prev => prev.filter(id => id !== fileName));
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected files?`)) return;

    try {
      const { error } = await supabase.storage.from(activeBucket).remove(selectedIds);
      if (error) throw error;

      toast.success("Batch delete successful");
      fetchFiles();
      setSelectedIds([]);
    } catch (error: any) {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(language === 'bn' ? "লিঙ্ক কপি করা হয়েছে" : "Link copied to clipboard");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const typeFilteredFiles = files.filter((f: any) => {
    if (activeType === 'all') return true;
    if (activeType === 'image') return f.metadata?.mimetype?.startsWith('image/');
    if (activeType === 'video') return f.metadata?.mimetype?.startsWith('video/');
    if (activeType === 'document') return f.metadata?.mimetype?.includes('pdf') || f.metadata?.mimetype?.includes('doc');
    return !f.metadata?.mimetype?.startsWith('image/') && !f.metadata?.mimetype?.startsWith('video/') && !(f.metadata?.mimetype?.includes('pdf') || f.metadata?.mimetype?.includes('doc'));
  });

  const filteredFiles = typeFilteredFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const storageUsedGB = (stats.globalTotalSize / (1024 * 1024 * 1024)).toFixed(2);
  const storageLimitGB = 1;
  const storagePercent = (parseFloat(storageUsedGB) / storageLimitGB) * 100;

  return (
    <div className="space-y-6 pb-24">
      {/* Standard Green Header Banner */}
      <div className="bg-primary rounded-xl p-5 text-white relative overflow-hidden shadow-lg" style={{background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 70%), var(--primary)'}}>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-xl blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <HardDrive size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {language === 'bn' ? "মিডিয়া লাইব্রেরি" : "Media Library"}
              </h1>
              <p className="text-xs text-white/60 mt-0.5">
                {language === 'bn' ? "ইমেজ, ভিডিও এবং ডকুমেন্ট পরিচালনা করুন" : "Manage your images, videos, and documents in one place"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 min-w-[180px]">
              <div className="flex items-center justify-between text-[9px] font-bold text-white/60">
                <span>Used: {storageUsedGB} GB / {storageLimitGB} GB</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-xl overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(storagePercent, 100)}%` }}
                  className="h-full bg-white rounded-xl" 
                />
              </div>
            </div>
            <div className="flex h-9">
              <label className="h-full px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {language === 'bn' ? "আপলোড" : "Upload File"}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              <button className="h-full px-2 bg-white/10 hover:bg-white/20 border-l border-white/10 text-white rounded-xl transition-all">
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Type Tabs & Bucket Selector */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল' : 'All Files', count: stats.all, icon: FolderOpen },
            { id: 'image', label: language === 'bn' ? 'ইমেজ' : 'Images', count: stats.image, icon: ImageIcon },
            { id: 'video', label: language === 'bn' ? 'ভিডিও' : 'Videos', count: stats.video, icon: Video },
            { id: 'document', label: language === 'bn' ? 'ডকুমেন্ট' : 'Docs', count: stats.document, icon: FileText },
            { id: 'other', label: language === 'bn' ? 'অন্যান্য' : 'Others', count: stats.other, icon: MoreHorizontal },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`h-8 px-3 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${activeType === type.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}`}
            >
              <type.icon size={13} />
              {type.label}
              <span className={`px-1.5 py-0.5 rounded-xl text-[9px] ${activeType === type.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
                {type.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
          {buckets.map(bucket => (
            <button
              key={bucket.id}
              onClick={() => setActiveBucket(bucket.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeBucket === bucket.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 mr-2">
               <button 
                 onClick={() => setCurrentPath("")}
                 className={`h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${currentPath === "" ? 'bg-primary text-white' : 'bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 text-slate-400'}`}
               >
                  Root
               </button>
               {breadcrumbs.map((crumb, idx) => (
                 <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-300">/</span>
                    <button 
                      onClick={() => setCurrentPath(breadcrumbs.slice(0, idx + 1).join('/'))}
                      className="h-11 px-4 bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400"
                    >
                       {crumb}
                    </button>
                 </div>
               ))}
            </div>
            <div className="relative flex-1 max-w-sm group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder={language === 'bn' ? "ফাইল সার্চ করুন..." : "Search files..."}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-11 pl-11 pr-6 bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
               />
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white dark:bg-[#0c0c0c] p-1 rounded-xl border border-slate-100 dark:border-white/5">
               <button onClick={() => setViewMode('grid')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  <Grid size={18} />
               </button>
               <button onClick={() => setViewMode('list')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  <ListIcon size={18} />
               </button>
            </div>
            
            <button className="h-11 px-6 bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2 hover:bg-slate-50 transition-all">
               <ArrowUpDown size={16} /> {language === 'bn' ? "সাম্প্রতিক যোগ" : "Recently Added"} <ChevronDown size={14} />
            </button>
         </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0c] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
             <Loader2 size={32} className="animate-spin text-primary mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Media Core...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0c] rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center p-10">
             <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-300 mb-6">
                <FolderOpen size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">No Files Found</h3>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Try adjusting your filters or upload a new file</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
             <AnimatePresence>
                {filteredFiles.map((file) => {
                  const isImage = file.metadata?.mimetype?.startsWith('image/');
                  const isVideo = file.metadata?.mimetype?.startsWith('video/');
                  const isSelected = selectedIds.includes(file.name);
                  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

                  return (
                    <motion.div
                      key={file.id || file.name}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`group relative bg-white dark:bg-[#0c0c0c] rounded-xl border transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-white/5 hover:border-primary/30 hover:shadow-xl'}`}
                      onClick={() => {
                        if (file.isFolder) {
                          navigateToFolder(file.name);
                        } else {
                          toggleSelect(file.name);
                        }
                      }}
                    >
                       {/* Preview Area */}
                       <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center">
                          {file.isFolder ? (
                            <div className="flex flex-col items-center gap-2">
                               <FolderOpen size={48} className="text-primary/40" />
                               <span className="text-[10px] font-black uppercase text-primary/60">
                                 {file.folderStats?.count} {language === 'bn' ? 'ফাইল' : 'Files'}
                               </span>
                            </div>
                          ) : isImage ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : isVideo ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                               <Video size={40} className="text-slate-300" />
                               <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded-xl text-[9px] font-bold text-white">00:45</div>
                            </div>
                          ) : (
                            <FileText size={40} className="text-slate-300" />
                          )}
                          
                          {/* Top Overlay: Checkbox & Type Badge */}
                          <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start pointer-events-none">
                             <div className={`w-5 h-5 rounded-xl border-2 flex items-center justify-center transition-all pointer-events-auto ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100'}`}>
                                {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                             </div>
                             {!file.isFolder && (
                               <div className="px-2 py-0.5 bg-black/40 dark:bg-white/10 backdrop-blur-md rounded-xl text-[8px] font-black text-white uppercase tracking-widest shadow-sm">
                                  {ext}
                               </div>
                             )}
                          </div>

                          {/* Hover Actions */}
                          {!file.isFolder && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                                 className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-xl hover:scale-110 transition-all"
                               >
                                  <ExternalLink size={18} />
                               </button>
                            </div>
                          )}
                       </div>

                       {/* Details Area */}
                       <div className="p-4 bg-white dark:bg-[#0c0c0c] border-t border-slate-50 dark:border-white/5">
                          <div className="flex items-start justify-between gap-2">
                             <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-widest">{file.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                   {formatSize(file.isFolder ? (file.folderStats?.size || 0) : (file.metadata?.size || 0))} • {new Date(file.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                             </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                   <MoreVertical size={16} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                   <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url); }} className="gap-2 text-[11px] font-bold uppercase tracking-widest">
                                      <Copy size={14} /> {language === 'bn' ? "লিঙ্ক কপি" : "Copy Link"}
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }} className="gap-2 text-rose-500 text-[11px] font-bold uppercase tracking-widest">
                                      <Trash2 size={14} /> {language === 'bn' ? "ডিলিট" : "Delete"}
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0c0c0c] rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                    <th className="w-12 px-6 py-4">
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 rounded-xl border-slate-300 text-primary focus:ring-primary"
                         checked={selectedIds.length === filteredFiles.length && filteredFiles.length > 0}
                         onChange={() => setSelectedIds(selectedIds.length === filteredFiles.length ? [] : filteredFiles.map(f => f.name))}
                       />
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredFiles.map((file) => (
                    <tr key={file.id || file.name} className={`hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group ${selectedIds.includes(file.name) ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded-xl border-slate-300 text-primary focus:ring-primary"
                          checked={selectedIds.includes(file.name)}
                          onChange={() => toggleSelect(file.name)}
                        />
                      </td>
                      <td className="px-6 py-4">
                         <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {file.metadata?.mimetype?.startsWith('image/') ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={20} className="text-slate-400" />
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{file.name}</p>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{file.metadata?.mimetype || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{formatSize(file.metadata?.size || 0)}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setSelectedFile(file)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                               <ExternalLink size={16} />
                            </button>
                            <button onClick={() => handleDelete(file.name)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl flex items-center gap-8 min-w-[500px] max-w-2xl"
          >
             <div className="flex items-center gap-4 border-r border-slate-100 dark:border-white/5 pr-8">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm">
                   {selectedIds.length}
                </div>
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{language === 'bn' ? "টি ফাইল নির্বাচিত" : "Files Selected"}</p>
             </div>

             <div className="flex items-center gap-2 flex-1 justify-center">
                <button className="h-10 px-4 flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-all">
                   <Download size={16} /> {language === 'bn' ? "ডাউনলোড" : "Download"}
                </button>
                <button className="h-10 px-4 flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-all">
                   <Share2 size={16} /> {language === 'bn' ? "শেয়ার" : "Share"}
                </button>
                <button className="h-10 px-4 flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-all">
                   <Move size={16} /> {language === 'bn' ? "মুভ" : "Move"}
                </button>
             </div>

             <button 
               onClick={handleBulkDelete}
               className="h-10 px-6 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all flex items-center gap-2"
             >
                <Trash2 size={16} /> {language === 'bn' ? "ডিলিট" : "Delete"}
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Detail Inspector */}
      <AnimatePresence>
        {selectedFile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFile(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[150]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-[160] p-6"
            >
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row">
                  <div className="flex-[3] bg-slate-100 dark:bg-black p-10 flex items-center justify-center relative min-h-[400px]">
                     {selectedFile.metadata?.mimetype?.startsWith('image/') ? (
                       <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-xl" />
                     ) : (
                       <div className="text-slate-300 flex flex-col items-center gap-4">
                          <ImageIcon size={100} />
                          <p className="text-xl font-black uppercase tracking-widest">{selectedFile.metadata?.mimetype || 'Unknown'}</p>
                       </div>
                     )}
                     <button onClick={() => setSelectedFile(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-xl flex items-center justify-center backdrop-blur-md transition-all">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="flex-[2] p-10 space-y-8 flex flex-col">
                     <div>
                        <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter break-all max-w-[80%]">{selectedFile.name}</h2>
                           <DropdownMenu>
                              <DropdownMenuTrigger className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                 <MoreVertical size={18} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                 <DropdownMenuItem onClick={() => copyToClipboard(selectedFile.url)} className="gap-2 text-[11px] font-bold uppercase tracking-widest">
                                    <Copy size={14} /> {language === 'bn' ? "লিঙ্ক কপি" : "Copy Link"}
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleDelete(selectedFile.name)} className="gap-2 text-rose-500 text-[11px] font-bold uppercase tracking-widest">
                                    <Trash2 size={14} /> {language === 'bn' ? "ডিলিট করুন" : "Delete Permanent"}
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Asset Details</p>
                     </div>

                     <div className="space-y-4 flex-1">
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MIME Type</p>
                           <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedFile.metadata?.mimetype || 'Unknown'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                           <p className="text-xs font-bold text-slate-900 dark:text-white">{formatSize(selectedFile.metadata?.size || 0)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Upload Date</p>
                           <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(selectedFile.created_at).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Public Link</p>
                           <div className="flex items-center gap-2 mt-1">
                              <input readOnly value={selectedFile.url} className="bg-transparent text-[10px] font-bold text-slate-500 truncate w-full outline-none" />
                              <button onClick={() => copyToClipboard(selectedFile.url)} className="text-primary hover:scale-110 transition-all"><Copy size={14}/></button>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <a href={selectedFile.url} target="_blank" rel="noreferrer" className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                           <ExternalLink size={16} /> Open
                        </a>
                        <button onClick={() => handleDelete(selectedFile.name)} className="flex-1 h-14 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 hover:scale-105 transition-all">
                           <Trash2 size={16} /> Delete
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
