"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { MonthSelector } from "@/components/layout/month-selector";
import { RefreshButton } from "@/components/layout/refresh-button";
import { ExportButton } from "@/components/layout/export-button";
import { usePeriod } from "@/contexts/period-context";

export function SiteHeader() {
  const { selectedPeriod, setPeriod, refreshData } = usePeriod();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b pb-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">TAC Validator Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <MonthSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setPeriod}
          />
          <RefreshButton onRefreshComplete={refreshData} />
          <ExportButton selectedPeriod={selectedPeriod} />
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4"
          />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
