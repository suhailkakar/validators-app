"use client";

import { ValidatorsTable } from "@/components/validators/validators-table";
import { ValidatorsSummaryCards } from "@/components/validators/validators-summary-cards";
import ContentLayout from "@/components/layout/content-layout";

export default function Validators() {
  return (
    <ContentLayout>
      {/* Summary Cards */}
      <ValidatorsSummaryCards />

      <ValidatorsTable />
    </ContentLayout>
  );
}
