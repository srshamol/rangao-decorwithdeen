/** 
 * Root Layout
 * Deployment Sync: 2026-05-03 21:02
 */
import { Providers } from "@/components/Providers";
import { ClientLayout } from "./ClientLayout";
import "../styles.css";
import { Metadata } from "next";
import { Inter, Hind_Siliguri, Noto_Sans_Bengali } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  weight: ["400", "700"],
  subsets: ["bengali"],
  variable: "--font-noto",
  display: "swap",
});

import { supabase } from "@/integrations/supabase/client";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await supabase
      .from("store_configs")
      .select("value")
      .eq("id", "general_settings")
      .single();

    const settings = data?.value as any;
    const favicon = settings?.favicon || "/favicon.png";
    const title = settings?.store_name
      ? `${settings.store_name} | ${settings.store_tagline || 'Premium Wall Decor'}`
      : "Rangao - রাঙাও | Premium Islamic Wall Decor";
    const description = "আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে। Premium 3D Islamic wall decor, handcrafted in Bangladesh.";

    return {
      title,
      description,
      icons: { icon: favicon },
      openGraph: { title, description, type: "website" },
    };
  } catch {
    return {
      title: "Rangao - রাঙাও | Premium Islamic Wall Decor",
      description: "আপনার ঘরকে সাজান ইসলামের সৌন্দর্যে। Premium 3D Islamic wall decor, handcrafted in Bangladesh.",
      icons: { icon: "/favicon.png" },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable} ${notoBengali.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to speed up Supabase and Google Fonts */}
        <link rel="preconnect" href="https://wribyhmsmzpxwlxibvvx.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://wribyhmsmzpxwlxibvvx.supabase.co" />
      </head>

      <body suppressHydrationWarning>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
