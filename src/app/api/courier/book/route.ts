
import { NextResponse } from "next/server";
import { bookCarrybeeParcel } from "@/lib/carrybee";
import { bookSteadfastParcel } from "@/lib/steadfast";
import { bookRedxParcel } from "@/lib/redx";

export async function POST(req: Request) {
  try {
    const { courier, order } = await req.json();

    if (!courier || !order) {
      return NextResponse.json({ success: false, message: "Missing courier or order data" }, { status: 400 });
    }

    let result;
    if (courier === 'carrybee') {
      result = await bookCarrybeeParcel(order);
    } else if (courier === 'steadfast') {
      result = await bookSteadfastParcel(order);
    } else if (courier === 'redx') {
      result = await bookRedxParcel(order);
    } else {
      return NextResponse.json({ success: false, message: "Unsupported courier" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
