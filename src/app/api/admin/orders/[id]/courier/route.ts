
import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";
import { bookSteadfastParcel } from "@/lib/steadfast";
import { bookCarrybeeParcel } from "@/lib/carrybee";
import { bookRedxParcel } from "@/lib/redx";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { courier } = await req.json();

    if (!id || !courier) {
      return NextResponse.json({ success: false, message: "Missing id or courier" }, { status: 400 });
    }

    // 1. Fetch Order from Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Book with Courier
    let result: any;
    if (courier === 'steadfast') {
      result = await bookSteadfastParcel(order);
    } else if (courier === 'carrybee') {
      result = await bookCarrybeeParcel(order);
    } else if (courier === 'redx') {
      result = await bookRedxParcel(order);
    } else {
      // For Pathao/Paperfly, return a more descriptive error since they aren't implemented yet
      return NextResponse.json({ success: false, message: `কুরিয়ার ${courier.toUpperCase()} বর্তমানে ইন্টিগ্রেটেড নেই।` }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // 3. Update Order in Supabase
    const trackingNumber = result.trackingId;
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: 'processing',
        tracking_number: trackingNumber,
        tracking_id: trackingNumber, // Ensure both fields are synced
        courier_name: courier,
        timeline: [
           ...((order.timeline as any[]) || []),
           { 
             status: 'processing', 
             label: 'Processing', 
             time: new Date().toISOString(), 
             desc: `অর্ডারটি ${courier.toUpperCase()} এর মাধ্যমে কুরিয়ারে পাঠানো হয়েছে। ট্র্যাকিং নাম্বার: ${trackingNumber}` 
           }
        ]
      } as any)
      .eq("id", id);

    if (updateError) {
      console.error("Order update error after booking:", updateError);
      return NextResponse.json({ 
        success: true, 
        trackingNumber, 
        message: `বুকিং সফল হয়েছে কিন্তু ডাটাবেজ আপডেট করা যায়নি। ট্র্যাকিং নাম্বার: ${trackingNumber}` 
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
      message: `অর্ডারটি সফলভাবে ${courier.toUpperCase()} এ বুক করা হয়েছে।`
    });

  } catch (error: any) {
    console.error("Dispatch API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
