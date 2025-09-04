import { NextResponse } from "next/server";
import { CosmosClient } from "@/lib/cosmosClient";

// Cache for block height (shorter cache since blocks are produced frequently)
let cache: {
  data: { height: string; timestamp: string } | null;
  timestamp: number | null;
  ttl: number;
} = {
  data: null,
  timestamp: null,
  ttl: 10 * 1000, // 10 seconds cache for block height
};

function isCacheValid() {
  return (
    cache.data && cache.timestamp && Date.now() - cache.timestamp < cache.ttl
  );
}

export async function GET() {
  try {
    // Check cache first
    if (isCacheValid()) {
      return NextResponse.json({
        ...cache.data,
        cached: true,
        cacheAge: Math.round((Date.now() - cache.timestamp!) / 1000),
      });
    }

    // Fetch fresh block height
    const cosmosClient = new CosmosClient();
    const latestBlock = await cosmosClient.getLatestBlock();

    const blockData = {
      height: latestBlock.block?.header?.height || "0",
      timestamp: new Date().toISOString(),
    };

    // Update cache
    cache.data = blockData;
    cache.timestamp = Date.now();

    return NextResponse.json({
      ...blockData,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch block height",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}