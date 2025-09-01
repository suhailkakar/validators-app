"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCoins } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

export function CoinsTable() {
  return (
    <Card className="min-h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCoins className="h-5 w-5" />
          Coins
        </CardTitle>
        <CardDescription>
          Current wallet balance and token breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" rounded-lg">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b p-1">
                <TableHead className="text-left p-3 font-medium">
                  Coin
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Market Price
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Available
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Total
                </TableHead>
                <TableHead className="text-left p-3 font-medium">
                  Last Transaction
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/30">
                <TableCell className="p-3 font-medium flex items-center gap-2">
                  <Image
                    width={24}
                    height={24}
                    src={
                      "https://pbs.twimg.com/profile_images/1932937462612901889/gbUt2ndV_400x400.jpg"
                    }
                    alt="TAC"
                    className="h-6 w-6 rounded-full"
                  />
                  TAC
                </TableCell>
                <TableCell className="p-3 ">$6.21</TableCell>
                <TableCell className="p-3 ">13,456.78 TAC</TableCell>
                <TableCell className="p-3 ">15,000.00 TAC</TableCell>
                <TableCell className="p-3">2024-03-20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
