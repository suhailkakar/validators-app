import { NextRequest, NextResponse } from "next/server";
import { BurnCalculator } from "@/lib/burnCalculator";

// Use the same cache as other endpoints
let cache: {
  data: any;
  timestamp: number | null;
  ttl: number;
} = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
};

function isCacheValid() {
  return (
    cache.data && cache.timestamp && Date.now() - cache.timestamp < cache.ttl
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "2025-08";

    // Check cache first
    if (isCacheValid()) {
      return NextResponse.json({
        ...cache.data,
        cached: true,
        cacheAge: Math.round((Date.now() - cache.timestamp!) / 1000),
      });
    }

    // Calculate fresh data
    const calculator = new BurnCalculator();
    const report = await calculator.calculateMonthlyBurns(period);

    // Update cache
    cache.data = report;
    cache.timestamp = Date.now();

    return NextResponse.json({
      ...report,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Calculation failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
