"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Dot } from "recharts";
import { cn } from "@/lib/utils";

import { apiClient, type BurnSummary } from "@/lib/api";
import { formatTacAmount } from "@/lib/utils";
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

  React.useEffect(() => {
    async function fetchBurnData() {
      try {
        setLoading(true);
        // For the chart, we'll use the current period but could expand this later
        const burnSummary = await apiClient.getBurnSummary("2025-08");

        // Parse the total burn amount and add it to August
        const totalBurnAmount =
          parseFloat(burnSummary.totalBurnAmount.replace(/,/g, "")) || 0;

        console.log("Total burn amount:", totalBurnAmount); // Debug log

        // Show Jul-Dec with line from 0 to Aug data, then stop
        const updatedData = [
          { month: "2025-07", name: "Jul", burnAmount: 0 },
          { month: "2025-08", name: "Aug", burnAmount: totalBurnAmount },
          { month: "2025-09", name: "Sep", burnAmount: null },
          { month: "2025-10", name: "Oct", burnAmount: null },
          { month: "2025-11", name: "Nov", burnAmount: null },
          { month: "2025-12", name: "Dec", burnAmount: null },
        ];

        console.log("Updated chart data:", updatedData); // Debug log

        setChartData(updatedData);
        setError(null);

        // Start blinking animation for August data
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 2000); // Stop after 2 seconds
      } catch (err) {
        console.error("Failed to fetch burn data:", err);
        setError("Failed to load burn data");
        // Keep base data with zeros on error
        setChartData(getBaseChartData());
      } finally {
        setLoading(false);
      }
    }

    fetchBurnData();
  }, []);

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
