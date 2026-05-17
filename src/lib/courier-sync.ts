
import { supabase } from "@/integrations/supabase/client";
import { checkSteadfastStatus } from "@/lib/steadfast";
import { checkCarrybeeStatus } from "@/lib/carrybee";
import { checkRedxStatus } from "@/lib/redx";

function mapExternalStatus(externalStatus: string): string | null {
  const s = externalStatus.toLowerCase();
  if (s.includes('delivered')) return 'delivered';
  if (s.includes('cancelled') || s.includes('rejected') || s.includes('failed')) return 'cancelled';
  if (s.includes('return')) return 'return';
  if (s.includes('shipped') || s.includes('transit') || s.includes('picked up') || s.includes('dispatched') || s.includes('out for delivery')) return 'shipped';
  return null;
}

/**
 * Synchronizes all active orders with their external courier statuses.
 */
export async function syncOrdersStatus() {
  try {
    // Check both 'processing' and 'shipped' orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["processing", "shipped"])
      .not("tracking_id", "is", null)
      .not("courier_name", "is", null);

    if (error) throw error;
    if (!orders || orders.length === 0) return { success: true, synced: 0, message: "No active orders require synchronization." };

    let syncedCount = 0;
    const updates: { id: string; status: string; timeline: any[] }[] = [];

    for (const order of orders) {
      try {
        const courier = order.courier_name?.toLowerCase();
        let externalStatus: string | null = null;

        if (courier === 'steadfast') externalStatus = await checkSteadfastStatus(order.tracking_id!);
        else if (courier === 'carrybee') externalStatus = await checkCarrybeeStatus(order.tracking_id!);
        else if (courier === 'redx') externalStatus = await checkRedxStatus(order.tracking_id!);

        if (externalStatus) {
          const newInternalStatus = mapExternalStatus(externalStatus);
          // Only update if the status has actually changed
          if (newInternalStatus && newInternalStatus !== order.status) {
            const existingTimeline = Array.isArray(order.timeline) ? order.timeline : [];
            updates.push({
              id: order.id,
              status: newInternalStatus,
              timeline: [...existingTimeline, {
                status: newInternalStatus,
                label: newInternalStatus.toUpperCase(),
                time: new Date().toISOString(),
                desc: `External courier status update (${courier}): ${externalStatus}`
              }]
            });
            syncedCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to sync order ${order.id}:`, err);
      }
    }

    if (updates.length > 0) {
      // Use individual updates for now to ensure timeline consistency
      for (const update of updates) {
        await supabase
          .from("orders")
          .update({ 
            status: update.status, 
            timeline: update.timeline as any 
          })
          .eq("id", update.id);
      }
    }

    return { 
      success: true, 
      synced: syncedCount, 
      message: syncedCount > 0 
        ? `সফলভাবে ${syncedCount} টি অর্ডারের স্ট্যাটাস আপডেট করা হয়েছে।` 
        : "সবগুলো অর্ডারের স্ট্যাটাস ইতিমধ্যে আপ-টু-ডেট আছে।" 
    };
  } catch (error: any) {
    console.error("Sync Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Synchronizes a single order's status with its external courier.
 */
export async function syncSingleOrder(orderId: string) {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) throw new Error("Order not found");
    if (!order.tracking_id || !order.courier_name) return { success: false, message: "No tracking info available" };

    const courier = order.courier_name.toLowerCase();
    let externalStatus: string | null = null;

    if (courier === 'steadfast') externalStatus = await checkSteadfastStatus(order.tracking_id);
    else if (courier === 'carrybee') externalStatus = await checkCarrybeeStatus(order.tracking_id);
    else if (courier === 'redx') externalStatus = await checkRedxStatus(order.tracking_id);

    if (externalStatus) {
      const newInternalStatus = mapExternalStatus(externalStatus);
      if (newInternalStatus && newInternalStatus !== order.status) {
        const existingTimeline = Array.isArray(order.timeline) ? order.timeline : [];
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: newInternalStatus,
            timeline: [...existingTimeline, {
              status: newInternalStatus,
              label: newInternalStatus.toUpperCase(),
              time: new Date().toISOString(),
              desc: `Manual status refresh (${courier}): ${externalStatus}`
            }] as any
          })
          .eq("id", orderId);
        
        if (updateError) throw updateError;
        return { success: true, status: newInternalStatus, externalStatus, updated: true };
      }
      return { success: true, status: order.status, externalStatus, updated: false, message: "Status is already up to date" };
    }

    return { success: false, message: "Could not retrieve status from courier" };
  } catch (error: any) {
    console.error(`Single order sync error (${orderId}):`, error);
    return { success: false, message: error.message };
  }
}
