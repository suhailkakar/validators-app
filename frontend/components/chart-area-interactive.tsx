"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

// Base data structure for Jan-Aug 2025
const getBaseChartData = () => [
  { month: "2025-01", name: "Jan", burnAmount: 0 },
  { month: "2025-02", name: "Feb", burnAmount: 0 },
  { month: "2025-03", name: "Mar", burnAmount: 0 },
  { month: "2025-04", name: "Apr", burnAmount: 0 },
  { month: "2025-05", name: "May", burnAmount: 0 },
  { month: "2025-06", name: "Jun", burnAmount: 0 },
  { month: "2025-07", name: "Jul", burnAmount: 0 },
  { month: "2025-08", name: "Aug", burnAmount: 0 },
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

  React.useEffect(() => {
    async function fetchBurnData() {
      try {
        setLoading(true);
        const burnSummary = await apiClient.getBurnSummary();

        // Parse the total burn amount and add it to August
        const totalBurnAmount =
          parseFloat(burnSummary.totalBurnAmount.replace(/,/g, "")) || 0;

        // Update chart data with real burn amount for August
        const updatedData = getBaseChartData().map((item) => {
          if (item.month === "2025-08") {
            return { ...item, burnAmount: totalBurnAmount };
          }
          return item;
        });

        setChartData(updatedData);
        setError(null);
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
            Validator burn requirements by month (2025)
          </span>
          <span className="@[540px]/card:hidden">Monthly burns 2025</span>
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
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value} 2025`}
                    formatter={(value, name) => [
                      `${formatTacAmount(value as number)} TAC`,
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
