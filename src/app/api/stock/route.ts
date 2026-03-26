import { NextResponse } from "next/server";
import { getStockStatus } from "@/lib/scraper";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const status = await getStockStatus(latNum, lngNum);
    return NextResponse.json(status);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
