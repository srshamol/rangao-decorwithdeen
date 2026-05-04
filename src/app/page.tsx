import { supabase } from "@/integrations/supabase/client";
import { HomeClient } from "@/components/home/HomeClient";

async function getFeaturedProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, name_bn, price, old_price, images, badge, status")
      .eq("is_combo", false)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Server Fetch Error (Products):", err);
    return [];
  }
}

async function getStoreSettings() {
  try {
    const { data, error } = await supabase
      .from("store_configs")
      .select("*");
    
    if (error) throw error;
    if (!data) return {};
    
    return data.reduce((acc: any, item: any) => {
      acc[item.id] = item.value;
      return acc;
    }, {});
  } catch (err) {
    console.error("Server Fetch Error (Settings):", err);
    return {};
  }
}

export default async function IndexPage() {
  // Parallel fetch with safety timeout for server-side resilience
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database Timeout")), 4000)
  );

  let featuredProducts = [];
  let settings = {};

  try {
    const results = await Promise.race([
      Promise.all([getFeaturedProducts(), getStoreSettings()]),
      timeoutPromise
    ]) as [any[], any];
    
    featuredProducts = results[0];
    settings = results[1];
  } catch (err) {
    console.error("Resilience Fallback Triggered:", err);
    // Proceed with empty defaults to allow ClientLayout/HomeClient to handle hydration
  }

  return (
    <HomeClient 
      initialProducts={featuredProducts} 
      initialSettings={settings} 
      serverSideError={false}
    />
  );
}
