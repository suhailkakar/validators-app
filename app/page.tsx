import { SummaryCards } from "@/components/overview/summary-cards";
import { DelegationVolumeChart } from "@/components/overview/delegation-volume-chart";
import { StakingDistributionChart } from "@/components/overview/staking-distribution-chart";
import { ValidatorInfoTable } from "@/components/overview/validator-info-table";
import { TacPriceChart } from "@/components/overview/tac-price-chart";
import { OnchainMetrics } from "@/components/overview/onchain-metrics";
import ContentLayout from "@/components/layout/content-layout";

export default function Page() {
  return (
    <ContentLayout>
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TacPriceChart />
        </div>
        <div>
          <OnchainMetrics />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <StakingDistributionChart />
        </div>
        <div className="lg:col-span-3">
          <DelegationVolumeChart />
        </div>
      </div>
      <ValidatorInfoTable />
    </ContentLayout>
  );
}
