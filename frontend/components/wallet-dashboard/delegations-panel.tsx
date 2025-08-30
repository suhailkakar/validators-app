"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { IconExternalLink } from "@tabler/icons-react";

// Demo data for delegations
const demoDelegations = [
  {
    id: 1,
    validator: "Cosmos Validator",
    moniker: "cosmos1abc...xyz",
    amountStaked: "15,000",
    firstDelegation: "2024-01-15",
    latestUpdate: "2024-03-10",
    currentRewards: "450",
    commission: "10.0",
    website: "https://cosmosvalidator.com",
    stakePercentage: 33.3,
    color: "#8884d8",
  },
  {
    id: 2,
    validator: "StakeLab",
    moniker: "cosmos1def...uvw",
    amountStaked: "12,000",
    firstDelegation: "2024-01-20",
    latestUpdate: "2024-03-08",
    currentRewards: "360",
    commission: "8.5",
    website: "https://stakelab.io",
    stakePercentage: 26.7,
    color: "#82ca9d",
  },
  {
    id: 3,
    validator: "Validator One",
    moniker: "cosmos1ghi...rst",
    amountStaked: "8,000",
    firstDelegation: "2024-02-01",
    latestUpdate: "2024-03-05",
    currentRewards: "240",
    commission: "12.0",
    website: "https://validatorone.com",
    stakePercentage: 17.8,
    color: "#ffc658",
  },
  {
    id: 4,
    validator: "Stake Master",
    moniker: "cosmos1nop...qrs",
    amountStaked: "6,000",
    firstDelegation: "2024-02-10",
    latestUpdate: "2024-03-01",
    currentRewards: "180",
    commission: "11.2",
    website: "https://stakemaster.com",
    stakePercentage: 13.3,
    color: "#ff7300",
  },
  {
    id: 5,
    validator: "Chain Validator",
    moniker: "cosmos1tuv...wxy",
    amountStaked: "4,000",
    firstDelegation: "2024-02-15",
    latestUpdate: "2024-02-28",
    currentRewards: "120",
    commission: "8.9",
    website: "https://chainvalidator.com",
    stakePercentage: 8.9,
    color: "#8dd1e1",
  },
];

const chartData = demoDelegations.map((d) => ({
  name: d.validator,
  value: d.stakePercentage,
  color: d.color,
}));

export function DelegationsPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconExternalLink className="h-5 w-5" />
            Delegations Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Delegations Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delegation Details</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Validator</TableHead>
                    <TableHead>Amount Staked</TableHead>
                    <TableHead>First Delegation</TableHead>
                    <TableHead>Latest Update</TableHead>
                    <TableHead>Current Rewards</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoDelegations.map((delegation) => (
                    <TableRow key={delegation.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {delegation.validator}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {delegation.moniker}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {delegation.amountStaked} TAC
                      </TableCell>
                      <TableCell>{delegation.firstDelegation}</TableCell>
                      <TableCell>{delegation.latestUpdate}</TableCell>
                      <TableCell className="font-mono">
                        {delegation.currentRewards} TAC
                      </TableCell>
                      <TableCell>{delegation.commission}%</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={delegation.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
