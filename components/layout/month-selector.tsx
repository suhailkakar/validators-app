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
  selectedPeriod?: string;
  onPeriodChange: (period: string) => void;
}

// Hardcode current month as September for default selection
const DEFAULT_CURRENT_MONTH = "2025-09";

export function MonthSelector({
  selectedPeriod,
  onPeriodChange,
}: MonthSelectorProps) {
  // Generate previous month + current month + next 3 months (5 total)
  const generateMonthOptions = () => {
    const months = [];
    // Hardcode "now" as September 2025 for this selector
    const now = new Date(2025, 8, 1); // JS months are 0-based, so 8 = September

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
        isCurrent: periodId === DEFAULT_CURRENT_MONTH,
        isFuture: i > 0,
      });
    }

    return months; // Already in chronological order (old → current → new)
  };

  // Hardcode current month as September 2025
  const getCurrentMonth = () => DEFAULT_CURRENT_MONTH;

  const getDisplayName = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const monthOptions = generateMonthOptions();

  // If no selectedPeriod, default to September 2025
  const effectiveSelectedPeriod = selectedPeriod || DEFAULT_CURRENT_MONTH;

  React.useEffect(() => {
    // If no selectedPeriod, notify parent to set default to September
    if (!selectedPeriod) {
      onPeriodChange(DEFAULT_CURRENT_MONTH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-auto">
          <Calendar className="h-4 w-4 mr-2" />
          {getDisplayName(effectiveSelectedPeriod)}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {monthOptions.map((month) => (
          <DropdownMenuItem
            key={month.id}
            onClick={() => onPeriodChange(month.id)}
            className={`${
              month.id === effectiveSelectedPeriod ? "bg-accent" : ""
            } ${month.isFuture ? "opacity-60" : ""}`}
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
