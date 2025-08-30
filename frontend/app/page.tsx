import { SummaryCards } from "@/components/overview/summary-cards";
import { DelegationVolumeChart } from "@/components/overview/delegation-volume-chart";
import { StakingDistributionChart } from "@/components/overview/staking-distribution-chart";
import { ValidatorInfoTable } from "@/components/overview/validator-info-table";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SummaryCards />

          <div className="px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/4">
                <StakingDistributionChart />
              </div>
              <div className="flex-1">
                <DelegationVolumeChart />
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <ValidatorInfoTable />
          </div>
        </div>
      </div>
    </div>
  );
}
