"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";

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

export const description = "Delegation distribution pie chart";

// Demo data for delegations
const chartData = [
  { validator: "Cosmos Validator", stake: 33.3, fill: "var(--chart-1)" },
  { validator: "StakeLab", stake: 26.7, fill: "var(--chart-2)" },
  { validator: "Validator One", stake: 17.8, fill: "var(--chart-3)" },
  { validator: "Stake Master", stake: 13.3, fill: "var(--chart-4)" },
  { validator: "Chain Validator", stake: 8.9, fill: "var(--chart-5)" },
];

const chartConfig = {
  stake: {
    label: "Stake Percentage",
  },
  "Cosmos Validator": {
    label: "Cosmos Validator",
    color: "var(--chart-1)",
  },
  StakeLab: {
    label: "StakeLab",
    color: "var(--chart-2)",
  },
  "Validator One": {
    label: "Validator One",
    color: "var(--chart-3)",
  },
  "Stake Master": {
    label: "Stake Master",
    color: "var(--chart-4)",
  },
  "Chain Validator": {
    label: "Chain Validator",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function DelegationsPanel() {
  return (
    <Card className="@container/card">
      <CardHeader className="items-center pb-0">
        <CardTitle>Delegation Distribution</CardTitle>
        <CardDescription>Stake distribution across validators</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[270px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="stake"
              nameKey="validator"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
