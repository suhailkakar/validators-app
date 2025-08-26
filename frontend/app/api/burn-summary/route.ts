import { NextRequest, NextResponse } from "next/server";
import { BurnCalculator, type BurnReport } from "@/lib/burnCalculator";
import { config } from "@/lib/config";

// Cache for expensive calculations (5 minute cache)
const cache: {
  data: BurnReport | null;
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
      const summary = createSummaryFromReport(cache.data as BurnReport);
      return NextResponse.json({
        ...summary,
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

    // Create simplified summary
    const summary = createSummaryFromReport(report);

    return NextResponse.json({
      ...summary,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Summary calculation failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function createSummaryFromReport(report: BurnReport) {
  // Create simplified summary
  const summary = {
    timestamp: new Date().toISOString(),
    period: report.period.displayName,
    status: report.period.status,

    // Key metrics
    totalValidators: report.summary.totalValidators,
    activeValidators: report.validators.filter((v) => v.isActive).length,
    totalBurnAmount: report.summary.totalBurnAmountTac,
    totalBurnAmountRaw: report.summary.totalBurnAmountUtac,
    totalInflationRewards: report.summary.totalRewardsTac,
    totalInflationRewardsRaw: report.summary.totalRewardsUtac,
    accumulatedRewardsBurnt: "0",
    accumulatedRewardsBurntRaw: "0",

    // Staking distribution
    restrictedStakePercentage: report.summary.restrictedStakePercentage || "0",
    restrictedStakeUtac: report.summary.restrictedStakeUtac || "0",
    totalBondedUtac: report.summary.totalBondedUtac || "0",

    // Top 3 validators
    topValidators: report.validators
      .filter((v) => v.hasCommission)
      .sort((a, b) => {
        const aBurn = parseFloat(a.burnAmountTac.replace(/,/g, ""));
        const bBurn = parseFloat(b.burnAmountTac.replace(/,/g, ""));
        return bBurn - aBurn;
      })
      .slice(0, 3)
      .map((v) => ({
        moniker: v.moniker,
        burnAmount: v.burnAmountTac,
        address: v.address,
      })),

    // System status
    allCommissionRatesCorrect:
      report.summary.validatorsWithCommissionIssues === 0,
    readyForExecution: report.summary.validatorsWithCommissionIssues === 0,

    // Configuration
    burnAddress: config.burnAddress,
    chainId: config.chain.chainId,

    // Alerts count
    alerts: {
      total: report.alerts.length,
      critical: report.alerts.filter((a) => a.type === "critical").length,
      warnings: report.alerts.filter((a) => a.type === "warning").length,
    },
  };

  return summary;
}
