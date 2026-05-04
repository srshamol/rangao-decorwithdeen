import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Props {
  settings: any;
  onUpdate: (field: string, value: any) => void;
}

export function ContactSettings({ settings, onUpdate }: Props) {
  const { t } = useLanguage();
  const update = (field: string, value: string) => onUpdate(field, value);

  const fields = [
    { key: "phone", label: t("phone"), icon: Phone, placeholder: "01XXXXXXXXX" },
    { key: "whatsapp", label: t("whatsapp"), icon: Phone, placeholder: "8801XXXXXXXXX" },
    { key: "email", label: t("email"), icon: Mail, placeholder: "info@store.com" },
    { key: "address", label: t("address"), icon: MapPin, placeholder: "Address line..." },
    { key: "facebook_url", label: t("facebook_page"), icon: Facebook, placeholder: "https://facebook.com/..." },
    { key: "instagram_url", label: t("instagram"), icon: Instagram, placeholder: "https://instagram.com/..." },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {fields.map(f => (
        <div key={f.key} className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <f.icon size={12} /> {f.label}
          </label>
          <input 
            type="text" 
            value={settings[f.key] || ""} 
            onChange={(e) => update(f.key, e.target.value)}
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder={f.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
