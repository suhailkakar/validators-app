import { NextRequest, NextResponse } from "next/server";
import { BurnCalculator } from "@/lib/burnCalculator";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const calculator = new BurnCalculator();
    const health = await calculator.healthCheck();

    return NextResponse.json({
      status: health.healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        burnCalculator: health.healthy,
        chainConnection:
          health.validatorService?.cosmosClient?.healthy || false,
      },
      chainId: config.chain.chainId,
      validatorCount: config.restrictedValidators.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
