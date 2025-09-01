import { NextRequest, NextResponse } from "next/server";

// Shared cache object (this should ideally be in a separate cache module)
let cache: {
  data: any;
  timestamp: number | null;
  ttl: number;
} = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
};

export async function POST(request: NextRequest) {
  try {
    cache.data = null;
    cache.timestamp = null;

    return NextResponse.json({
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cache clear failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
