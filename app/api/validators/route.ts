import { NextRequest, NextResponse } from "next/server";
import { BurnCalculator } from "@/lib/burnCalculator";

// Use the same cache as burn-summary
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

    // Use cache if available
    let report;
    if (isCacheValid()) {
      report = cache.data;
    } else {
      const calculator = new BurnCalculator();
      report = await calculator.calculateMonthlyBurns(period);
      cache.data = report;
      cache.timestamp = Date.now();
    }

    // Format validator data for frontend
    const validators = report.validators.map((v: any) => ({
      address: v.address,
      moniker: v.moniker,
      status: v.status,
      isActive: v.isActive,

      // Commission info
      commissionRate: `${Math.ceil(v.commissionRate * 100)}%`,
      commissionRateRaw: v.commissionRate,
      hasCommissionIssues: v.commissionIssues.length > 0,

      // Amounts (formatted for display)
      outstandingRewards: v.outstandingRewardsTac,
      unclaimedCommission: v.unclaimedCommissionTac,
      claimedCommission: v.claimedCommissionTac,
      totalCommission: v.totalCommissionTac,
      totalRewards: v.totalRewardsTac,
      burnAmount: v.burnAmountTac,
      validatorKeeps: v.validatorKeepsTac,

      // Raw amounts (for precision calculations)
      burnAmountRaw: v.burnAmount,
      totalCommissionRaw: v.totalCommissionUtac,

      // Flags
      shouldBurn: v.hasCommission,
      hasRewards: v.hasRewards,
      hasCommission: v.hasCommission,

      // Metadata
      calculatedAt: v.fetchedAt,

      // Lifetime totals for new columns (raw utac for client-side formatting)
      totalAccumulatedRewards: v.totalCommissionUtac,
      totalRewardsAlreadyBurnt: "0",
      totalRewardsToBeBurn: v.burnAmount,
    }));

    return NextResponse.json({
      validators,
      count: validators.length,
      timestamp: new Date().toISOString(),
      period: report.period.displayName,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Validator data fetch failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
