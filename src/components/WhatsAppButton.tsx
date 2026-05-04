import { MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

export function WhatsAppButton() {
  const { settings } = useSettings();
  const whatsapp = settings?.general_settings?.whatsapp || "8801540707024";
  const storeName = settings?.general_settings?.store_name || "Rangao";

  return (
    <div className="fixed bottom-[92px] right-6 z-40">
      <a
        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(storeName)}!%20I%20want%20to%20order.`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center"
        aria-label="Order via WhatsApp"
      >
        {/* Animated Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        
        <div className="relative w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] transition-all duration-300 group-hover:scale-110 group-active:scale-95">
          <MessageCircle size={28} strokeWidth={1.5} className="transition-transform group-hover:rotate-12" />
        </div>

        {/* Tooltip on hover (desktop) */}
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none hidden md:block whitespace-nowrap">
          Chat with us
        </div>
      </a>
    </div>
  );
}
