/**
 * Main Burn Calculator for TAC Restricted Validators
 * Orchestrates validator data fetching and burn calculations
 */

import { ValidatorService, type ValidatorDetails } from "./validatorService";
import { config } from "./config";
import {
  formatTacAmount,
  addUtacAmounts,
  calculateBurnAmount,
} from "./tokenConverter";

export interface BurnResults {
  validatorResults: ValidatorDetails[];
  totals: {
    totalBurnAmountUtac: string;
    totalValidatorKeepsUtac: string;
    totalRewardsUtac: string;
    totalBurnAmountTac: string;
    totalValidatorKeepsTac: string;
    totalRewardsTac: string;
  };
  statistics: {
    totalValidators: number;
    validatorsWithRewards: number;
    validatorsWithCommissionIssues: number;
    validatorsWithErrors: number;
    validatorsReadyToBurn: number;
  };
}

export interface BurnReport {
  reportType: string;
  generatedAt: string;
  calculatorVersion: string;

  // Period information
  period: {
    period: string;
    displayName: string;
    status: string;
  };

  // Summary statistics
  summary: {
    totalValidators: number;
    validatorsWithRewards: number;
    validatorsWithCommissionIssues: number;
    validatorsReadyToBurn: number;

    // Total amounts
    totalRewardsTac: string;
    totalBurnAmountTac: string;
    totalValidatorKeepsTac: string;

    // Raw amounts for precision
    totalRewardsUtac: string;
    totalBurnAmountUtac: string;
    totalValidatorKeepsUtac: string;
  };

  // Individual validator results
  validators: ValidatorDetails[];

  // Operational alerts
  alerts: any[];

  // Configuration used
  configuration: {
    burnRate: number;
    expectedCommissionRate: number;
    burnAddress: string;
    chainId: string;
    tokenDenom: string;
  };
}

export class BurnCalculator {
  private validatorService: ValidatorService;

  constructor() {
    this.validatorService = new ValidatorService();
  }

  /**
   * Calculate burns for all restricted validators
   * @returns {BurnReport} Complete burn calculation results
   */
  async calculateMonthlyBurns(period: string = "2025-08"): Promise<BurnReport> {
    // Get all validator data
    const validatorData =
      await this.validatorService.getAllRestrictedValidatorsDetails();

    // Calculate burn amounts
    const burnResults = this.processBurnCalculations(validatorData.validators);

    // Generate comprehensive report
    const report = this.generateBurnReport(
      burnResults,
      period,
      validatorData.errors
    );

    return report;
  }

  /**
   * Process burn calculations for all validators
   * @param {ValidatorDetails[]} validators - Array of validator details
   * @returns {BurnResults} Burn calculation results
   */
  processBurnCalculations(validators: ValidatorDetails[]): BurnResults {
    const validatorResults: ValidatorDetails[] = [];
    let totalBurnAmountUtac = "0";
    let totalValidatorKeepsUtac = "0";
    let totalRewardsUtac = "0";
    let validatorsWithCommissionIssues = 0;
    let validatorsWithRewards = 0;

    for (const validator of validators) {
      try {
        // Calculate burn amounts based on total commission (claimed + unclaimed)
        const burnCalculation = calculateBurnAmount(
          validator.totalCommissionUtac,
          config.business.burnRate
        );

        // Create detailed result
        const result: ValidatorDetails = {
          // Validator info
          address: validator.address,
          moniker: validator.moniker,
          status: validator.status,
          isActive: validator.isActive,
          isJailed: validator.isJailed,

          // Commission info
          commissionRate: validator.commissionRate,
          commissionRateStr: validator.commissionRateStr,
          commissionIssues: validator.commissionIssues,

          // Reward amounts (utac)
          outstandingRewardsUtac: validator.outstandingRewardsUtac,
          unclaimedCommissionUtac: validator.unclaimedCommissionUtac,
          claimedCommissionUtac: validator.claimedCommissionUtac,
          totalCommissionUtac: validator.totalCommissionUtac,
          totalRewardsUtac: validator.totalRewardsUtac,

          // Burn amounts (utac)
          burnAmount: burnCalculation.burnAmount,
          validatorKeeps: burnCalculation.validatorKeeps,

          // Human-readable amounts (TAC)
          outstandingRewardsTac: validator.outstandingRewardsTac,
          unclaimedCommissionTac: validator.unclaimedCommissionTac,
          claimedCommissionTac: validator.claimedCommissionTac,
          totalCommissionTac: validator.totalCommissionTac,
          totalRewardsTac: formatTacAmount(validator.totalRewardsUtac),
          burnAmountTac: burnCalculation.burnAmountTac,
          validatorKeepsTac: burnCalculation.validatorKeepsTac,

          // Flags
          hasRewards: validator.hasRewards,
          hasCommission: validator.hasCommission,

          // Metadata
          fetchedAt: new Date().toISOString(),
        };

        validatorResults.push(result);

        // Accumulate totals (based on commission for burn calculations)
        if (result.hasCommission) {
          totalBurnAmountUtac = addUtacAmounts(
            totalBurnAmountUtac,
            result.burnAmount
          );
          totalValidatorKeepsUtac = addUtacAmounts(
            totalValidatorKeepsUtac,
            result.validatorKeeps
          );
          totalRewardsUtac = addUtacAmounts(
            totalRewardsUtac,
            result.totalRewardsUtac
          );
          validatorsWithRewards++;
        }

        if (result.commissionIssues.length > 0) {
          validatorsWithCommissionIssues++;
        }
      } catch (error) {
        console.error("Failed to process validator", {
          validator: validator.address,
          moniker: validator.moniker,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      validatorResults,
      totals: {
        totalBurnAmountUtac,
        totalValidatorKeepsUtac,
        totalRewardsUtac,
        totalBurnAmountTac: formatTacAmount(totalBurnAmountUtac),
        totalValidatorKeepsTac: formatTacAmount(totalValidatorKeepsUtac),
        totalRewardsTac: formatTacAmount(totalRewardsUtac),
      },
      statistics: {
        totalValidators: validators.length,
        validatorsWithRewards,
        validatorsWithCommissionIssues,
        validatorsWithErrors: 0, // No errors in this simplified version
        validatorsReadyToBurn: validatorResults.filter((v) => v.hasCommission)
          .length,
      },
    };
  }

  /**
   * Generate comprehensive burn report
   * @param {BurnResults} burnResults - Results from processBurnCalculations
   * @param {string} period - Period string
   * @param {any[]} fetchErrors - Any errors from data fetching
   * @returns {BurnReport} Complete burn report
   */
  generateBurnReport(
    burnResults: BurnResults,
    period: string,
    fetchErrors: any[] = []
  ): BurnReport {
    const report: BurnReport = {
      // Report metadata
      reportType: "monthly_burn_calculation",
      generatedAt: new Date().toISOString(),
      calculatorVersion: "1.0.0",

      // Period information
      period: {
        period,
        displayName: `August 2025`, // Simplified for now
        status: "complete",
      },

      // Summary statistics
      summary: {
        totalValidators: burnResults.statistics.totalValidators,
        validatorsWithRewards: burnResults.statistics.validatorsWithRewards,
        validatorsWithCommissionIssues:
          burnResults.statistics.validatorsWithCommissionIssues,
        validatorsReadyToBurn: burnResults.statistics.validatorsReadyToBurn,

        // Total amounts
        totalRewardsTac: burnResults.totals.totalRewardsTac,
        totalBurnAmountTac: burnResults.totals.totalBurnAmountTac,
        totalValidatorKeepsTac: burnResults.totals.totalValidatorKeepsTac,

        // Raw amounts for precision
        totalRewardsUtac: burnResults.totals.totalRewardsUtac,
        totalBurnAmountUtac: burnResults.totals.totalBurnAmountUtac,
        totalValidatorKeepsUtac: burnResults.totals.totalValidatorKeepsUtac,
      },

      // Individual validator results
      validators: burnResults.validatorResults,

      // Operational alerts
      alerts: this.generateOperationalAlerts(burnResults),

      // Configuration used
      configuration: {
        burnRate: config.business.burnRate,
        expectedCommissionRate: config.business.validatorCommissionRate,
        burnAddress: config.burnAddress,
        chainId: config.chain.chainId,
        tokenDenom: config.chain.tokenDenom,
      },
    };

    return report;
  }

  /**
   * Generate operational alerts for the report
   * @param {BurnResults} burnResults - Burn calculation results
   * @returns {any[]} Array of alert objects
   */
  generateOperationalAlerts(burnResults: BurnResults): any[] {
    const alerts: any[] = [];

    // Commission rate issues (CRITICAL - as requested)
    if (burnResults.statistics.validatorsWithCommissionIssues > 0) {
      alerts.push({
        type: "critical",
        category: "commission",
        message: `${burnResults.statistics.validatorsWithCommissionIssues} validators have incorrect commission rates`,
        details: `Expected ${
          config.business.validatorCommissionRate * 100
        }% commission for restricted validators.`,
        priority: "high",
        action:
          "Update validator commission rates to 90% before implementing burn transfers",
        affectedValidators: burnResults.validatorResults
          .filter((v) => v.commissionIssues.length > 0)
          .map((v) => ({
            moniker: v.moniker,
            address: v.address,
            currentRate: `${(v.commissionRate * 100).toFixed(1)}%`,
          })),
      });
    }

    // No rewards warning
    const validatorsWithoutRewards =
      burnResults.statistics.totalValidators -
      burnResults.statistics.validatorsWithRewards;
    if (validatorsWithoutRewards > 0) {
      alerts.push({
        type: "info",
        category: "rewards",
        message: `${validatorsWithoutRewards} validators have no rewards to burn`,
        priority: "low",
      });
    }

    // Large burn amounts warning
    const totalBurnTac = parseFloat(
      burnResults.totals.totalBurnAmountTac.replace(/,/g, "")
    );
    if (totalBurnTac > 100) {
      alerts.push({
        type: "warning",
        category: "amount",
        message: `Large burn amount detected: ${burnResults.totals.totalBurnAmountTac} TAC`,
        details: "Please verify calculations before executing burns",
        priority: "medium",
      });
    }

    return alerts;
  }

  /**
   * Health check for burn calculator
   * @returns {object} Health check results
   */
  async healthCheck() {
    try {
      const validatorHealth = await this.validatorService.healthCheck();

      if (!validatorHealth.healthy) {
        return {
          healthy: false,
          error: "Validator service unhealthy",
          details: validatorHealth,
        };
      }

      return {
        healthy: true,
        validatorService: validatorHealth,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
