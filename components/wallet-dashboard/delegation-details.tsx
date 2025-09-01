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

export function DelegationDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDownload className="h-5 w-5" />
          Delegation Details
        </CardTitle>
        <CardDescription>
          Delegation details by validator (Demo Data)
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
                  Amount
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  First Date
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Commission
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">Cosmos Validator</TableCell>
                <TableCell className="p-3 font-mono">15,000 TAC</TableCell>
                <TableCell className="p-3">2024-01-15</TableCell>
                <TableCell className="p-3">10.0%</TableCell>
              </TableRow>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">StakeLab</TableCell>
                <TableCell className="p-3 font-mono">12,000 TAC</TableCell>
                <TableCell className="p-3">2024-01-20</TableCell>
                <TableCell className="p-3">8.5%</TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/30">
                <TableCell className="p-3">Validator One</TableCell>
                <TableCell className="p-3 font-mono">8,000 TAC</TableCell>
                <TableCell className="p-3">2024-02-01</TableCell>
                <TableCell className="p-3">12.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
