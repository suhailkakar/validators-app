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

export function SectionCards() {
  const [data, setData] = useState<BurnSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const summary = await apiClient.getBurnSummary();
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
  }, []);

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Burn Amount</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTacAmount(data.totalBurnAmount)} TAC
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFire className="size-4" />
              Burn Required
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            80% of commission rewards <IconFire className="size-4" />
          </div>
          <div className="text-muted-foreground">Period: {data.period}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Validators</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.activeValidators}/{data.totalValidators}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              {((data.activeValidators / data.totalValidators) * 100).toFixed(
                0
              )}
              % Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Restricted validators operational <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {data.totalValidators - data.activeValidators} validators inactive
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top Validator Burn</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.topValidators.length > 0
              ? formatTacAmount(data.topValidators[0].burnAmount)
              : "0.0"}{" "}
            TAC
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFire className="size-4" />
              Highest
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.topValidators.length > 0
              ? data.topValidators[0].moniker
              : "No data"}{" "}
            <IconFire className="size-4" />
          </div>
          <div className="text-muted-foreground">Largest burn requirement</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>System Status</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.readyForExecution ? "Ready" : "Issues"}
          </CardTitle>
          <CardAction>
            <Badge variant={data.readyForExecution ? "default" : "destructive"}>
              {data.readyForExecution ? (
                <IconCheck className="size-4" />
              ) : (
                <IconAlert className="size-4" />
              )}
              {data.allCommissionRatesCorrect ? "All Good" : "Issues"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.allCommissionRatesCorrect
              ? "Commission rates valid"
              : "Rate issues detected"}
            {data.readyForExecution ? (
              <IconCheck className="size-4" />
            ) : (
              <IconAlert className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {data.alerts.total} total alerts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
