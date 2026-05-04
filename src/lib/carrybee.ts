
import { supabase } from "@/integrations/supabase/client";


interface CarrybeeConfig {
  clientId: string;
  clientSecret: string;
  clientContext: string;
  storeId: string;
  baseUrl: string;
}

const getCarrybeeConfig = async (): Promise<CarrybeeConfig | null> => {
  const { data: configData } = await supabase
    .from("store_configs")
    .select("*")
    .eq("id", "courier_settings")
    .single();

  if (!configData) return null;

  const config = configData.value as any;
  const couriers = config.couriers || [];
  const carrybee = couriers.find((c: any) => c.providerId === "carrybee");

  const credentials = carrybee?.credentials || {};
  const isSandbox = carrybee?.isSandbox || config.carrybee_is_sandbox;

  return {
    clientId: credentials.client_id || config.carrybee_client_id,
    clientSecret: credentials.client_secret || config.carrybee_client_secret,
    clientContext: credentials.client_context || config.carrybee_client_context,
    storeId: credentials.store_id || config.carrybee_store_id,
    baseUrl: credentials.base_url || (isSandbox 
      ? "https://stage-sandbox.carrybee.com" 
      : "https://developers.carrybee.com")
  };
};

export const bookCarrybeeParcel = async (order: any) => {
  try {
    const config = await getCarrybeeConfig();
    
    if (!config || !config.clientId || !config.clientSecret || !config.clientContext || !config.storeId) {
      throw new Error("Carrybee configuration missing. Please check Courier Settings.");
    }

    // Phone Sanitization (Standard 11-digit)
    const cleanPhone = (order.phone || "").replace(/\D/g, "").slice(-11);

    const merchantOrderId = order.order_number 
      ? `${order.order_number.replace('Order # ', '')}-${Date.now().toString().slice(-4)}`
      : `${String(order.id).slice(0, 8)}-${Date.now().toString().slice(-4)}`;

    const orderPayload: any = {
      store_id: config.storeId,
      merchant_order_id: merchantOrderId.toUpperCase(),
      delivery_type: 1, 
      product_type: 1,  
      recipient_name: order.customer_name,
      recipient_phone: cleanPhone,
      recipient_address: (order.address || "No address provided").slice(0, 250),
      city_id: Math.max(1, Number(order.city_id || 1)), 
      zone_id: Math.max(1, Number(order.zone_id || 1)),
      item_weight: 500, // Grams (0.5kg)
      item_quantity: Math.max(1, Number(order.items?.reduce((acc: number, item: any) => acc + (item.qty || 1), 0) || 1)),
      collectable_amount: Math.round(Number(order.total || 0)),
      product_description: (order.items?.map((i: any) => i.name).join(", ") || "Parcel").slice(0, 100)
    };

    if (order.area_id && Number(order.area_id) > 1) {
      orderPayload.area_id = Number(order.area_id);
    }

    const response = await fetch(`${config.baseUrl}/api/v2/orders`, {
      method: "POST",
      headers: {
        "Client-ID": config.clientId,
        "Client-Secret": config.clientSecret,
        "Client-Context": config.clientContext,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();

    if (!response.ok || (result.status !== "success" && result.status !== 200)) {
      throw new Error(result.message || "Carrybee validation failure");
    }

    return {
      success: true,
      trackingId: result.data?.order?.consignment_id || result.data?.consignment_id,
      message: result.message
    };

  } catch (error: any) {
    console.error("Carrybee Booking Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const checkCarrybeeStatus = async (trackingId: string) => {
  try {
    const config = await getCarrybeeConfig();
    if (!config) return null;

    const response = await fetch(`${config.baseUrl}/api/v2/orders/${trackingId}/details`, {
      method: "GET",
      headers: {
        "Client-ID": config.clientId,
        "Client-Secret": config.clientSecret,
        "Client-Context": config.clientContext,
        "Accept": "application/json"
      }
    });

    const result = await response.json();
    if (response.ok && result.data) {
      return result.data.transfer_status?.toLowerCase();
    }
    return null;
  } catch (error) {
    console.error("Carrybee Status Check Error:", error);
    return null;
  }
};
