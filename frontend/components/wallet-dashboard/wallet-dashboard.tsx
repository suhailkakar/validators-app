"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconDownload, IconCalendar } from "@tabler/icons-react";
import { WalletSummaryCards } from "./wallet-summary-cards";
import { DelegationsPanel } from "./delegations-panel";
import { RewardsPanel } from "./rewards-panel";
import { UnbondingsPanel } from "./unbondings-panel";
import { ActivityTimeline } from "./activity-timeline";

interface WalletDashboardProps {
  address: string;
  onAddressChange: (newAddress: string) => void;
}

export function WalletDashboard({
  address,
  onAddressChange,
}: WalletDashboardProps) {
  const [activeTab, setActiveTab] = useState("delegations");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [eventType, setEventType] = useState("all");
  const [newAddress, setNewAddress] = useState("");

  const handleExploreNewAddress = () => {
    if (newAddress.trim()) {
      onAddressChange(newAddress.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExploreNewAddress();
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Address Bar */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={address}
                        readOnly
                        className="font-mono bg-muted"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddressChange("")}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter new wallet address to explore..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="font-mono"
                      />
                    </div>
                    <Button variant="outline" onClick={handleExploreNewAddress}>
                      <IconSearch className="h-4 w-4 mr-2" />
                      Explore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <WalletSummaryCards />

          {/* Main Dashboard Content */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="delegations">Delegations</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="unbondings">Unbondings</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="delegations">
                <DelegationsPanel />
              </TabsContent>

              <TabsContent value="rewards">
                <RewardsPanel />
              </TabsContent>

              <TabsContent value="unbondings">
                <UnbondingsPanel />
              </TabsContent>

              <TabsContent value="timeline">
                <ActivityTimeline />
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconDownload className="h-5 w-5" />
                      Reports & Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Date Range
                        </label>
                        <select
                          value={dateRange}
                          onChange={(e) => setDateRange(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                          <option value="90d">Last 90 days</option>
                          <option value="1y">Last year</option>
                          <option value="all">All time</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Validators
                        </label>
                        <select
                          multiple
                          value={selectedValidators}
                          onChange={(e) =>
                            setSelectedValidators(
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              )
                            )
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="all">All Validators</option>
                          <option value="cosmos1abc">Cosmos Validator</option>
                          <option value="cosmos1def">StakeLab</option>
                          <option value="cosmos1ghi">Validator One</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Event Type
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="all">All Events</option>
                          <option value="stake">Stake</option>
                          <option value="claim">Claim</option>
                          <option value="unbond">Unbond</option>
                          <option value="restake">Restake</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="gap-2">
                        <IconDownload className="h-4 w-4" />
                        Export CSV
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <IconDownload className="h-4 w-4" />
                        Export Excel
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <IconDownload className="h-4 w-4" />
                        Export JSON
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Monthly Auto-Export</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically export your wallet data every month
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <IconCalendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
