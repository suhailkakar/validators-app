"use client";

import {
  IconCoins,
  IconTrendingUp,
  IconUsers,
  IconPercentage,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SummaryCards() {
  // Demo data - replace with real data later
  const demoData = {
    totalSupplyStaked: "2,847,392,156",
    inflationMinted: "N/A",
    totalDelegators: "1,247",
    avgCommissionRate: "8.5",
  };

  const TAC_LABEL = () => {
    return (
      <Badge variant="default" className="text-sm rounded-lg">
        $TAC
      </Badge>
    );
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCoins className="h-4 w-4" />
            Total Supply Staked
          </CardDescription>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {demoData.totalSupplyStaked} <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Network-wide staking volume
          </div>
          <div className="text-muted-foreground">
            Total tokens locked in staking
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4" />
            Inflation Minted
          </CardDescription>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {demoData.inflationMinted}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New tokens from inflation
          </div>
          <div className="text-muted-foreground">
            N/A until indexer is ready
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            Total Delegators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {demoData.totalDelegators}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active staking participants
          </div>
          <div className="text-muted-foreground">Unique wallet addresses</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconPercentage className="h-4 w-4" />
            Avg Commission Rate
          </CardDescription>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {demoData.avgCommissionRate}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Average validator commission
          </div>
          <div className="text-muted-foreground">Across all validators</div>
        </CardFooter>
      </Card>
    </div>
  );
}
