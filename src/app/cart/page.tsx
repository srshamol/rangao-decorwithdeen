"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { language, t } = useLanguage();
  const deliveryCharge = subtotal > 0 ? (subtotal >= 3000 ? 0 : 80) : 0;
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center px-4">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-xl font-bold font-heading text-foreground">{language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}</h1>
        <p className="text-muted-foreground mt-2">{language === 'bn' ? 'শপিং শুরু করতে নিচের বাটনে ক্লিক করুন' : 'Start shopping to see items here'}</p>
        <Button asChild className="mt-6 rounded-xl px-10 h-12">
          <Link href="/shop">{language === 'bn' ? 'শপিং শুরু করুন' : 'Continue Shopping'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto min-h-[60vh]">
      <h1 className="text-2xl font-bold font-heading text-foreground mb-6">🛒 {t('cart')}</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-xl border p-4 flex gap-4">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-1">{language === 'bn' ? item.name_bn : item.name}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 uppercase tracking-widest font-black">{language === 'bn' ? item.name : item.name_bn}</p>
              <p className="text-sm font-bold text-primary mt-1">৳{item.price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center hover:bg-muted"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center hover:bg-muted"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto text-destructive hover:text-destructive/80"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="mt-6 bg-card rounded-xl border p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span className="font-medium">৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('delivery')}</span>
          <span className="font-medium">{deliveryCharge === 0 ? (language === 'bn' ? "ফ্রি" : "Free") : `৳${deliveryCharge}`}</span>
        </div>
        {subtotal < 3000 && subtotal > 0 && (
          <p className="text-xs text-gold">
            {language === 'bn' 
              ? `ফ্রি ডেলিভারির জন্য আরও ৳${(3000 - subtotal).toLocaleString()} শপিং করুন!` 
              : `৳${(3000 - subtotal).toLocaleString()} more for free delivery!`}
          </p>
        )}
        <div className="border-t pt-3 flex justify-between text-base font-bold">
          <span>{t('total')}</span>
          <span className="text-primary">৳{total.toLocaleString()}</span>
        </div>
      </div>

      <Button asChild className="w-full mt-4 h-14 rounded-xl text-base font-bold">
        <Link href="/checkout">👉 {language === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}</Link>
      </Button>
    </div>
  );
}
