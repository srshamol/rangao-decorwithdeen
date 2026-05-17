import { supabase } from "@/integrations/supabase/client";

export interface FraudReport {
  id: string;
  name: string;
  details: string;
  created_at: string;
  courierLogo: string;
  courierName: string;
  reported_at: string;
  severity: string;
}

export interface FraudSummary {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  returned_parcel?: number;
  success_ratio: number;
}

export interface FraudCheckResult {
  status: string;
  data: any;
  summary: FraudSummary;
  reports: FraudReport[];
  risk_level: string;
}

const getBDCourierKey = async (): Promise<string | null> => {
  try {
    // 1. Check Process Environment
    if (typeof process !== "undefined" && process.env.BD_COURIER_API_KEY) {
      return process.env.BD_COURIER_API_KEY;
    }

    // 2. Check store_configs (New Admin Studio Location)
    const { data: configData, error: configError } = await supabase
      .from("store_configs")
      .select("value")
      .eq("id", "courier_settings")
      .single();

    if (!configError && configData?.value) {
      const courierSettings = configData.value as any;
      const bdCourier = courierSettings.couriers?.find((c: any) => c.providerId === 'bd_courier');
      if (bdCourier?.credentials?.api_key) {
        return bdCourier.credentials.api_key;
      }
    }

    // 3. Fallback to app_settings (Legacy Location)
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "bd_courier_api_key")
      .eq("is_active", true)
      .single();
      
    if (!error && data?.value) {
      return data.value;
    }

    return null;
  } catch (e) {
    console.error("[FraudCheck] Error:", e);
    return null;
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
    if (!apiKey) {
      console.warn("[FraudCheck] No API key");
      return null;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch("https://api.bdcourier.com/my-plan", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const result = await response.json();
    return result.status === "success" ? result.data as FraudPlan : null;
  } catch (error) {
    console.error("[FraudCheck] Error:", error);
    return null;
  }
}

const getReportAgeInDays = (reportedAt: string): number => {
  const reported = new Date(reportedAt);
  const now = new Date();
  return Math.ceil(Math.abs(now.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateWeightedRisk = (reports: FraudReport[]): number => {
  if (reports.length === 0) return 0;
  let totalWeight = 0;
  reports.forEach(report => {
    const ageDays = getReportAgeInDays(report.reported_at || report.created_at);
    let weight = 1;
    if (ageDays <= 30) weight = 3;
    else if (ageDays <= 90) weight = 2;
    else if (ageDays <= 180) weight = 1;
    else weight = 0.5;
    const severityMultiplier = report.severity === "high" ? 3 : report.severity === "medium" ? 2 : 1;
    totalWeight += weight * severityMultiplier;
  });
  return Math.min(100, (totalWeight / (reports.length * 9)) * 100);
};

export async function checkCustomerFraud(phone: string): Promise<FraudCheckResult | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, "").slice(-11);
    if (cleanPhone.length !== 11) {
      console.warn("[FraudCheck] Invalid phone:", phone);
      return null;
    }

    // 1. Check local cache (customer_risk_history table)
    const { data: cachedData } = await supabase
      .from("customer_risk_history")
      .select("*")
      .eq("phone", cleanPhone)
      .single();

    if (cachedData) {
      const updatedAt = new Date(cachedData.updated_at);
      const now = new Date();
      const diffHours = Math.abs(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        console.log("[FraudCheck] Using cached data for", cleanPhone);
        return {
          status: "success",
          data: cachedData.raw_data,
          summary: {
            total_parcel: cachedData.total_parcels,
            success_parcel: cachedData.success_parcels,
            cancelled_parcel: cachedData.cancelled_parcels,
            success_ratio: cachedData.success_ratio
          },
          reports: (cachedData.raw_data as any)?.reports || [],
          risk_level: cachedData.risk_level
        };
      }
    }

    // 2. Fetch fresh data from BDCourier
    const apiKey = await getBDCourierKey();
    if (!apiKey) {
      console.warn("[FraudCheck] No API key configured");
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("https://api.bdcourier.com/courier-check", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ phone: cleanPhone, check_timestamp: new Date().toISOString() }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!response.ok) return null;
    const result = await response.json();

    if (result.status === "success") {
      const summary = result.data?.summary as FraudSummary;
      const rawReports = result.reports || result.data?.reports || [];
      const reports: FraudReport[] = rawReports.map((r: any) => ({
        id: r.id || "r_" + Date.now(),
        name: r.name || "Unknown",
        details: r.details || "",
        created_at: r.created_at || new Date().toISOString(),
        reported_at: r.reported_at || r.created_at || new Date().toISOString(),
        severity: r.severity || "medium",
        courierLogo: r.courierLogo || "",
        courierName: r.courierName || ""
      }));
      
      const successRatio = Number(summary?.success_ratio || 0);
      const weightedRiskScore = calculateWeightedRisk(reports);
      
      // Elite Auto-Block Intelligence
      const cancelledCount = Number(summary?.cancelled_parcel || 0);
      const returnedCount = Number(summary?.returned_parcel || 0);
      const totalIssues = cancelledCount + returnedCount;
      const hasBlacklistReport = reports?.some(r => r.severity === 'high');

      let riskLevel = "low";
      if (successRatio < 50 || weightedRiskScore > 60 || totalIssues > 5 || hasBlacklistReport) {
        riskLevel = "high";
      } else if (successRatio < 75 || weightedRiskScore > 30 || totalIssues > 2) {
        riskLevel = "medium";
      }

      const finalResult = { ...result, summary, reports, risk_level: riskLevel };

      // 3. Update cache
      const cacheEntry = {
        phone: cleanPhone,
        success_ratio: successRatio,
        total_parcels: summary?.total_parcel || 0,
        success_parcels: summary?.success_parcel || 0,
        cancelled_parcels: summary?.cancelled_parcel || 0,
        risk_level: riskLevel,
        raw_data: result,
        updated_at: new Date().toISOString()
      };

      await supabase.from("customer_risk_history").upsert(cacheEntry, { onConflict: 'phone' });

      return finalResult;
    }
    return null;
  } catch (error) {
    console.error("[FraudCheck] Error:", error);
    return null;
  }
}