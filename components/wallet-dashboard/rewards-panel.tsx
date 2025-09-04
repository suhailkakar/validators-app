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
import { IconTrendingUp } from "@tabler/icons-react";

export const description = "Rewards over time area chart";

// Demo data for rewards over time
const getDemoRewardsData = () => [
  { month: "Jan", rewards: 0 },
  { month: "Feb", rewards: 150 },
  { month: "Mar", rewards: 320 },
  { month: "Apr", rewards: 480 },
  { month: "May", rewards: 650 },
  { month: "Jun", rewards: 820 },
  { month: "Jul", rewards: 1210 },
];

const chartConfig = {
  rewards: {
    label: "Rewards (TAC)",
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

export function RewardsPanel() {
  const [chartData] = React.useState(getDemoRewardsData());

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTrendingUp className="h-5 w-5" />
          Rewards Over Time
        </CardTitle>
        <CardDescription>
          Monthly rewards accumulation trends (Demo Data)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRewards" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rewards)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rewards)"
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
              dataKey="rewards"
              type="linear"
              fill="url(#fillRewards)"
              stroke="var(--color-rewards)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
