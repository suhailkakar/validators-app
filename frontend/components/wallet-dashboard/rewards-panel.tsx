"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IconGift, IconTrendingUp } from "@tabler/icons-react";

// Demo data for rewards over time
const rewardsData = [
  { date: "2024-01-01", rewards: 0 },
  { date: "2024-01-15", rewards: 150 },
  { date: "2024-02-01", rewards: 320 },
  { date: "2024-02-15", rewards: 480 },
  { date: "2024-03-01", rewards: 650 },
  { date: "2024-03-15", rewards: 820 },
  { date: "2024-03-20", rewards: 1210 },
];

// Demo data for rewards table
const rewardsTableData = [
  {
    id: 1,
    validator: "Cosmos Validator",
    lifetimeRewards: "5,200",
    claimed: "4,750",
    unclaimed: "450",
    lastClaimed: "2024-03-15 14:30:00",
  },
  {
    id: 2,
    validator: "StakeLab",
    lifetimeRewards: "4,100",
    claimed: "3,740",
    unclaimed: "360",
    lastClaimed: "2024-03-10 09:15:00",
  },
  {
    id: 3,
    validator: "Validator One",
    lifetimeRewards: "3,800",
    claimed: "3,560",
    unclaimed: "240",
    lastClaimed: "2024-03-08 16:45:00",
  },
  {
    id: 4,
    validator: "Stake Master",
    lifetimeRewards: "3,200",
    claimed: "3,020",
    unclaimed: "180",
    lastClaimed: "2024-03-05 11:20:00",
  },
  {
    id: 5,
    validator: "Chain Validator",
    lifetimeRewards: "2,620",
    claimed: "2,500",
    unclaimed: "120",
    lastClaimed: "2024-03-01 13:10:00",
  },
];

export function RewardsPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconGift className="h-5 w-5" />
            Rewards Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Line Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Rewards Accrued Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rewardsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [`${value} TAC`, "Rewards"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rewards"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rewards Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rewards Breakdown</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Validator</TableHead>
                    <TableHead>Lifetime Rewards</TableHead>
                    <TableHead>Claimed</TableHead>
                    <TableHead>Unclaimed</TableHead>
                    <TableHead>Last Claimed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardsTableData.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">
                        {reward.validator}
                      </TableCell>
                      <TableCell className="font-mono">
                        {reward.lifetimeRewards} TAC
                      </TableCell>
                      <TableCell className="font-mono text-green-600">
                        {reward.claimed} TAC
                      </TableCell>
                      <TableCell className="font-mono text-orange-600">
                        {reward.unclaimed} TAC
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reward.lastClaimed}
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
