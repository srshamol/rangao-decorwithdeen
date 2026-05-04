import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/useSettings";

// Placeholder images for real customer homes
const photos = [
  "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=600&fit=crop"
];

export function PhotoGallery() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const data = settings?.homepage_config?.gallery_text || {};

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section className="py-20 px-4 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <a 
            href="https://instagram.com/rangao.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-bold px-4 py-2 rounded-xl mb-4 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <Instagram size={14} />
            @rangao.bd
          </a>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            {language === 'bn' ? (data.title_bn || 'আপনার ঘরে আমাদের ছোঁয়া') : (data.title_en || 'Our Pieces In Your Home')}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base max-w-lg mx-auto">
            {language === 'bn' 
              ? (data.subtitle_bn || 'দেখুন আমাদের প্রিয় গ্রাহকরা কীভাবে তাদের ঘর আমাদের প্রিমিয়াম ইসলামিক ডেকোর দিয়ে সাজিয়েছেন।')
              : (data.subtitle_en || 'See how our beautiful customers have styled their homes with our premium Islamic wall decor pieces.')}
          </p>
        </motion.div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {photos.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group overflow-hidden rounded-xl break-inside-avoid cursor-pointer"
              onClick={() => setSelectedIndex(i)}
            >
              <img
                src={img}
                alt={`Customer home photo ${i + 1}`}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <Instagram className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 delay-100" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-xl z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
            >
              <X className="w-6 h-6" />
            </button>

            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 md:p-3 rounded-xl z-10"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 md:p-3 rounded-xl z-10"
              onClick={handleNext}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={photos[selectedIndex]}
              alt="Selected customer home"
              className="max-h-[90vh] max-w-full rounded-xl shadow-2xl object-contain relative z-0"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
