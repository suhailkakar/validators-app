"use client";

import { ValidatorsTable } from "@/components/validators/validators-table";
import { ValidatorsSummaryCards } from "@/components/validators/validators-summary-cards";

export default function Validators() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4">
          {/* Summary Cards */}
          <ValidatorsSummaryCards />

          {/* Validators Table */}
          <ValidatorsTable />
        </div>
      </div>
    </div>
  );
}
