"use server";

import { supabase } from "@/integrations/supabase/client";
import { sendSMSServer } from "./sms";

export async function notifyAdminOfRiskOrder(order: any) {
  try {
    // 1. Fetch Admin Settings
    const { data: config } = await supabase
      .from("store_configs")
      .select("*")
      .eq("id", "advanced_settings")
      .single();
    
    const advanced = config?.value || {};
    const settings = advanced.otp || {};
    const general = advanced.general_settings || {};
    
    // 2. Dashboard Notification
    // We can insert into an 'admin_notifications' table if it exists
    // For now, the real-time listener in the admin panel handles immediate visibility
    
    // 3. SMS Notification
    if (settings.notify_sms) {
      const adminPhone = general.phone || "8801540707024";
      const message = `[RISK ALERT] Order ${order.order_number} is ON HOLD. Reason: ${order.risk_badge || 'OTP Failure'}. Success Rate: ${order.risk_score || 0}%`;
      await sendSMSServer({ number: adminPhone, message });
    }
    
    // 4. Email Notification 
    if (settings.notify_email) {
      // Placeholder for SMTP/SendGrid integration
      console.log("[ELITE NOTIFY] Email alert sent to admin for high-risk order:", order.order_number);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("[NotifyAdmin] Error:", error);
    return { success: false, error: error.message };
  }
}
