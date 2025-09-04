// import { SummaryCards } from "@/components/overview/summary-cards";
// import { DelegationVolumeChart } from "@/components/overview/delegation-volume-chart";
// import { StakingDistributionChart } from "@/components/overview/staking-distribution-chart";
// import { ValidatorInfoTable } from "@/components/overview/validator-info-table";
// import { TacPriceChart } from "@/components/overview/tac-price-chart";
// import { OnchainMetrics } from "@/components/overview/onchain-metrics";
// import ContentLayout from "@/components/layout/content-layout";

// export default function Page() {
//   return (
//     <ContentLayout>
//       <SummaryCards />
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2">
//           <TacPriceChart />
//         </div>
//         <div>
//           <OnchainMetrics />
//         </div>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//         <div>
//           <StakingDistributionChart />
//         </div>
//         <div className="lg:col-span-3">
//           <DelegationVolumeChart />
//         </div>
//       </div>
//       <ValidatorInfoTable />
//     </ContentLayout>
//   );
// }

import { ChartAreaInteractive } from "@/components/restricted-validators/chart-area-interactive";
import { DataTable } from "@/components/restricted-validators/data-table";
import { SectionCards } from "@/components/restricted-validators/section-cards";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable />
        </div>
      </div>
    </div>
  );
}
