import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      chainId: config.chain.chainId,
      tokenDenom: config.chain.tokenDenom,
      tokenDecimals: config.chain.tokenDecimals,
      burnAddress: config.burnAddress,
      burnRate: config.business.burnRate,
      expectedCommissionRate: config.business.validatorCommissionRate,
      restrictedValidatorCount: config.restrictedValidators.length,
      rpcEndpoint: config.chain.rpcEndpoint.includes("tac.build")
        ? "✅ Real TAC"
        : "⚠️ Placeholder",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Config fetch failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
