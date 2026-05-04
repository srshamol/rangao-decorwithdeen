"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/language-context";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems, clearCart } = useCart();
  const { t } = useLanguage();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white border-l-0 sm:border-l border-slate-100">
          <SheetHeader className="p-6 border-b border-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                {t("shopping_cart")}
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-1">
                  {totalItems}
                </span>
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <ShoppingCart size={40} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{t("cart_empty")}</p>
                  <p className="text-sm text-slate-400 mt-1">{t("cart_empty_desc")}</p>
                </div>
                <Button asChild onClick={onClose} className="rounded-xl bg-primary px-8">
                  <Link href="/shop">{t("shop_now")}</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[14px] font-bold text-slate-900 leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {(item.selectedSize || item.selectedFrame) && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {item.selectedSize} {item.selectedFrame && `· ${item.selectedFrame}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-black text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <SheetFooter className="p-6 border-t border-slate-50 bg-slate-50/50 shrink-0">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-slate-900">
                  <span className="text-sm font-bold text-slate-500">{t("subtotal")}</span>
                  <span className="text-xl font-black">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCheckout}
                    className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/95 text-white font-black text-sm gap-2 shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
                  >
                    {t("proceed_to_checkout")}
                    <ArrowRight size={18} />
                  </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  {t("shipping_calc_checkout")}
                </p>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        items={items} 
        total={subtotal}
        onSuccess={() => {
          clearCart();
        }}
      />
    </>
  );
}
