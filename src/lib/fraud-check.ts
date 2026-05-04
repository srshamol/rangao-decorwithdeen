
import { supabase } from "@/integrations/supabase/client";

export interface FraudReport {
  id: string;
  name: string;
  details: string;
  created_at: string;
  courierLogo: string;
  courierName: string;
}

export interface FraudSummary {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

export interface FraudCheckResult {
  status: string;
  data: any;
  summary: FraudSummary;
  reports: FraudReport[];
  risk_level: 'low' | 'medium' | 'high';
}

const getBDCourierKey = async (): Promise<string | null> => {
  try {
    // 1. Try to get from database settings
    const { data, error } = await (supabase as any)
      .from("settings")
      .select("value")
      .eq("key", "store_settings")
      .single();

    if (!error && data?.value?.couriers) {
      const bd = data.value.couriers.find((c: any) => c.providerId === "bd_courier");
      if (bd?.credentials?.api_key) return bd.credentials.api_key;
    }

    // 2. Fallback to production key if no user key is set
    return "goKeHBeVqjQkmo4ke6VYfezRCSkmWvDMoXFuwZKbUtusw1OSJS94KWghbGIJ";
  } catch (e) {
    return "goKeHBeVqjQkmo4ke6VYfezRCSkmWvDMoXFuwZKbUtusw1OSJS94KWghbGIJ";
  }
};

export interface FraudPlan {
  has_subscription: boolean;
  plan_name: string;
  plan_type: string;
  status: string;
  expires_at: string;
  days_remaining: number;
  api_calls: number;
  remaining_free_calls: number;
  remaining_paid_calls: number;
}

export async function getBDCourierPlan(overrideKey?: string): Promise<FraudPlan | null> {
  try {
    const apiKey = overrideKey || await getBDCourierKey();
    if (!apiKey) return null;

    const response = await fetch("https://api.bdcourier.com/my-plan", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (result.status === "success") {
      return result.data as FraudPlan;
    }
    return null;
  } catch (error) {
    console.error("Fraud Plan Error:", error);
    return null;
  }
}

export async function checkCustomerFraud(phone: string): Promise<FraudCheckResult | null> {
  try {
    const apiKey = await getBDCourierKey();
    if (!apiKey) return null;

    // Sanitize phone (BD Courier expects standard format e.g. 017...)
    const cleanPhone = phone.replace(/\D/g, "").slice(-11);
    if (cleanPhone.length !== 11) return null;

    const response = await fetch("https://api.bdcourier.com/courier-check", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ phone: cleanPhone })
    });

    if (!response.ok) {
      console.error("BD Courier API Error:", response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.status === "success") {
      const summary = result.data?.summary as FraudSummary;
      const reports = result.reports || [];
      const successRatio = Number(summary?.success_ratio || 0);
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (successRatio < 60 || reports.length > 0) riskLevel = 'high';
      else if (successRatio < 80) riskLevel = 'medium';

      return {
        ...result,
        summary,
        reports,
        risk_level: riskLevel
      };
    }

    return null;
  } catch (error) {
    console.error("Fraud Check Error:", error);
    return null;
  }
}
