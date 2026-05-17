"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { UserCircle, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-100 shadow-2xl overflow-hidden"
        >
          <div className="h-40 bg-primary relative">
            <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
            <div className="absolute -bottom-16 left-10">
              <div className="w-32 h-32 rounded-xl bg-white p-2 shadow-xl">
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <UserCircle size={64} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-12 px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black font-heading text-slate-900">
                  {language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  {language === 'bn' ? 'আপনার অর্ডারের তথ্য এখানে দেখুন' : 'Manage your orders and profile here'}
                </p>
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100">
                <LogOut size={18} />
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: ShoppingBag, label: language === 'bn' ? 'অর্ডার সমূহ' : 'My Orders', color: 'bg-emerald-50 text-primary' },
                { icon: MapPin, label: language === 'bn' ? 'ঠিকানা' : 'Addresses', color: 'bg-blue-50 text-blue-600' },
                { icon: UserCircle, label: language === 'bn' ? 'প্রোফাইল' : 'Profile Details', color: 'bg-amber-50 text-gold' },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="font-bold text-slate-900 block">{item.label}</span>
                  <span className="text-xs text-slate-400 font-medium mt-1">View Details</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-12 p-10 rounded-xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                {language === 'bn' ? 'আপনার কোনো অর্ডার নেই' : 'You have no orders yet'}
              </p>
              <Button asChild className="mt-6 rounded-xl px-10 h-12 font-bold shadow-xl shadow-primary/20">
                <a href="/shop">{language === 'bn' ? 'শপিং শুরু করুন' : 'Start Shopping'}</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
