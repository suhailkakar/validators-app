"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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

export const description = "Delegation volume over time area chart";

// Demo data for delegation volume over time
const getDemoDelegationData = () => [
  { month: "Jan", volume: 1200000 },
  { month: "Feb", volume: 1350000 },
  { month: "Mar", volume: 1280000 },
  { month: "Apr", volume: 1420000 },
  { month: "May", volume: 1380000 },
  { month: "Jun", volume: 1550000 },
  { month: "Jul", volume: 1620000 },
  { month: "Aug", volume: 1750000 },
  { month: "Sep", volume: 1680000 },
  { month: "Oct", volume: 1820000 },
  { month: "Nov", volume: 1950000 },
  { month: "Dec", volume: 2100000 },
];

const chartConfig = {
  volume: {
    label: "Delegation Volume (TAC)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

// Helper function to format large numbers as M/K
const formatLargeNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(Math.ceil((value / 1000000) * 10) / 10).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(Math.ceil((value / 1000) * 10) / 10).toFixed(1)}K`;
  }
  return Math.ceil(value).toString();
};

export function DelegationVolumeChart() {
  const [chartData] = React.useState(getDemoDelegationData());

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Delegation Volume Over Time</CardTitle>
        <CardDescription>
          Monthly delegation volume trends (Demo Data)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-volume)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-volume)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
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
                  formatter={(value, name) => [
                    `${formatLargeNumber(value as number)} TAC`,
                    name,
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="volume"
              type="linear"
              fill="url(#fillVolume)"
              stroke="var(--color-volume)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
