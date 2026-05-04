
import { supabase } from "@/integrations/supabase/client";

interface SteadfastConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

const sanitizePhone = (phone: string) => {
  // Remove any non-digits
  const digits = phone.replace(/\D/g, "");
  // If it's 11 digits, perfect. If it's more (e.g. starting with 88), take last 11.
  if (digits.length >= 11) {
    return digits.slice(-11);
  }
  return digits;
};

const getSteadfastConfig = async (): Promise<SteadfastConfig | null> => {
  const { data: configData } = await supabase
    .from("store_configs")
    .select("*")
    .eq("id", "courier_settings")
    .single();

  if (!configData) return null;

  const config = configData.value as any;
  const couriers = config.couriers || [];
  const steadfast = couriers.find((c: any) => c.providerId === "steadfast");

  if (!steadfast || !steadfast.isActive) {
    if (config.steadfast_key && config.steadfast_secret) {
      return {
        apiKey: config.steadfast_key,
        secretKey: config.steadfast_secret,
        baseUrl: config.steadfast_base_url || (config.steadfast_is_sandbox 
          ? "https://sandbox.steadfast.com.bd/api/v1" 
          : "https://portal.packzy.com/api/v1")
      };
    }
    return null;
  }

  return {
    apiKey: steadfast.credentials?.api_key,
    secretKey: steadfast.credentials?.secret_key,
    baseUrl: steadfast.credentials?.base_url || (steadfast.isSandbox 
      ? "https://sandbox.steadfast.com.bd/api/v1" 
      : "https://portal.packzy.com/api/v1")
  };
};

export const bookSteadfastParcel = async (order: any) => {
  try {
    const config = await getSteadfastConfig();
    
    if (!config || !config.apiKey || !config.secretKey) {
      throw new Error("Steadfast configuration not found or inactive.");
    }

    // 2. Create Order Payload as per documentation
    const orderPayload = {
      invoice: order.order_number || order.id.toString(),
      recipient_name: order.customer_name,
      recipient_phone: sanitizePhone(order.phone || ""),
      recipient_address: order.address,
      cod_amount: Math.max(0, order.total || 0),
      note: order.note || `Order: ${order.order_number || order.id}`,
      item_description: order.items_summary || "Islamic Lifestyle Products",
      delivery_type: 0 // Default to Home Delivery
    };

    if (orderPayload.recipient_phone.length !== 11) {
      throw new Error(`Invalid phone number: ${orderPayload.recipient_phone}. Steadfast requires exactly 11 digits.`);
    }

    const response = await fetch(`${config.baseUrl}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": config.apiKey,
        "Secret-Key": config.secretKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();

    if (result.status !== 200) {
      throw new Error(result.message || "Failed to create Steadfast order");
    }

    return {
      success: true,
      trackingId: result.consignment?.consignment_id?.toString() || result.consignment?.tracking_code,
      trackingCode: result.consignment?.tracking_code,
      message: result.message
    };

  } catch (error: any) {
    console.error("Steadfast Booking Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const checkSteadfastStatus = async (trackingId: string) => {
  try {
    const config = await getSteadfastConfig();
    if (!config) return null;

    // Use status_by_trackingcode or status_by_cid
    const path = trackingId.length > 10 ? `/status_by_trackingcode/${trackingId}` : `/status_by_cid/${trackingId}`;
    
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: "GET",
      headers: {
        "Api-Key": config.apiKey,
        "Secret-Key": config.secretKey,
        "Accept": "application/json"
      }
    });

    const result = await response.json();
    if (result.status === 200) {
      return result.delivery_status?.toLowerCase();
    }
    return null;
  } catch (error) {
    console.error("Steadfast Status Check Error:", error);
    return null;
  }
};
