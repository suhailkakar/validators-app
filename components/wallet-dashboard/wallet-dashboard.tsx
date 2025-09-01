"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { WalletSummaryCards } from "./wallet-summary-cards";
import { DelegationsPanel } from "./delegations-panel";
import { RewardsPanel } from "./rewards-panel";
import { CoinsTable } from "./coins-table";
import { WalletDetails } from "./wallet-details";
import { RewardsBreakdown } from "./rewards-breakdown";
import { DelegationDetails } from "./delegation-details";
import { ActivityTimelineTable } from "./activity-timeline-table";
import { ReportsExport } from "./reports-export";

interface WalletDashboardProps {
  address: string;
}

export default function WalletDashboard({ address }: WalletDashboardProps) {
  return (
    <div className="@container/main flex-1 space-y-6 py-4 px-4 lg:px-6 md:py-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{address}</CardTitle>
            <CardTitle className="text-2xl">$83,456.78</CardTitle>
          </div>
          <CardDescription>13,456 $TAC</CardDescription>
        </CardHeader>
      </Card>

      <WalletSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CoinsTable />
        </div>
        <div>
          <DelegationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RewardsPanel />
        </div>
        <div>
          <WalletDetails />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RewardsBreakdown />
        <DelegationDetails />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityTimelineTable />
        <ReportsExport />
      </div>
    </div>
  );
}
