"use client";

import * as React from "react";
import { Calendar, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonthSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function MonthSelector({
  selectedPeriod,
  onPeriodChange,
}: MonthSelectorProps) {
  // Generate previous month + current month + next 3 months (5 total)
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();

    // Start from 1 month ago to 3 months in the future
    for (let i = -1; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const periodId = `${year}-${month.toString().padStart(2, "0")}`;
      const displayName = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      months.push({
        id: periodId,
        display: displayName,
        isCurrent: periodId === getCurrentMonth(),
        isFuture: i > 0,
      });
    }

    return months; // Already in chronological order (old → current → new)
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  };

  const getDisplayName = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const monthOptions = generateMonthOptions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-auto">
          <Calendar className="h-4 w-4 mr-2" />
          {getDisplayName(selectedPeriod)}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {monthOptions.map((month) => (
          <DropdownMenuItem
            key={month.id}
            onClick={() => onPeriodChange(month.id)}
            className={`${month.id === selectedPeriod ? "bg-accent" : ""} ${
              month.isFuture ? "opacity-60" : ""
            }`}
            disabled={month.isFuture}
          >
            <div className="flex items-center justify-between w-full">
              <span>{month.display}</span>
              {month.isCurrent && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                  Current
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
