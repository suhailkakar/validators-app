"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconDownload, IconCalendar, IconSearch } from "@tabler/icons-react";
import { WalletSummaryCards } from "./wallet-summary-cards";
import { DelegationsPanel } from "./delegations-panel";
import { RewardsPanel } from "./rewards-panel";
import { UnbondingsPanel } from "./unbondings-panel";
import { ActivityTimeline } from "./activity-timeline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WalletDashboardProps {
  address: string;
  onAddressChange: (newAddress: string) => void;
}

export default function WalletDashboard({
  address,
  onAddressChange,
}: WalletDashboardProps) {
  const handleExploreNewAddress = () => {
    // This function will be implemented later to allow users to explore new addresses
    console.log("Explore new address clicked");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Address Bar */}
          <div className="px-4 lg:px-6">
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle>Wallet Address</CardTitle>
                <CardDescription>
                  Current wallet address being explored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 -mt-3">
                  <div className="flex-1">
                    <Input
                      value={address}
                      readOnly
                      className="font-mono bg-white"
                      placeholder="Wallet address"
                    />
                  </div>
                  <Button onClick={handleExploreNewAddress} variant="outline">
                    <IconSearch className="h-4 w-4 mr-2" />
                    Explore Another Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <WalletSummaryCards />

          {/* Charts Section */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Rewards Line Chart - 4/5 width */}
              <div className="flex-1">
                <RewardsPanel />
              </div>
              {/* Delegation Pie Chart - 1/5 width */}
              <div className="w-full lg:w-1/5">
                <DelegationsPanel />
              </div>
            </div>
          </div>

          {/* First Row of Tables - Side by Side */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Rewards Breakdown Table */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconDownload className="h-5 w-5" />
                      Rewards Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Rewards by Validator
                      </h3>
                      <div className="border rounded-lg">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 font-medium">
                                Validator
                              </th>
                              <th className="text-left p-3 font-medium">
                                Lifetime
                              </th>
                              <th className="text-left p-3 font-medium">
                                Claimed
                              </th>
                              <th className="text-left p-3 font-medium">
                                Unclaimed
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-3">Cosmos Validator</td>
                              <td className="p-3 font-mono">5,200 TAC</td>
                              <td className="p-3 font-mono text-green-600">
                                4,750 TAC
                              </td>
                              <td className="p-3 font-mono text-orange-600">
                                450 TAC
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-3">StakeLab</td>
                              <td className="p-3 font-mono">4,100 TAC</td>
                              <td className="p-3 font-mono text-green-600">
                                3,740 TAC
                              </td>
                              <td className="p-3 font-mono text-orange-600">
                                360 TAC
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3">Validator One</td>
                              <td className="p-3 font-mono">3,800 TAC</td>
                              <td className="p-3 font-mono text-green-600">
                                3,560 TAC
                              </td>
                              <td className="p-3 font-mono text-orange-600">
                                240 TAC
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delegation Details Table */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconDownload className="h-5 w-5" />
                      Delegation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Stake Distribution
                      </h3>
                      <div className="border rounded-lg">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 font-medium">
                                Validator
                              </th>
                              <th className="text-left p-3 font-medium">
                                Amount
                              </th>
                              <th className="text-left p-3 font-medium">
                                First Date
                              </th>
                              <th className="text-left p-3 font-medium">
                                Commission
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-3">Cosmos Validator</td>
                              <td className="p-3 font-mono">15,000 TAC</td>
                              <td className="p-3">2024-01-15</td>
                              <td className="p-3">10.0%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-3">StakeLab</td>
                              <td className="p-3 font-mono">12,000 TAC</td>
                              <td className="p-3">2024-01-20</td>
                              <td className="p-3">8.5%</td>
                            </tr>
                            <tr>
                              <td className="p-3">Validator One</td>
                              <td className="p-3 font-mono">8,000 TAC</td>
                              <td className="p-3">2024-02-01</td>
                              <td className="p-3">12.0%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Second Row of Tables - Side by Side */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Timeline Table */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCalendar className="h-5 w-5" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Recent Activities
                      </h3>
                      <div className="border rounded-lg">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 font-medium">
                                Action
                              </th>
                              <th className="text-left p-3 font-medium">
                                Details
                              </th>
                              <th className="text-left p-3 font-medium">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-3">Staked</td>
                              <td className="p-3">10,000 TAC → Validator X</td>
                              <td className="p-3">2024-03-20</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-3">Claimed</td>
                              <td className="p-3">200 TAC rewards</td>
                              <td className="p-3">2024-03-18</td>
                            </tr>
                            <tr>
                              <td className="p-3">Unbonded</td>
                              <td className="p-3">
                                1,000 TAC (release 12 Sep)
                              </td>
                              <td className="p-3">2024-03-15</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Table */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconDownload className="h-5 w-5" />
                      Reports & Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Export Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Monthly Auto-Export</h4>
                            <p className="text-sm text-muted-foreground">
                              Automatically export wallet data
                            </p>
                          </div>
                          <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
                            Schedule
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-2 text-sm border rounded hover:bg-muted">
                            Export CSV
                          </button>
                          <button className="px-3 py-2 text-sm border rounded hover:bg-muted">
                            Export Excel
                          </button>
                          <button className="px-3 py-2 text-sm border rounded hover:bg-muted">
                            Export JSON
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
