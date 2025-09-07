"use client";

import { useEffect, useState } from "react";
import { IconFiretruck as IconFire, IconUsers } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTacAmount } from "@/lib/utils";
import { usePeriod } from "@/contexts/period-context";

interface ValidatorData {
  totalRewardsToRestricted: string;
  burnObligation: string;
  percentStaked: number;
}

export function SectionCards() {
  const [data, setData] = useState<ValidatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedPeriod, refreshKey } = usePeriod();

  useEffect(() => {
    async function fetchValidatorData() {
      try {
        setLoading(true);
        const { cosmosClient } = await import("@/lib/cosmosClient");
        const result = await cosmosClient.getValidators();

        // Calculate total rewards to restricted validators
        let totalClaimed = BigInt(0);
        let totalUnclaimed = BigInt(0);
        let totalStaked = BigInt(0);

        result.validators.forEach((validator: any) => {
          totalClaimed += BigInt(validator.claimedRewards || "0");
          totalUnclaimed += BigInt(validator.unclaimedRewards || "0");
          totalStaked += BigInt(validator.totalAmountDelegated || "0");
        });

        const totalRewards = totalClaimed + totalUnclaimed;

        // Calculate burn obligation: 88.888889% of total rewards
        const burnObligation =
          (totalRewards * BigInt(888889)) / BigInt(1000000);

        // Get total network-wide staked amount
        const totalBondedStr = await cosmosClient.getTotalBondedTokens();
        const totalBonded = BigInt(totalBondedStr);

        // Calculate percentage: restricted validators staked / total network staked
        const percentStaked =
          totalBonded > 0
            ? Number((totalStaked * BigInt(10000)) / totalBonded) / 100
            : 0;

        console.log(`🔍 Staking calculation debug:`);
        console.log(
          `Total staked to restricted validators: ${totalStaked.toString()} TAC`
        );
        console.log(`Total network-wide staked: ${totalBonded.toString()} TAC`);
        console.log(`Percentage: ${percentStaked.toFixed(4)}%`);

        setData({
          totalRewardsToRestricted: totalRewards.toString(),
          burnObligation: burnObligation.toString(),
          percentStaked: percentStaked,
        });

        setError(null);
      } catch (err) {
        console.error("Failed to fetch validator data:", err);
        setError("Failed to load validator data");
      } finally {
        setLoading(false);
      }
    }

    fetchValidatorData();
  }, [selectedPeriod, refreshKey]);

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const TAC_LABEL = () => {
    return (
      <Badge variant="default" className="text-sm rounded-lg">
        $TAC
      </Badge>
    );
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]: lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rewards Minted</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            N/A
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Network-wide inflation since genesis{" "}
          </div>
          <div className="text-muted-foreground">
            Logic to be implemented later
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            Total Rewards to Restricted Validators
          </CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {data
              ? formatTacAmount(parseFloat(data.totalRewardsToRestricted))
              : "0"}{" "}
            <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Claimed + unclaimed rewards{" "}
          </div>
          <div className="text-muted-foreground">Since network launch</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Accumulated Rewards Burnt</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {formatTacAmount(0)}
            <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total rewards burnt since network launch{" "}
          </div>
          <div className="text-muted-foreground">
            Currently 0 (no burns executed)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>80% of Total Staking Rewards</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {data ? formatTacAmount(parseFloat(data.burnObligation)) : "0"}{" "}
            <TAC_LABEL />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Burn obligation
          </div>
          <div className="text-muted-foreground">Since network launch</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>% Staked to Restricted Validators</CardDescription>
          <CardTitle className="text-2xl font-semibold  flex items-center gap-2">
            {data ? `${data.percentStaked.toFixed(2)}%` : "0%"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Of total network-wide staked TAC
          </div>
          <div className="text-muted-foreground">
            Bonded stake held by restricted set
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
