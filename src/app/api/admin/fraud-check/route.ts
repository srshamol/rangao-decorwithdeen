
import { NextRequest, NextResponse } from "next/server";
import { checkCustomerFraud } from "@/lib/fraud-check";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
    }

    const result = await checkCustomerFraud(phone);
    
    if (result) {
      return NextResponse.json({ success: true, ...result });
    } else {
      return NextResponse.json({ success: false, message: "Could not perform fraud check. Check API key." }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Fraud Check API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
