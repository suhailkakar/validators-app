"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCalendar } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ActivityTimelineTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>Chronological activity feed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" rounded-lg">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b ">
                <TableHead className="text-left p-3 font-medium">
                  Action
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Details
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">Staked</TableCell>
                <TableCell className="p-3">10,000 TAC → Validator X</TableCell>
                <TableCell className="p-3">2024-03-20</TableCell>
              </TableRow>
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell className="p-3">Claimed</TableCell>
                <TableCell className="p-3">200 TAC rewards</TableCell>
                <TableCell className="p-3">2024-03-18</TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/30">
                <TableCell className="p-3">Unbonded</TableCell>
                <TableCell className="p-3">
                  1,000 TAC (release 12 Sep)
                </TableCell>
                <TableCell className="p-3">2024-03-15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
