import { motion } from "framer-motion";
import { Award, BadgeDollarSign, Truck, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";

const benefits = [
  { 
    id: "quality",
    icon: Award,
    title: "প্রিমিয়াম কোয়ালিটি", 
    title_en: "Premium Quality",
    desc: "উচ্চমানের ক্যানভাস ও কালার\nদীর্ঘস্থায়ী ও টেকসই",
    desc_en: "High-quality canvas and colors\nLong-lasting and durable"
  },
  { 
    id: "price",
    icon: BadgeDollarSign,
    title: "সেরা দাম গ্যারান্টি", 
    title_en: "Best Price Guarantee",
    desc: "সর্বোচ্চ মানের পণ্য\nসবচেয়ে সাশ্রয়ী দামে",
    desc_en: "Highest quality products\nat the most affordable price"
  },
  { 
    id: "delivery",
    icon: Truck,
    title: "দ্রুত ডেলিভারি", 
    title_en: "Fast Delivery",
    desc: "১-৩ দিনের মধ্যে\nসারাদেশে ডেলিভারি",
    desc_en: "Nationwide delivery\nwithin 1-3 days"
  },
  { 
    id: "payment",
    icon: ShieldCheck,
    title: "নিরাপদ পেমেন্ট", 
    title_en: "Secure Payment",
    desc: "SSL এনক্রিপশন ও\nনিরাপদ লেনদেন",
    desc_en: "SSL encryption and\nsecure transactions"
  },
];

export function WhyChoose() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const data = settings?.homepage_config?.why_choose_text || {};

  return (
    <section className="py-24 px-6 bg-[#FAFAFA]">
      <div className="container mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900"
          >
            {language === 'bn' ? (
              data.title_bn || <>কেন <span className="text-[#0F3D2E]">{settings?.general_settings?.store_name_bn || "রাঙাও"}</span> সেরা?</>
            ) : (
              data.title_en || <>Why is <span className="text-[#0F3D2E]">{settings?.general_settings?.store_name || "Rangao"}</span> best?</>
            )}
          </motion.h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-300"
              >
                {/* Icon with light green blob background */}
                <div className="relative mb-6">
                  {/* Abstract blob shape background */}
                  <div className="absolute inset-0 bg-[#E8F3EB] rounded-xl scale-150 transform transition-transform duration-500 hover:rotate-12" />
                  <div className="relative z-10 w-16 h-16 flex items-center justify-center text-[#2F6B4A]">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="text-[17px] font-bold text-slate-900 mb-3">
                  {language === 'bn' ? b.title : b.title_en}
                </h3>
                
                <p className="text-[13px] leading-relaxed text-slate-500 whitespace-pre-line">
                  {language === 'bn' ? b.desc : b.desc_en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
