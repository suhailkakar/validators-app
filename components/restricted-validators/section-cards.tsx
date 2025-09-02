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
import { apiClient, type BurnSummary } from "@/lib/api";
import { formatTacAmount } from "@/lib/utils";
import { usePeriod } from "@/contexts/period-context";

export function SectionCards() {
  const [data, setData] = useState<BurnSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedPeriod, refreshKey } = usePeriod();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const summary = await apiClient.getBurnSummary(selectedPeriod);
        setData(summary);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch burn summary:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedPeriod, refreshKey]);

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

  if (error || !data) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className="text-2xl font-semibold text-red-500">
              {error || "No data available"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const TAC_LABEL = () => {
    return (
      <Badge variant="default" className="text-sm rounded-lg ">
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
            {formatTacAmount(data.totalInflationRewards)} <TAC_LABEL />
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
            {formatTacAmount(data.accumulatedRewardsBurnt)} <TAC_LABEL />
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
            {formatTacAmount(data.totalBurnAmount)} <TAC_LABEL />
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
            {parseFloat(data.restrictedStakePercentage || "0").toFixed(1)}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bonded stake held by restricted set
          </div>
          <div className="text-muted-foreground">Period: {data.period}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
