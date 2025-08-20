/**
 * Validator Service for TAC Restricted Validator Burn Calculator
 * Specialized functions to fetch and process validator information for burn calculations
 */

const CosmosClient = require("./cosmosClient");
const TransactionService = require("./transactionService");
const logger = require("../utils/logger");
const config = require("../config/config");
const {
  calculateBurnAmount,
  addUtacAmounts,
  isValidUtacAmount,
  formatTacAmount,
} = require("../utils/tokenConverter");
const {
  ValidationError,
  CalculationError,
  handleAsyncOperation,
} = require("../utils/errorHandler");

class ValidatorService {
  constructor() {
    this.cosmosClient = new CosmosClient();
    this.transactionService = new TransactionService();
    this.restrictedValidators = config.restrictedValidators;
    this.serviceLogger = logger.withContext("validator-service");
    this.expectedCommissionRate = config.business.validatorCommissionRate; // 0.9 (90%)
    this.burnRate = config.business.burnRate; // 0.8 (80%)

    this.serviceLogger.info("Validator service initialized", {
      restrictedValidatorCount: this.restrictedValidators.length,
      expectedCommissionRate: this.expectedCommissionRate,
      burnRate: this.burnRate,
    });
  }

  /**
   * Get detailed information for a single restricted validator
   */
  async getValidatorDetails(validatorAddress) {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.debug("Fetching validator details", {
          validator: validatorAddress,
        });

        const [validator, outstandingRewards, commission, claimedCommission] =
          await Promise.all([
            this.cosmosClient.getValidator(validatorAddress),
            this.cosmosClient.getValidatorOutstandingRewards(validatorAddress),
            this.cosmosClient.getValidatorCommission(validatorAddress),
            this.transactionService.getTotalClaimedCommission(validatorAddress), // Add claimed commission
          ]);

        // Process and validate the data
        const details = this.processValidatorData(
          validatorAddress,
          validator,
          outstandingRewards,
          commission,
          claimedCommission
        );

        logger.validatorOp(validatorAddress, "details_fetched", {
          moniker: details.moniker,
          status: details.status,
          commissionRate: details.commissionRate,
          totalRewardsUtac: details.totalRewardsUtac,
        });

        return details;
      },
      `get_validator_details_${validatorAddress}`,
      this.serviceLogger
    );
  }

  /**
   * Get detailed information for all restricted validators
   */
  async getAllRestrictedValidatorsDetails() {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.info("Fetching all restricted validators details");

        const batchResult = await this.cosmosClient.batchGetValidators(
          this.restrictedValidators
        );

        const processedValidators = [];
        const errors = [];

        // Process successful fetches
        for (const validatorData of batchResult.successful) {
          try {
            const details = this.processValidatorData(
              validatorData.address,
              validatorData.validator,
              validatorData.outstandingRewards,
              validatorData.commission
            );
            processedValidators.push(details);
          } catch (error) {
            errors.push({
              validator: validatorData.address,
              error: error.message,
            });
          }
        }

        // Add failed fetches to errors
        errors.push(...batchResult.failed);

        this.serviceLogger.info("Restricted validators processing complete", {
          successful: processedValidators.length,
          failed: errors.length,
          totalExpected: this.restrictedValidators.length,
        });

        if (errors.length > 0) {
          this.serviceLogger.warn("Some validators had issues", { errors });
        }

        return {
          validators: processedValidators,
          errors,
          summary: this.generateSummary(processedValidators),
        };
      },
      "get_all_restricted_validators",
      this.serviceLogger
    );
  }

  /**
   * Process raw validator data into structured format for burn calculations
   * Includes both unclaimed and claimed commission for complete coverage
   */
  processValidatorData(
    address,
    validator,
    outstandingRewards,
    commission,
    claimedCommission = "0"
  ) {
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
    const outstandingRewardsUtac = tacRewards?.amount || "0";

    // Process commission (unclaimed)
    const tacCommission = commission.find(
      (c) => c.denom === config.chain.tokenDenom
    );
    const unclaimedCommissionUtac = tacCommission?.amount || "0";

    // Add claimed commission to get total commission (claimed + unclaimed)
    const totalCommissionUtac = addUtacAmounts(
      unclaimedCommissionUtac,
      claimedCommission
    );

    // Calculate total rewards (outstanding + total commission) for reporting
    const totalRewardsUtac = addUtacAmounts(
      outstandingRewardsUtac,
      totalCommissionUtac
    );

    // Validate commission rate for restricted validators (strict enforcement)
    const commissionIssues = this.validateCommissionRate(
      address,
      commissionRate
    );

    // STRICT ENFORCEMENT: Fail if commission rate is not exactly 90%
    if (commissionIssues.length > 0) {
      throw new ValidationError(
        `Restricted validator ${address} has incorrect commission rate: ${(
          commissionRate * 100
        ).toFixed(1)}% (must be exactly 90%)`,
        {
          validator: address,
          moniker,
          currentRate: commissionRate,
          expectedRate: this.expectedCommissionRate,
          issues: commissionIssues,
        }
      );
    }

    // Calculate burn amounts based on TOTAL COMMISSION (claimed + unclaimed)
    // Burn 80% of total commission, validator keeps 20% of total commission
    const burnCalculation = calculateBurnAmount(
      totalCommissionUtac,
      this.burnRate
    );

    const details = {
      address,
      moniker,
      status,
      commissionRate,
      commissionRateStr,
      isActive: status === "BOND_STATUS_BONDED",
      isJailed: validator.jailed || false,

      // Raw amounts in utac
      outstandingRewardsUtac,
      unclaimedCommissionUtac,
      claimedCommissionUtac: claimedCommission,
      totalCommissionUtac,
      totalRewardsUtac,

      // Burn calculation
      burnAmount: burnCalculation.burnAmount,
      validatorKeeps: burnCalculation.validatorKeeps,

      // Human-readable amounts
      outstandingRewardsTac: formatTacAmount(outstandingRewardsUtac),
      unclaimedCommissionTac: formatTacAmount(unclaimedCommissionUtac),
      claimedCommissionTac: formatTacAmount(claimedCommission),
      totalCommissionTac: formatTacAmount(totalCommissionUtac),
      totalRewardsTac: formatTacAmount(totalRewardsUtac), // ✅ actual total = outstanding + total commission
      burnAmountTac: burnCalculation.burnAmountTac,
      validatorKeepsTac: burnCalculation.validatorKeepsTac,

      // Validation
      commissionIssues,
      hasRewards:
        isValidUtacAmount(totalRewardsUtac) && totalRewardsUtac !== "0", // total rewards for reporting
      hasCommission:
        isValidUtacAmount(totalCommissionUtac) && totalCommissionUtac !== "0", // total commission for burn calculation

      // Metadata
      fetchedAt: new Date().toISOString(),
    };

    // Log calculation for audit trail
    logger.calculation(
      "validator_burn_calculation",
      {
        validator: address,
        unclaimedCommission: unclaimedCommissionUtac,
        claimedCommission: claimedCommission,
        totalCommission: totalCommissionUtac,
        burnRate: this.burnRate,
        note: "Burn calculated from total commission (claimed + unclaimed)",
      },
      {
        burnAmount: details.burnAmount,
        validatorKeeps: details.validatorKeeps,
      }
    );

    return details;
  }

  /**
   * Validate commission rate for restricted validators
   */
  validateCommissionRate(validatorAddress, actualRate) {
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

    if (issues.length > 0) {
      this.serviceLogger.warn("Commission rate validation issues", {
        validator: validatorAddress,
        issues,
      });
    }

    return issues;
  }

  /**
   * Generate summary statistics for all validators
   */
  generateSummary(validators) {
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
        validator.totalRewardsUtac
      );
    }

    const summary = {
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

    this.serviceLogger.info("Validator summary generated", summary);
    return summary;
  }

  /**
   * Get validators that need commission rate updates
   */
  async getValidatorsNeedingCommissionUpdate() {
    const result = await this.getAllRestrictedValidatorsDetails();

    const needingUpdate = result.validators.filter(
      (v) => v.commissionIssues.length > 0
    );

    this.serviceLogger.info("Validators needing commission updates", {
      count: needingUpdate.length,
      validators: needingUpdate.map((v) => ({
        address: v.address,
        moniker: v.moniker,
        currentRate: v.commissionRate,
        expectedRate: this.expectedCommissionRate,
      })),
    });

    return needingUpdate;
  }

  /**
   * Get validators with commission ready for burning
   */
  async getValidatorsWithBurnableRewards() {
    const result = await this.getAllRestrictedValidatorsDetails();

    const withCommission = result.validators.filter(
      (v) => v.hasCommission && v.commissionUtac !== "0"
    );

    this.serviceLogger.info("Validators with burnable commission", {
      count: withCommission.length,
      totalBurnAmount: formatTacAmount(
        withCommission.reduce(
          (sum, v) => addUtacAmounts(sum, v.burnAmount),
          "0"
        )
      ),
    });

    return withCommission;
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
      this.serviceLogger.error("Validator service health check failed", {
        error: error.message,
      });

      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = ValidatorService;
