"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { usePeriod } from "@/contexts/period-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Monthly burn amounts chart";

// Helper function to format large numbers as M/K
const formatLargeNumber = (value: number) => {
  if (value >= 1000000) {
    return `${Math.ceil(value / 1000000)}M`;
  } else if (value >= 1000) {
    return `${Math.ceil(value / 1000)}K`;
  }
  return Math.ceil(value).toString();
};

// Base data structure for July-December 2025
const getBaseChartData = () => [
  { month: "2025-07", name: "Jul", burnAmount: 0 }, // Network launch - 0 burnt
  { month: "2025-08", name: "Aug", burnAmount: 0 }, // No burns yet - 0 burnt
  { month: "2025-09", name: "Sep", burnAmount: 0 }, // No burns yet - 0 burnt
  { month: "2025-10", name: "Oct", burnAmount: null }, // Future
  { month: "2025-11", name: "Nov", burnAmount: null }, // Future
  { month: "2025-12", name: "Dec", burnAmount: null }, // Future
];

const chartConfig = {
  burnAmount: {
    label: "Burn Amount (TAC)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const [chartData, setChartData] = React.useState(getBaseChartData());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { selectedPeriod, refreshKey } = usePeriod();

  React.useEffect(() => {
    async function fetchBurnData() {
      try {
        setLoading(true);
        const { cosmosClient } = await import("@/lib/cosmosClient");
        const result = await cosmosClient.getValidators();

        // Calculate total burnt amount from all validators
        const totalBurnt = result.validators.reduce((sum: number, validator: any) => {
          return sum + parseFloat(validator.totalRewardsAlreadyBurnt || "0");
        }, 0);

        console.log(`🔥 Total burnt from cosmosClient: ${totalBurnt} TAC`);

        // Update current month (September) with real burn data
        const updatedData = getBaseChartData().map((item) => {
          if (item.month === "2025-09") {
            return { ...item, burnAmount: totalBurnt };
          }
          return item;
        });

        setChartData(updatedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch burn data:", err);
        setError("Failed to load burn data");
      } finally {
        setLoading(false);
      }
    }

    fetchBurnData();
  }, [selectedPeriod, refreshKey]);

  return (
    <Card className="@container/card flex flex-col">
      <CardHeader>
        <CardTitle>Total Rewards Burnt</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total rewards actually burnt by restricted validators over time
          </span>
          <span className="@[540px]/card:hidden">
            Actual burns: Jul-Dec 2025
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading burn data...</div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillBurnAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-burnAmount)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-burnAmount)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatLargeNumber}
                domain={[0, 2000000]}
                ticks={[0, 500000, 1000000, 1500000, 2000000]}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value} 2025`}
                    formatter={(value) => [
                      `${(value as number).toLocaleString()} TAC`,
                      "Total Burnt",
                    ]}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="burnAmount"
                type="linear"
                fill="url(#fillBurnAmount)"
                stroke="var(--color-burnAmount)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
