/**
 * Delegation Validator for TAC Restricted Validators
 * Ensures delegations come from locked/vesting sources only
 */

const CosmosClient = require("./cosmosClient");
const logger = require("../utils/logger");
const config = require("../config/config");
const {
  ValidationError,
  handleAsyncOperation,
} = require("../utils/errorHandler");

class DelegationValidator {
  constructor() {
    this.cosmosClient = new CosmosClient();
    this.serviceLogger = logger.withContext("delegation-validator");

    this.serviceLogger.info("Delegation validator initialized");
  }

  /**
   * Validate that all delegations to a validator come from locked/vesting sources
   * @param {string} validatorAddress - Validator address to check
   * @returns {Object} Validation result with details
   */
  async validateLockedTokensOnly(validatorAddress) {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.info("Validating locked tokens only", {
          validator: validatorAddress,
        });

        // Get all delegations to this validator
        const delegations = await this.getValidatorDelegations(
          validatorAddress
        );

        // Check each delegator account type
        const delegationChecks = await Promise.allSettled(
          delegations.map(async (delegation) => {
            return await this.validateDelegatorAccountType(
              delegation.delegator_address
            );
          })
        );

        // Process results
        const validDelegations = [];
        const invalidDelegations = [];
        const errorDelegations = [];

        for (let i = 0; i < delegationChecks.length; i++) {
          const check = delegationChecks[i];
          const delegation = delegations[i];

          if (check.status === "fulfilled") {
            if (check.value.isLockedOrVesting) {
              validDelegations.push({
                ...delegation,
                accountType: check.value.accountType,
              });
            } else {
              invalidDelegations.push({
                ...delegation,
                accountType: check.value.accountType,
                issue: "Not a locked/vesting account",
              });
            }
          } else {
            errorDelegations.push({
              ...delegation,
              error: check.reason.message,
            });
          }
        }

        const isCompliant = invalidDelegations.length === 0;

        const result = {
          validator: validatorAddress,
          isCompliant,
          totalDelegations: delegations.length,
          validDelegations: validDelegations.length,
          invalidDelegations: invalidDelegations.length,
          errorDelegations: errorDelegations.length,
          details: {
            valid: validDelegations,
            invalid: invalidDelegations,
            errors: errorDelegations,
          },
        };

        this.serviceLogger.info("Locked tokens validation completed", {
          validator: validatorAddress,
          isCompliant,
          totalDelegations: result.totalDelegations,
          validDelegations: result.validDelegations,
          invalidDelegations: result.invalidDelegations,
        });

        if (!isCompliant) {
          this.serviceLogger.warn("Validator has non-locked delegations", {
            validator: validatorAddress,
            invalidCount: invalidDelegations.length,
            invalidDelegators: invalidDelegations.map(
              (d) => d.delegator_address
            ),
          });
        }

        return result;
      },
      `validate_locked_tokens_${validatorAddress}`,
      this.serviceLogger
    );
  }

  /**
   * Get all delegations to a validator
   * @param {string} validatorAddress - Validator address
   * @returns {Array} Array of delegation objects
   */
  async getValidatorDelegations(validatorAddress) {
    let allDelegations = [];
    let nextKey = null;
    let pageCount = 0;

    do {
      const params = {
        "pagination.limit": "100",
      };

      if (nextKey) {
        params["pagination.key"] = nextKey;
      }

      const response = await this.cosmosClient.get(
        `/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations`,
        params
      );

      if (response.delegation_responses) {
        allDelegations.push(...response.delegation_responses);
        pageCount++;
      }

      nextKey = response.pagination?.next_key;

      this.serviceLogger.debug("Delegations page fetched", {
        validator: validatorAddress,
        page: pageCount,
        delegationsInPage: response.delegation_responses?.length || 0,
        totalSoFar: allDelegations.length,
        hasNextPage: !!nextKey,
      });
    } while (nextKey);

    return allDelegations;
  }

  /**
   * Validate delegator account type (locked/vesting vs regular)
   * @param {string} delegatorAddress - Delegator address
   * @returns {Object} Account type validation result
   */
  async validateDelegatorAccountType(delegatorAddress) {
    try {
      // Get account information
      const accountInfo = await this.cosmosClient.get(
        `/cosmos/auth/v1beta1/accounts/${delegatorAddress}`
      );

      const account = accountInfo.account;
      const accountType = account["@type"] || account.type || "unknown";

      // Check if account type indicates locked/vesting tokens
      const lockedAccountTypes = [
        "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
        "/cosmos.vesting.v1beta1.DelayedVestingAccount",
        "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
        "/cosmos.vesting.v1beta1.PermanentLockedAccount",
        // Add other locked account types as needed
      ];

      const isLockedOrVesting = lockedAccountTypes.includes(accountType);

      return {
        delegator: delegatorAddress,
        accountType,
        isLockedOrVesting,
        isCompliant: isLockedOrVesting,
      };
    } catch (error) {
      // If we can't determine account type, assume non-compliant for safety
      this.serviceLogger.warn("Could not determine account type", {
        delegator: delegatorAddress,
        error: error.message,
      });

      return {
        delegator: delegatorAddress,
        accountType: "unknown",
        isLockedOrVesting: false,
        isCompliant: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate all restricted validators for locked tokens compliance
   * @returns {Object} Complete validation results
   */
  async validateAllRestrictedValidators() {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.info(
          "Validating all restricted validators for locked tokens"
        );

        const validationResults = await Promise.allSettled(
          config.restrictedValidators.map(async (validatorAddress) => {
            return await this.validateLockedTokensOnly(validatorAddress);
          })
        );

        const compliantValidators = [];
        const nonCompliantValidators = [];
        const errorValidators = [];

        for (let i = 0; i < validationResults.length; i++) {
          const result = validationResults[i];
          const validatorAddress = config.restrictedValidators[i];

          if (result.status === "fulfilled") {
            if (result.value.isCompliant) {
              compliantValidators.push(result.value);
            } else {
              nonCompliantValidators.push(result.value);
            }
          } else {
            errorValidators.push({
              validator: validatorAddress,
              error: result.reason.message,
            });
          }
        }

        const overallCompliance =
          nonCompliantValidators.length === 0 && errorValidators.length === 0;

        const summary = {
          overallCompliance,
          totalValidators: config.restrictedValidators.length,
          compliantValidators: compliantValidators.length,
          nonCompliantValidators: nonCompliantValidators.length,
          errorValidators: errorValidators.length,
          details: {
            compliant: compliantValidators,
            nonCompliant: nonCompliantValidators,
            errors: errorValidators,
          },
        };

        this.serviceLogger.info("Locked tokens validation summary", {
          overallCompliance,
          compliantValidators: summary.compliantValidators,
          nonCompliantValidators: summary.nonCompliantValidators,
          errorValidators: summary.errorValidators,
        });

        return summary;
      },
      "validate_all_restricted_validators_locked_tokens",
      this.serviceLogger
    );
  }

  /**
   * Health check for delegation validator
   */
  async healthCheck() {
    try {
      // Test with first restricted validator
      if (config.restrictedValidators.length > 0) {
        const testValidator = config.restrictedValidators[0];
        const delegations = await this.getValidatorDelegations(testValidator);

        return {
          healthy: true,
          testValidator,
          delegationCount: delegations.length,
        };
      }

      return {
        healthy: true,
        note: "No validators to test",
      };
    } catch (error) {
      this.serviceLogger.error("Delegation validator health check failed", {
        error: error.message,
      });

      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = DelegationValidator;

