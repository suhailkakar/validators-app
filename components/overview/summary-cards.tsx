"use client";

import {
  IconCoins,
  IconTrendingUp,
  IconUsers,
  IconPercentage,
} from "@tabler/icons-react";

import { SummaryCard } from "@/components/ui/summary-card";

export function SummaryCards() {
  const demoData = {
    totalSupplyStaked: "2,847,392,156",
    inflationMinted: "N/A",
    totalDelegators: "1,247",
    avgCommissionRate: "8.5",
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SummaryCard
        icon={<IconCoins className="h-4 w-4" />}
        title="Total Supply Staked"
        value={demoData.totalSupplyStaked}
        showTacBadge={true}
        description="Network-wide staking volume"
        subtitle="Total tokens locked in staking"
      />

      <SummaryCard
        icon={<IconTrendingUp className="h-4 w-4" />}
        title="Inflation Minted"
        value={demoData.inflationMinted}
        description="New tokens from inflation"
        subtitle="N/A until indexer is ready"
      />

      <SummaryCard
        icon={<IconUsers className="h-4 w-4" />}
        title="Total Delegators"
        value={demoData.totalDelegators}
        description="Active staking participants"
        subtitle="Unique wallet addresses"
      />

      <SummaryCard
        icon={<IconPercentage className="h-4 w-4" />}
        title="Avg Commission Rate"
        value={`${demoData.avgCommissionRate}%`}
        description="Average validator commission"
        subtitle="Across all validators"
      />
    </div>
  );
}
