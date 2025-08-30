/**
 * Validator Service for TAC Restricted Validator Burn Calculator
 * Specialized functions to fetch and process validator information for burn calculations
 */

import {
  CosmosClient,
  type ValidatorInfo,
  type RewardAmount,
} from "./cosmosClient";
import { config } from "./config";
import {
  calculateBurnAmount,
  addUtacAmounts,
  isValidUtacAmount,
  formatTacAmount,
  cleanDecimalString,
} from "./tokenConverter";

export interface ValidatorDetails {
  address: string;
  moniker: string;
  status: string;
  tokens: string;
  commissionRate: number;
  commissionRateStr: string;
  isActive: boolean;
  isJailed: boolean;

  // Raw amounts in utac
  outstandingRewardsUtac: string;
  unclaimedCommissionUtac: string;
  claimedCommissionUtac: string;
  totalCommissionUtac: string;

  // Burn calculation
  burnAmount: string;
  validatorKeeps: string;

  // Human-readable amounts
  outstandingRewardsTac: string;
  unclaimedCommissionTac: string;
  claimedCommissionTac: string;
  totalCommissionTac: string;
  burnAmountTac: string;
  validatorKeepsTac: string;

  // Validation
  commissionIssues: any[];
  hasRewards: boolean;
  hasCommission: boolean;

  // Metadata
  fetchedAt: string;
}

export class ValidatorService {
  private cosmosClient: CosmosClient;
  private restrictedValidators: string[];
  private expectedCommissionRate: number;
  private burnRate: number;

  constructor() {
    this.cosmosClient = new CosmosClient();
    this.restrictedValidators = config.restrictedValidators;
    this.expectedCommissionRate = config.business.validatorCommissionRate; // 0.9 (90%)
    this.burnRate = config.business.burnRate; // 0.8 (80%)
  }

  /**
   * Fetch staking pool totals
   */
  async getStakingPool() {
    return this.cosmosClient.getStakingPool();
  }

  /**
   * Get detailed information for a single restricted validator
   */
  async getValidatorDetails(
    validatorAddress: string
  ): Promise<ValidatorDetails> {
    const [validator, outstandingRewards, commission] = await Promise.all([
      this.cosmosClient.getValidator(validatorAddress),
      this.cosmosClient.getValidatorOutstandingRewards(validatorAddress),
      this.cosmosClient.getValidatorCommission(validatorAddress),
    ]);

    // Get claimed commission since genesis from transaction history
    const claimedCommission =
      await this.cosmosClient.getValidatorCommissionWithdrawals(
        validatorAddress
      );

    // Process and validate the data
    return this.processValidatorData(
      validatorAddress,
      validator,
      outstandingRewards,
      commission,
      claimedCommission
    );
  }

  /**
   * Get detailed information for all restricted validators
   */
  async getAllRestrictedValidatorsDetails() {
    const batchResult = await this.cosmosClient.batchGetValidators(
      this.restrictedValidators
    );

    const processedValidators: ValidatorDetails[] = [];
    const errors: any[] = [];

    // Process successful fetches
    for (const validatorData of batchResult.successful) {
      try {
        const details = await this.processValidatorData(
          validatorData.address,
          validatorData.validator,
          validatorData.outstandingRewards,
          validatorData.commission
        );
        processedValidators.push(details);
      } catch (error) {
        errors.push({
          validator: validatorData.address,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Add failed fetches to errors
    errors.push(...batchResult.failed);

    return {
      validators: processedValidators,
      errors,
      summary: this.generateSummary(processedValidators),
    };
  }

  /**
   * Process raw validator data into structured format for burn calculations
   * Includes both unclaimed and claimed commission for complete coverage
   */
  processValidatorData(
    address: string,
    validator: ValidatorInfo,
    outstandingRewards: RewardAmount[],
    commission: RewardAmount[],
    claimedCommission: string = "0"
  ): ValidatorDetails {
    // Extract basic validator info
    const moniker = validator.description?.moniker || "Unknown";
    const status = validator.status || "UNKNOWN";
    const commissionRateStr =
      validator.commission?.commission_rates?.rate || "0";
    const commissionRate = parseFloat(commissionRateStr);

    // Process outstanding rewards
    const tacRewards = outstandingRewards.find(
      (r) => r.denom === config.chain.tokenDenom
    );
    const outstandingRewardsUtac = cleanDecimalString(
      tacRewards?.amount || "0"
    );

    // Process commission (unclaimed)
    const tacCommission = commission.find(
      (c) => c.denom === config.chain.tokenDenom
    );
    const unclaimedCommissionUtac = cleanDecimalString(
      tacCommission?.amount || "0"
    );

    // Calculate total commission (claimed + unclaimed) for reporting
    // Note: We exclude delegator rewards (outstandingRewards) as they belong to delegators, not validators
    const totalCommissionUtac = addUtacAmounts(
      unclaimedCommissionUtac,
      cleanDecimalString(claimedCommission)
    );

    // Debug: per-validator lifetime total commission (raw utac)
    console.debug(
      "validatorService.totalCommissionUtac",
      JSON.stringify({
        address,
        moniker,
        totalCommissionUtac,
        unclaimedCommissionUtac,
        claimedCommissionUtac: claimedCommission,
      })
    );

    // Validate commission rate for restricted validators (strict enforcement)
    const commissionIssues = this.validateCommissionRate(
      address,
      commissionRate
    );

    // Calculate burn amounts based on TOTAL COMMISSION (claimed + unclaimed)
    // Burn 80% of total commission, validator keeps 20% of total commission
    const burnCalculation = calculateBurnAmount(
      totalCommissionUtac,
      this.burnRate
    );

    const details: ValidatorDetails = {
      address,
      moniker,
      status,
      tokens: validator.tokens || "0",
      commissionRate,
      commissionRateStr,
      isActive: status === "BOND_STATUS_BONDED",
      isJailed: validator.jailed || false,

      // Raw amounts in utac
      outstandingRewardsUtac,
      unclaimedCommissionUtac,
      claimedCommissionUtac: claimedCommission,
      totalCommissionUtac,

      // Burn calculation
      burnAmount: burnCalculation.burnAmount,
      validatorKeeps: burnCalculation.validatorKeeps,

      // Human-readable amounts
      outstandingRewardsTac: formatTacAmount(outstandingRewardsUtac),
      unclaimedCommissionTac: formatTacAmount(unclaimedCommissionUtac),
      claimedCommissionTac: formatTacAmount(claimedCommission),
      totalCommissionTac: formatTacAmount(totalCommissionUtac),

      burnAmountTac: burnCalculation.burnAmountTac,
      validatorKeepsTac: burnCalculation.validatorKeepsTac,

      // Validation
      commissionIssues,
      hasRewards:
        isValidUtacAmount(totalCommissionUtac) && totalCommissionUtac !== "0",
      hasCommission:
        isValidUtacAmount(totalCommissionUtac) && totalCommissionUtac !== "0",

      // Metadata
      fetchedAt: new Date().toISOString(),
    };

    return details;
  }

  /**
   * Validate commission rate for restricted validators
   */
  validateCommissionRate(validatorAddress: string, actualRate: number) {
    const issues = [];
    const tolerance = 0.001; // Allow small floating point differences

    if (Math.abs(actualRate - this.expectedCommissionRate) > tolerance) {
      issues.push({
        type: "commission_rate_mismatch",
        expected: this.expectedCommissionRate,
        actual: actualRate,
        message: `Expected ${
          this.expectedCommissionRate * 100
        }% commission, found ${actualRate * 100}%`,
      });
    }

    if (actualRate < 0 || actualRate > 1) {
      issues.push({
        type: "invalid_commission_rate",
        actual: actualRate,
        message: "Commission rate must be between 0% and 100%",
      });
    }

    return issues;
  }

  /**
   * Generate summary statistics for all validators
   */
  generateSummary(validators: ValidatorDetails[]) {
    const totalValidators = validators.length;
    const activeValidators = validators.filter((v) => v.isActive).length;
    const jailedValidators = validators.filter((v) => v.isJailed).length;
    const validatorsWithRewards = validators.filter((v) => v.hasRewards).length;
    const validatorsWithCommissionIssues = validators.filter(
      (v) => v.commissionIssues.length > 0
    ).length;

    // Calculate total burn amounts
    let totalBurnAmountUtac = "0";
    let totalValidatorKeepsUtac = "0";
    let totalRewardsUtac = "0";

    for (const validator of validators) {
      totalBurnAmountUtac = addUtacAmounts(
        totalBurnAmountUtac,
        validator.burnAmount
      );
      totalValidatorKeepsUtac = addUtacAmounts(
        totalValidatorKeepsUtac,
        validator.validatorKeeps
      );
      totalRewardsUtac = addUtacAmounts(
        totalRewardsUtac,
        validator.totalCommissionUtac
      );
    }

    return {
      totalValidators,
      activeValidators,
      jailedValidators,
      validatorsWithRewards,
      validatorsWithCommissionIssues,

      // Totals in utac
      totalBurnAmountUtac,
      totalValidatorKeepsUtac,
      totalRewardsUtac,

      // Totals in human-readable format
      totalBurnAmountTac: formatTacAmount(totalBurnAmountUtac),
      totalValidatorKeepsTac: formatTacAmount(totalValidatorKeepsUtac),
      totalRewardsTac: formatTacAmount(totalRewardsUtac),

      // Percentages
      activePercentage:
        totalValidators > 0
          ? ((activeValidators / totalValidators) * 100).toFixed(1)
          : "0",
      rewardsPercentage:
        totalValidators > 0
          ? ((validatorsWithRewards / totalValidators) * 100).toFixed(1)
          : "0",
      commissionIssuesPercentage:
        totalValidators > 0
          ? ((validatorsWithCommissionIssues / totalValidators) * 100).toFixed(
              1
            )
          : "0",
    };
  }

  /**
   * Health check for validator service
   */
  async healthCheck() {
    try {
      // Test cosmos client health
      const cosmosHealth = await this.cosmosClient.healthCheck();

      if (!cosmosHealth.healthy) {
        return {
          healthy: false,
          error: "Cosmos client unhealthy",
          details: cosmosHealth,
        };
      }

      // Test fetching one restricted validator
      if (this.restrictedValidators.length > 0) {
        const testValidator = this.restrictedValidators[0];
        await this.getValidatorDetails(testValidator);
      }

      return {
        healthy: true,
        cosmosClient: cosmosHealth,
        restrictedValidatorCount: this.restrictedValidators.length,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
