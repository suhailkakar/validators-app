/**
 * Main Burn Calculator for TAC Restricted Validators
 * Orchestrates time period filtering, validator data fetching, and burn calculations
 */

const ValidatorService = require("../services/validatorService");
const TimePeriodCalculator = require("./timePeriodCalculator");
const logger = require("../utils/logger");
const config = require("../config/config");
const {
  formatTacAmount,
  addUtacAmounts,
  calculateBurnAmount,
} = require("../utils/tokenConverter");
const {
  ValidationError,
  CalculationError,
  handleAsyncOperation,
} = require("../utils/errorHandler");

class BurnCalculator {
  constructor() {
    this.validatorService = new ValidatorService();
    this.timePeriodCalculator = new TimePeriodCalculator();
    this.calculatorLogger = logger.withContext("burn-calculator");

    this.calculatorLogger.info("Burn calculator initialized", {
      restrictedValidatorCount: config.restrictedValidators.length,
      burnRate: config.business.burnRate,
      expectedCommissionRate: config.business.validatorCommissionRate,
    });
  }

  /**
   * Calculate burns for a specific monthly period
   * @param {string|Object} period - Period string (YYYY-MM) or period object
   * @returns {Object} Complete burn calculation results
   */
  async calculateMonthlyBurns(period) {
    return handleAsyncOperation(
      async () => {
        // Parse period if it's a string
        const periodObj =
          typeof period === "string"
            ? this.timePeriodCalculator.parsePeriodString(period)
            : period;

        this.calculatorLogger.info("Starting monthly burn calculation", {
          period: periodObj.label,
          displayName: periodObj.displayName,
        });

        // Validate period for calculation
        const periodValidation =
          this.timePeriodCalculator.validatePeriodForCalculation(periodObj);

        if (!periodValidation.canCalculate) {
          throw new ValidationError(
            `Cannot calculate burns for this period: ${periodValidation.issues.join(
              ", "
            )}`,
            { period: periodObj.label, issues: periodValidation.issues }
          );
        }

        // Get all validator data
        const validatorData =
          await this.validatorService.getAllRestrictedValidatorsDetails();

        // Calculate burn amounts
        const burnResults = this.processBurnCalculations(
          validatorData.validators,
          periodObj
        );

        // Generate comprehensive report
        const report = this.generateBurnReport(
          burnResults,
          periodObj,
          periodValidation,
          validatorData.errors
        );

        this.calculatorLogger.info("Monthly burn calculation completed", {
          period: periodObj.label,
          totalValidators: burnResults.validatorResults.length,
          totalBurnAmount: report.summary.totalBurnAmountTac,
          commissionIssues: report.summary.validatorsWithCommissionIssues,
        });

        return report;
      },
      `calculate_monthly_burns_${
        typeof period === "string" ? period : period.label
      }`,
      this.calculatorLogger
    );
  }

  /**
   * Process burn calculations for all validators
   * @param {Array} validators - Array of validator details
   * @param {Object} period - Period object
   * @returns {Object} Burn calculation results
   */
  processBurnCalculations(validators, period) {
    this.calculatorLogger.info("Processing burn calculations", {
      validatorCount: validators.length,
      period: period.label,
    });

    const validatorResults = [];
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
        const result = {
          // Validator info
          address: validator.address,
          moniker: validator.moniker,
          status: validator.status,
          isActive: validator.isActive,
          isJailed: validator.isJailed,

          // Commission info
          currentCommissionRate: validator.commissionRate,
          expectedCommissionRate: config.business.validatorCommissionRate,
          hasCommissionIssues: validator.commissionIssues.length > 0,
          commissionIssues: validator.commissionIssues,

          // Reward amounts (utac)
          outstandingRewardsUtac: validator.outstandingRewardsUtac,
          unclaimedCommissionUtac: validator.unclaimedCommissionUtac,
          claimedCommissionUtac: validator.claimedCommissionUtac,
          totalCommissionUtac: validator.totalCommissionUtac,
          totalRewardsUtac: validator.totalRewardsUtac,

          // Burn amounts (utac)
          burnAmountUtac: burnCalculation.burnAmount,
          validatorKeepsUtac: burnCalculation.validatorKeeps,

          // Human-readable amounts (TAC)
          outstandingRewardsTac: validator.outstandingRewardsTac,
          unclaimedCommissionTac: validator.unclaimedCommissionTac,
          claimedCommissionTac: validator.claimedCommissionTac,
          totalCommissionTac: validator.totalCommissionTac,
          totalRewardsTac: formatTacAmount(validator.totalRewardsUtac), // ✅ actual total, not burn base
          burnAmountTac: burnCalculation.burnAmountTac,
          validatorKeepsTac: burnCalculation.validatorKeepsTac,

          // Flags
          hasRewards: validator.hasRewards, // total rewards for reporting
          hasCommission: validator.hasCommission, // commission for burn calculation
          shouldBurn: validator.hasCommission, // burn based on commission only

          // Metadata
          calculatedAt: new Date().toISOString(),
        };

        validatorResults.push(result);

        // Accumulate totals (based on commission for burn calculations)
        if (result.hasCommission) {
          totalBurnAmountUtac = addUtacAmounts(
            totalBurnAmountUtac,
            result.burnAmountUtac
          );
          totalValidatorKeepsUtac = addUtacAmounts(
            totalValidatorKeepsUtac,
            result.validatorKeepsUtac
          );
          totalRewardsUtac = addUtacAmounts(
            totalRewardsUtac,
            result.totalRewardsUtac
          );
          validatorsWithRewards++; // Note: this counts commission-bearing validators for burn purposes
        }

        if (result.hasCommissionIssues) {
          validatorsWithCommissionIssues++;
        }

        // Log individual calculation
        logger.calculation(
          "individual_burn_calculation",
          {
            validator: validator.moniker,
            address: validator.address,
            unclaimedCommission: validator.unclaimedCommissionUtac,
            claimedCommission: validator.claimedCommissionUtac,
            totalCommission: validator.totalCommissionUtac,
            period: period.label,
            note: "Burn calculated from total commission (claimed + unclaimed)",
          },
          {
            burnAmount: result.burnAmountUtac,
            validatorKeeps: result.validatorKeepsUtac,
            hasCommissionIssues: result.hasCommissionIssues,
          }
        );
      } catch (error) {
        this.calculatorLogger.error("Failed to process validator", {
          validator: validator.address,
          moniker: validator.moniker,
          error: error.message,
        });

        // Add error entry
        validatorResults.push({
          address: validator.address,
          moniker: validator.moniker || "Unknown",
          error: error.message,
          hasError: true,
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
        validatorsWithErrors: validatorResults.filter((v) => v.hasError).length,
        validatorsReadyToBurn: validatorResults.filter((v) => v.shouldBurn)
          .length,
      },
    };
  }

  /**
   * Generate comprehensive burn report
   * @param {Object} burnResults - Results from processBurnCalculations
   * @param {Object} period - Period object
   * @param {Object} periodValidation - Period validation results
   * @param {Array} fetchErrors - Any errors from data fetching
   * @returns {Object} Complete burn report
   */
  generateBurnReport(burnResults, period, periodValidation, fetchErrors = []) {
    const periodSummary =
      this.timePeriodCalculator.generatePeriodSummary(period);

    const report = {
      // Report metadata
      reportType: "monthly_burn_calculation",
      generatedAt: new Date().toISOString(),
      calculatorVersion: "1.0.0",

      // Period information
      period: periodSummary,

      // Validation status
      validation: {
        periodValidation,
        hasDataFetchErrors: fetchErrors.length > 0,
        dataFetchErrors: fetchErrors,
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
      alerts: this.generateOperationalAlerts(burnResults, periodValidation),

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
   * @param {Object} burnResults - Burn calculation results
   * @param {Object} periodValidation - Period validation results
   * @returns {Array} Array of alert objects
   */
  generateOperationalAlerts(burnResults, periodValidation) {
    const alerts = [];

    // Period warnings
    if (periodValidation.shouldWarn) {
      alerts.push({
        type: "warning",
        category: "period",
        message: "Period validation warnings",
        details: periodValidation.warnings,
        priority: "medium",
      });
    }

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
          .filter((v) => v.hasCommissionIssues)
          .map((v) => ({
            moniker: v.moniker,
            address: v.address,
            currentRate: `${(v.currentCommissionRate * 100).toFixed(1)}%`,
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
   * @returns {Object} Health check results
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

      // Test time period calculator
      const testPeriod = this.timePeriodCalculator.createPreviousMonthPeriod();
      const periodValidation =
        this.timePeriodCalculator.validatePeriodForCalculation(testPeriod);

      return {
        healthy: true,
        validatorService: validatorHealth,
        timePeriodCalculator: {
          working: true,
          testPeriod: testPeriod.label,
          canCalculate: periodValidation.canCalculate,
        },
      };
    } catch (error) {
      this.calculatorLogger.error("Burn calculator health check failed", {
        error: error.message,
      });

      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = BurnCalculator;
