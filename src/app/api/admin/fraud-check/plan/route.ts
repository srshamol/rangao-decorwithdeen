
import { NextResponse } from "next/server";
import { getBDCourierPlan } from "@/lib/fraud-check";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const overrideKey = searchParams.get("key");
    
    const plan = await getBDCourierPlan(overrideKey || undefined);
    if (plan) {
      return NextResponse.json({ success: true, data: plan });
    } else {
      return NextResponse.json({ success: false, message: "Could not fetch plan details" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Fraud Plan API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
