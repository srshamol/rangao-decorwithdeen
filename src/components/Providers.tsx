"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";
import { SettingsProvider } from "@/lib/useSettings";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Singleton QueryClient with aggressive caching to avoid redundant fetches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — data stays "fresh" before refetch
      gcTime: 15 * 60 * 1000,      // 15 min — keep inactive results in memory
      retry: 1,
      refetchOnWindowFocus: false,  // Don't refetch just because user switched tabs
      refetchOnMount: false,        // Use cached data when component remounts
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SettingsProvider>
          <CartProvider>
            <TooltipProvider delayDuration={100}>
              <Toaster position="top-center" richColors />
              {children}
            </TooltipProvider>
          </CartProvider>
        </SettingsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
