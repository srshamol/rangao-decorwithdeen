"use server";

import { supabase } from "@/integrations/supabase/client";

export async function saveStoreConfigs(payload: any[]) {
  if (!payload || !Array.isArray(payload)) {
    throw new Error("Invalid payload: expected an array");
  }

  const { error } = await supabase
    .from("store_configs")
    .upsert(payload);

  if (error) {
    throw new Error(`Database Error: ${error.message}`);
  }

  return { success: true };
}
