import { NextResponse } from "next/server";
import { syncOrdersStatus } from "@/lib/courier-sync";

export async function POST() {
  try {
    const result = await syncOrdersStatus();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
