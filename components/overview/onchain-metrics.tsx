"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconDatabase } from "@tabler/icons-react";

interface MetricData {
  label: string;
  value: string;
}

export function OnchainMetrics() {
  const metricsData: MetricData[] = [
    { label: "Block Height", value: "2,847,392" },
    { label: "Transactions", value: "45,231,567" },
    { label: "TXs per Block", value: "12.4" },
    { label: "Block Time", value: "6.2s" },
    { label: "Inflation", value: "8.5%" },
    { label: "Staking APR", value: "14.2%" },
  ];

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDatabase className="h-5 w-5" />
          Onchain Metrics
        </CardTitle>
        <CardDescription>
          Real-time network statistics and performance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metricsData.map((metric, index) => (
            <div key={index} className="space-y-1 p-3 bg-muted/80 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
              <div className="text-lg font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
