import { supabase } from "@/integrations/supabase/client";


interface RedxConfig {
  token: string;
  baseUrl: string;
}

const getRedxConfig = async (): Promise<RedxConfig | null> => {
  const { data: configData } = await supabase
    .from("store_configs")
    .select("*")
    .eq("id", "courier_settings")
    .single();

  if (!configData) return null;

  const config = configData.value as any;
  const couriers = config.couriers || [];
  const redx = couriers.find((c: any) => c.providerId === "redx");

  const token = redx?.credentials?.api_key || config.redx_key;
  
  if (!token) return null;

  return {
    token,
    baseUrl: "https://openapi.redx.com.bd" // Use the OpenAPI base as per documentation
  };
};

export const bookRedxParcel = async (order: any) => {
  try {
    const config = await getRedxConfig();
    
    if (!config) {
      throw new Error("RedX configuration not found. Please set up in Courier Settings.");
    }

    // 2. Prepare Payload for OpenAPI v1.0.0-beta
    const payload = {
      customer_name: order.customer_name,
      customer_phone: order.phone,
      delivery_area: order.district || "Dhaka",
      delivery_area_id: Number(order.area_id || 0),
      customer_address: order.address,
      cash_collection_amount: order.payment_method === 'cod' ? Math.round(Number(order.total || 0)) : 0,
      parcel_weight: 500, // Default 0.5kg
      merchant_invoice_id: order.order_number || order.id.toString(),
      pickup_location_id: Number(order.pickup_location_id || 0), // Should be configured or selected
      value: Math.round(Number(order.total || 0))
    };

    const response = await fetch(`${config.baseUrl}/v1.0.0-beta/parcel`, {
      method: "POST",
      headers: {
        "API-ACCESS-TOKEN": `Bearer ${config.token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create RedX order");
    }

    return {
      success: true,
      trackingId: result.tracking_id,
      message: "Order created successfully"
    };

  } catch (error: any) {
    console.error("RedX Booking Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const checkRedxStatus = async (trackingId: string) => {
  try {
    const config = await getRedxConfig();
    if (!config) return null;

    const response = await fetch(`${config.baseUrl}/v1.0.0-beta/parcel/details/${trackingId}`, {
      method: "GET",
      headers: {
        "API-ACCESS-TOKEN": `Bearer ${config.token}`,
        "Accept": "application/json"
      }
    });

    const result = await response.json();
    if (response.ok && result.parcel) {
      return result.parcel.status?.toLowerCase();
    }
    return null;
  } catch (error) {
    console.error("RedX Status Check Error:", error);
    return null;
  }
};
