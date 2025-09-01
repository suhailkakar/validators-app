"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconClock } from "@tabler/icons-react";

// Demo data for unbondings
const demoUnbondings = [
  {
    id: 1,
    validator: "Cosmos Validator",
    amount: "2,000",
    initiatedOn: "2024-03-10",
    completionDate: "2024-03-17",
    status: "pending",
    daysLeft: 3,
    progress: 70,
  },
  {
    id: 2,
    validator: "StakeLab",
    amount: "1,500",
    initiatedOn: "2024-03-12",
    completionDate: "2024-03-19",
    status: "pending",
    daysLeft: 5,
    progress: 50,
  },
  {
    id: 3,
    validator: "Validator One",
    amount: "1,000",
    initiatedOn: "2024-03-08",
    completionDate: "2024-03-15",
    status: "completed",
    daysLeft: 0,
    progress: 100,
  },
];

export function UnbondingsPanel() {
  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge variant="default" className="bg-green-500">
          ✅ Completed
        </Badge>
      );
    }
    return <Badge variant="secondary">⏳ Pending</Badge>;
  };

  const getProgressColor = (status: string) => {
    if (status === "completed") return "bg-green-500";
    if (status === "pending") return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="h-5 w-5" />
            Unbondings Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Unbonding Delegations</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Validator</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Initiated On</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoUnbondings.map((unbonding) => (
                    <TableRow key={unbonding.id}>
                      <TableCell className="font-medium">
                        {unbonding.validator}
                      </TableCell>
                      <TableCell className="font-mono">
                        {unbonding.amount} TAC
                      </TableCell>
                      <TableCell>{unbonding.initiatedOn}</TableCell>
                      <TableCell>{unbonding.completionDate}</TableCell>
                      <TableCell>{getStatusBadge(unbonding.status)}</TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-2">
                          <Progress
                            value={unbonding.progress}
                            className={getProgressColor(unbonding.status)}
                          />
                          <div className="text-xs text-muted-foreground text-center">
                            {unbonding.status === "completed"
                              ? "Released"
                              : `${unbonding.daysLeft} days left`}
                          </div>
                        </div>
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
