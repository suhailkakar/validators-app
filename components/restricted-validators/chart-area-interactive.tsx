"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Dot } from "recharts";
import { cn } from "@/lib/utils";

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

// Base data structure for Aug-Dec 2025
const getBaseChartData = () => [
  { month: "2025-08", name: "Aug", burnAmount: 0 },
  { month: "2025-09", name: "Sep", burnAmount: null },
  { month: "2025-10", name: "Oct", burnAmount: null },
  { month: "2025-11", name: "Nov", burnAmount: null },
  { month: "2025-12", name: "Dec", burnAmount: null },
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
  const [isBlinking, setIsBlinking] = React.useState(false);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Monthly Burn Amounts</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Validator burn requirements by month
          </span>
          <span className="@[540px]/card:hidden">
            Monthly burns (Aug 2025 data)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-muted-foreground">Loading burn data...</div>
          </div>
        ) : error ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
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
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value} 2025`}
                    formatter={(value, name) => [
                      `${formatLargeNumber(value as number)} TAC`,
                      name,
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
