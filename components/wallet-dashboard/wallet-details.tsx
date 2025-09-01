"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconWallet } from "@tabler/icons-react";

interface WalletMetric {
  label: string;
  value: string;
}

export function WalletDetails() {
  const walletData: WalletMetric[] = [
    { label: "BABY$", value: "0.05" },
    { label: "Change", value: "-0.97%" },
    { label: "Holdings", value: "2,011,989,197.949192" },
    { label: "Value", value: "$93,473,577.64" },
    { label: "Available", value: "2,011,989,197.949192" },
    { label: "Delegatable Vesting", value: "0.000000" },
  ];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWallet className="h-5 w-5" />
          Wallet Details
        </CardTitle>
        <CardDescription>
          Current wallet balance and token breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {walletData.map((metric, index) => (
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
