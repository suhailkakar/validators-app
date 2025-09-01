"use client";

import {
  IconCoins,
  IconShield,
  IconGift,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/ui/summary-card";

export function WalletSummaryCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <SummaryCard
        icon={<IconCoins className="h-4 w-4" />}
        title="Wallet Balance"
        value="1,234.56"
        showTacBadge={true}
        description="Available TAC tokens"
        subtitle="Liquid balance for transactions"
      />

      <SummaryCard
        icon={<IconShield className="h-4 w-4" />}
        title="Total Staked"
        value="45,000"
        showTacBadge={true}
        description="TAC delegated to validators"
        subtitle="Earning staking rewards"
      />

      <SummaryCard
        icon={<IconGift className="h-4 w-4" />}
        title="Unclaimed Rewards"
        value="1,210"
        showTacBadge={true}
        description="Pending reward collection"
        subtitle="Claim anytime to wallet"
      />

      <SummaryCard
        icon={<IconClock className="h-4 w-4" />}
        title="Currently Unbonding"
        value="3,500"
        showTacBadge={true}
        description="TAC in unbonding period"
        badge={<Badge variant="secondary">⏳ 7 days left</Badge>}
      />

      <SummaryCard
        icon={<IconTrendingUp className="h-4 w-4" />}
        title="Lifetime Rewards"
        value="18,920"
        showTacBadge={true}
        description="Total TAC earned from staking"
        subtitle="Since first delegation"
      />
    </div>
  );
}
