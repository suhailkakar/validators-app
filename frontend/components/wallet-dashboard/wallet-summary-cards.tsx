"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IconCoins, 
  IconShield, 
  IconGift, 
  IconClock, 
  IconTrendingUp 
} from "@tabler/icons-react";

export function WalletSummaryCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-transparent dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      {/* Wallet Balance */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconCoins className="h-4 w-4" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234.56</div>
          <div className="text-sm text-muted-foreground">TAC</div>
        </CardContent>
      </Card>

      {/* Total Staked */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconShield className="h-4 w-4" />
            Total Staked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,000</div>
          <div className="text-sm text-muted-foreground">TAC</div>
        </CardContent>
      </Card>

      {/* Unclaimed Rewards */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconGift className="h-4 w-4" />
            Unclaimed Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,210</div>
          <div className="text-sm text-muted-foreground">TAC</div>
        </CardContent>
      </Card>

      {/* Currently Unbonding */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconClock className="h-4 w-4" />
            Currently Unbonding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3,500</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            TAC <Badge variant="secondary">⏳ 7 days left</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lifetime Rewards Earned */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconTrendingUp className="h-4 w-4" />
            Lifetime Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18,920</div>
          <div className="text-sm text-muted-foreground">TAC earned</div>
        </CardContent>
      </Card>
    </div>
  );
}
