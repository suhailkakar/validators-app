"use client";

import {
  IconUsers,
  IconShield,
  IconPercentage,
  IconCoins,
  IconAlertTriangle,
} from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ValidatorsSummaryCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      {/* Total Validators */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            Total Validators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">1,247</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active + Inactive validators
          </div>
          <div className="text-muted-foreground">Source: /cosmos/staking/</div>
        </CardFooter>
      </Card>

      {/* Active Validators */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            Active Validators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">1,189</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bonded validators
          </div>
          <div className="text-muted-foreground">
            Gives quick sense of validator health
          </div>
        </CardFooter>
      </Card>

      {/* Average Commission Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconPercentage className="h-4 w-4" />
            Avg Commission Rate
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">8.7%</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Mean commission % across all validators
          </div>
          <div className="text-muted-foreground">
            Source: /validators commission fields
          </div>
        </CardFooter>
      </Card>

      {/* Total Delegated */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCoins className="h-4 w-4" />
            Total Delegated to Validators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">18.2B</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            TAC staked to validators
          </div>
          <div className="text-muted-foreground">
            Cross-check vs staking pool
          </div>
        </CardFooter>
      </Card>

      {/* Largest Validator Stake */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4" />
            Largest Validator % of Stake
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">15.2%</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            of total network stake
          </div>
          <div className="text-muted-foreground">
            Highlight centralization risk
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
