import { NextResponse } from "next/server";
import { getStockStatus } from "@/lib/scraper";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  
  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }

  try {
    const status = await getStockStatus(location);
    return NextResponse.json(status);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
