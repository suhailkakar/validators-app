"use client";

import { useEffect, useState } from "react";
import {
  IconAlertCircle as IconAlert,
  IconCheck,
  IconFiretruck as IconFire,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
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
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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

  // Calculate compliance percentage
  const compliancePercentage =
    data.totalValidators > 0
      ? ((data.totalValidators - (data.alerts.total - data.alerts.warnings)) /
          data.totalValidators) *
        100
      : 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Inflation Rewards</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTacAmount(data.totalInflationRewards)} TAC
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              All Validators
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Outstanding + commission rewards <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">Period: {data.period}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Burn Required</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTacAmount(data.totalBurnAmount)} TAC
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFire className="size-4" />
              80% Share
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            80% of commission rewards <IconFire className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Must be burned to burn address
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Commission Compliance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {compliancePercentage.toFixed(0)}%
          </CardTitle>
          <CardAction>
            <Badge
              variant={
                data.allCommissionRatesCorrect ? "default" : "destructive"
              }
            >
              {data.allCommissionRatesCorrect ? (
                <IconCheck className="size-4" />
              ) : (
                <IconAlert className="size-4" />
              )}
              {data.allCommissionRatesCorrect ? "Compliant" : "Issues"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.allCommissionRatesCorrect
              ? "All rates at 90%"
              : "Rate issues detected"}
            {data.allCommissionRatesCorrect ? (
              <IconCheck className="size-4" />
            ) : (
              <IconAlert className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            90% commission rate required
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Validators</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.activeValidators}/20
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              {((data.activeValidators / 20) * 100).toFixed(0)}% Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Restricted validators operational <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {20 - data.activeValidators} validators inactive
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
