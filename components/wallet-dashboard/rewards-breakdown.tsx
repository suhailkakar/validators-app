"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconDownload } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RewardsBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDownload className="h-5 w-5" />
          Rewards Breakdown
        </CardTitle>
        <CardDescription>
          Rewards breakdown by validator over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" rounded-lg">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b p-1">
                <TableHead className="text-left p-3 font-medium">
                  Validator
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Lifetime
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Claimed
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Unclaimed
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">Cosmos Validator</TableCell>
                <TableCell className="p-3 font-mono">5,200 TAC</TableCell>
                <TableCell className="p-3 font-mono text-green-600">
                  4,750 TAC
                </TableCell>
                <TableCell className="p-3 font-mono text-orange-600">
                  450 TAC
                </TableCell>
              </TableRow>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">StakeLab</TableCell>
                <TableCell className="p-3 font-mono">4,100 TAC</TableCell>
                <TableCell className="p-3 font-mono text-green-600">
                  3,740 TAC
                </TableCell>
                <TableCell className="p-3 font-mono text-orange-600">
                  360 TAC
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/30">
                <TableCell className="p-3">Validator One</TableCell>
                <TableCell className="p-3 font-mono">3,800 TAC</TableCell>
                <TableCell className="p-3 font-mono text-green-600">
                  3,560 TAC
                </TableCell>
                <TableCell className="p-3 font-mono text-orange-600">
                  240 TAC
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
