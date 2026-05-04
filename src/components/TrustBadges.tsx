import { motion } from "framer-motion";
import { Banknote, Truck, ShieldCheck, HeartHandshake, Zap, Smartphone, Star, Clock, Gift } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { useLanguage } from "@/lib/language-context";

const ICON_MAP: Record<string, any> = {
  Banknote,
  Truck,
  ShieldCheck,
  HeartHandshake,
  Zap,
  Smartphone,
  Star,
  Clock,
  Gift
};

export function TrustBadges() {
  const { settings } = useSettings();
  const { language, t } = useLanguage();

  const DEFAULT_BADGES = [
    { 
      label: language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery', 
      sub: language === 'bn' ? 'সারা বাংলাদেশে' : 'All Over Bangladesh', 
      icon: Banknote 
    },
    { 
      label: language === 'bn' ? '২৪-৪৮ ঘণ্টায় ডেলিভারি' : '24-48h Delivery', 
      sub: language === 'bn' ? 'খুব দ্রুত ডেলিভারি' : 'Fastest Logistics', 
      icon: Truck 
    },
    { 
      label: language === 'bn' ? 'ক্ষতিপূরণ গ্যারান্টি' : 'Damage Replace', 
      sub: language === 'bn' ? '১০০% নিশ্চয়তা' : '100% Guarantee', 
      icon: ShieldCheck 
    },
    { 
      label: language === 'bn' ? '১০০০+ খুশি কাস্টমার' : '1000+ Happy', 
      sub: language === 'bn' ? 'বিশ্বস্ত ব্র্যান্ড' : 'Trusted Brand', 
      icon: HeartHandshake 
    },
  ];

  const displayBadges = settings?.trust_badges?.length > 0 
    ? settings.trust_badges.map((b: any) => ({
        label: b.title || b.label,
        sub: b.description || b.sub,
        icon: ICON_MAP[b.icon] || ShieldCheck
      }))
    : DEFAULT_BADGES;

  return (
    <section className="relative w-full py-12 bg-[#FDFBF7] border-y border-gold/10 z-20 bg-islamic-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayBadges.map((b: any, i: number) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="relative group p-5 bg-card/60 rounded-xl border border-border/40 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-default"
              >
                {/* Hover gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-white shadow-xl shadow-gold/5 flex items-center justify-center text-gold group-hover:bg-primary group-hover:text-white transition-all duration-700 border border-gold/10 group-hover:scale-110 group-hover:-rotate-3">
                    <Icon className="w-7 h-7 transition-colors duration-500" strokeWidth={1.2} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm md:text-base font-bold font-heading text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {b.label}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1 uppercase tracking-wider font-medium">
                      {b.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
