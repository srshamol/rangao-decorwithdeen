
import { NextRequest, NextResponse } from "next/server";
import { syncOrdersStatus } from "@/lib/courier-sync";

export async function POST(req: NextRequest) {
  try {
    const result = await syncOrdersStatus();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error("Bulk order sync API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
