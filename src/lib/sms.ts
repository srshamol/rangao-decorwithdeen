"use server";

import { supabase } from "@/integrations/supabase/client";

export async function sendSMSServer({ number, message }: { number: string, message: string }) {
  try {
    const { data: configData } = await supabase
      .from("store_configs")
      .select("*")
      .eq("id", "integrations")
      .single();
    
    const integrations = configData?.value as any[] || [];
    const smsConfig = integrations.find(i => i.category === "sms" && i.isActive);

    if (!smsConfig) return { success: false, message: "No active SMS integration" };
    const { api_key, sender_id } = smsConfig.config;
    
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${api_key}&type=text&number=${number}&senderid=${sender_id || ""}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url);
    const text = await response.text();
    
    try {
      const result = JSON.parse(text);
      if (result.response_code === 202 || result.success === true || result.status === "success") {
        return { success: true, message: result.message || "SMS sent successfully" };
      }
      return { success: false, message: result.message || "BulkSMSBD Error" };
    } catch {
      return { success: text.includes("success"), message: text };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getSMSBalanceServer({ apiKey }: { apiKey?: string } = {}) {
  try {
    let key = apiKey?.trim();
    if (!key) {
      const { data: configData } = await supabase
        .from("store_configs")
        .select("*")
        .eq("id", "integrations")
        .single();
      const integrations = configData?.value as any[] || [];
      const smsConfig = integrations.find(i => i.category === "sms" && i.providerId === "bulksmsbd");
      key = smsConfig?.config?.api_key?.trim();
    }

    if (!key) return { success: false, message: "API Key missing" };

    // Sanitize key: if it's a full URL, extract the api_key parameter
    if (key.includes("api_key=")) {
      try {
        const urlObj = new URL(key);
        const paramKey = urlObj.searchParams.get("api_key");
        if (paramKey) key = paramKey;
      } catch (e) {
        // If URL parsing fails, try manual extraction
        const match = key.match(/api_key=([^&]+)/);
        if (match) key = match[1];
      }
    }
    key = key.trim();

    const url = `http://bulksmsbd.net/api/getBalanceApi?api_key=${key}`;
    console.log("[SMS BALANCE] Requesting:", url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const text = await response.text();
    console.log("[SMS BALANCE] Raw Response:", text);

    try {
      const result = JSON.parse(text);
      const balanceValue = result.balance ?? result.credit ?? result.data?.balance;
      
      if (balanceValue !== undefined) {
        return { success: true, balance: balanceValue };
      }
      return { success: false, message: result.message || "Balance key not found in: " + text };
    } catch {
      if (!isNaN(parseFloat(text))) {
        return { success: true, balance: text };
      }
      return { success: false, message: "Invalid Response: " + text };
    }
  } catch (error: any) {
    return { success: false, message: "Server Error: " + error.message };
  }
}
