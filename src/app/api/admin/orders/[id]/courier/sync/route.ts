
import { NextRequest, NextResponse } from "next/server";
import { syncSingleOrder } from "@/lib/courier-sync";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await syncSingleOrder(id);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error("Single order sync API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
