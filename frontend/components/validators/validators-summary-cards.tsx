"use client";

import {
  IconUsers,
  IconShield,
  IconPercentage,
  IconCoins,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { SummaryCard } from "@/components/ui/summary-card";

export function ValidatorsSummaryCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SummaryCard
        icon={<IconUsers className="h-4 w-4" />}
        title="Total Validators"
        value="1,247"
        description="Active + Inactive validators"
        subtitle="Source: /cosmos/staking/"
      />
      <SummaryCard
        icon={<IconCoins className="h-4 w-4" />}
        title="Total Delegated to Validators"
        value="18.2B"
        showTacBadge
        description="TAC staked to validators"
        subtitle="Cross-check vs staking pool"
      />

      <SummaryCard
        icon={<IconShield className="h-4 w-4" />}
        title="Active Validators"
        value="1,189"
        description="Bonded validators"
        subtitle="Gives quick sense of validator health"
      />

      <SummaryCard
        icon={<IconPercentage className="h-4 w-4" />}
        title="Avg Commission Rate"
        value="8.7%"
        description="Mean commission % across all validators"
        subtitle="Source: /validators commission fields"
      />
    </div>
  );
}
