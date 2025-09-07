"use client";

import { useEffect, useState } from "react";
import { IconFiretruck as IconFire, IconUsers } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTacAmount } from "@/lib/utils";
import { usePeriod } from "@/contexts/period-context";

export function SectionCards() {
  const [data, setData] = useState<null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedPeriod, refreshKey } = usePeriod();

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const TAC_LABEL = () => {
    return (
      <Badge variant="default" className="text-sm rounded-lg">
        $TAC
      </Badge>
    );
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rewards Minted</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            N/A
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Network-wide inflation since genesis{" "}
          </div>
          <div className="text-muted-foreground">
            Logic to be implemented later
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            Total Rewards to Restricted Validators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {formatTacAmount(0)} <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Validator commission only (90% share){" "}
          </div>
          <div className="text-muted-foreground">Since network launch</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Accumulated Rewards Burnt</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {formatTacAmount(0)}
            <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total rewards burnt since network launch{" "}
          </div>
          <div className="text-muted-foreground">
            Currently 0 (no burns executed)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>80% of Total Staking Rewards</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {formatTacAmount(0)} <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Burn obligation
          </div>
          <div className="text-muted-foreground">Since network launch</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>% Supply Staked to Restricted</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            0%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bonded stake held by restricted set
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
