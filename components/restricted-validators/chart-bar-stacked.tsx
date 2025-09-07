"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Rectangle, XAxis, YAxis } from "recharts";
import type { RectangleProps, BarProps } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTacAmount } from "@/lib/utils";
import { usePeriod } from "@/contexts/period-context";

const chartConfig = {
  claimed: {
    label: "Claimed Rewards",
    color: "var(--chart-1)",
  },
  unclaimed: {
    label: "Unclaimed Rewards",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface ValidatorData {
  validator: string;
  moniker: string;
  claimed: number;
  unclaimed: number;
  total: number;
}

export function ChartBarStacked() {
  const [data, setData] = useState<ValidatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedPeriod, refreshKey } = usePeriod();

  const renderClaimedShape: BarProps["shape"] = (props: unknown) => {
    const rectProps = props as RectangleProps & {
      payload?: { unclaimed?: number | string };
    };
    const unclaimed = Number(rectProps.payload?.unclaimed ?? 0);
    const radius =
      unclaimed === 0
        ? ([4, 4, 4, 4] as [number, number, number, number])
        : ([4, 0, 0, 4] as [number, number, number, number]);
    return <Rectangle {...rectProps} radius={radius} />;
  };

  const renderUnclaimedShape: BarProps["shape"] = (props: unknown) => {
    const rectProps = props as RectangleProps & {
      payload?: { claimed?: number | string };
    };
    const claimed = Number(rectProps.payload?.claimed ?? 0);
    const radius =
      claimed === 0
        ? ([4, 4, 4, 4] as [number, number, number, number])
        : ([0, 4, 4, 0] as [number, number, number, number]);
    return <Rectangle {...rectProps} radius={radius} />;
  };

  useEffect(() => {
    async function fetchValidators() {
      try {
        setLoading(true);
        const { cosmosClient } = await import("@/lib/cosmosClient");
        const result = await cosmosClient.getValidators();

        // Transform the data for the chart
        type SourceValidator = {
          moniker: string;
          claimedRewards?: string;
          unclaimedRewards?: string;
        };

        const transformedData = (result.validators as SourceValidator[]).map(
          (validator) => {
            // Convert utac to TAC using proper converter
            const claimed = parseFloat(
              formatTacAmount(validator.claimedRewards || "0").replace(/,/g, "")
            );
            const unclaimed = parseFloat(
              formatTacAmount(validator.unclaimedRewards || "0").replace(
                /,/g,
                ""
              )
            );
            const total = claimed + unclaimed;

            // Truncate moniker for display
            const shortMoniker =
              validator.moniker.length > 15
                ? validator.moniker.substring(0, 12) + "..."
                : validator.moniker;

            return {
              validator: shortMoniker,
              moniker: validator.moniker,
              claimed,
              unclaimed,
              total,
            };
          }
        );

        // Sort by total rewards descending
        transformedData.sort((a, b) => b.total - a.total);

        console.log("📊 Chart data:", transformedData);
        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch validator data for chart:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    }

    fetchValidators();
  }, [selectedPeriod, refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validator Rewards Distribution</CardTitle>
          <CardDescription>Claimed vs Unclaimed Rewards</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Totals available if needed later
  // const totalClaimedRewards = data.reduce((sum, item) => sum + item.claimed, 0);
  // const totalUnclaimedRewards = data.reduce((sum, item) => sum + item.unclaimed, 0);
  // const grandTotal = totalClaimedRewards + totalUnclaimedRewards;

  const yAxisLabelWidth = 150;

  const renderYAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: string };
  }) => {
    const item = data.find((v) => v.validator === payload.value);
    const label = item?.moniker || payload.value;

    const cleanLabel = label.includes("- Do Not Delegate")
      ? label.substring(0, label.indexOf("- Do Not Delegate"))
      : label;
    return (
      <text
        x={x}
        y={y}
        dy={3}
        dx={-yAxisLabelWidth + 8}
        textAnchor="start"
        className="fill-muted-foreground"
        fontSize={12}
      >
        {cleanLabel.substring(0, 20)}...
      </text>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Validator Rewards Distribution</CardTitle>
        <CardDescription>
          Claimed vs Unclaimed Rewards by Validator
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-full ">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              right: 20,
              top: 10,
              bottom: 10,
            }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="validator"
              type="category"
              tickLine={false}
              axisLine={false}
              width={yAxisLabelWidth}
              tick={renderYAxisTick}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={false}
                  formatter={(value, name) => [
                    `${formatTacAmount(value as number)} TAC - `,
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ]}
                  labelFormatter={(label) => {
                    const validator = data.find((v) => v.validator === label);
                    return validator?.moniker || label;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="claimed"
              stackId="a"
              fill="var(--color-claimed)"
              shape={renderClaimedShape}
            />
            <Bar
              dataKey="unclaimed"
              stackId="a"
              fill="var(--color-unclaimed)"
              shape={renderUnclaimedShape}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
