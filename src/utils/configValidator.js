/**
 * Configuration validation utilities
 */

/**
 * Validate validator address format
 */
function validateValidatorAddress(address) {
  // TAC validator addresses should start with 'tacvaloper' and be bech32 format
  const validatorRegex = /^tacvaloper[a-z0-9]{39}$/;
  return validatorRegex.test(address);
}

/**
 * Validate all restricted validator addresses
 */
function validateRestrictedValidators(validators) {
  const errors = [];

  if (!Array.isArray(validators)) {
    errors.push("Restricted validators must be an array");
    return errors;
  }

  if (validators.length === 0) {
    errors.push("At least one restricted validator is required");
    return errors;
  }

  validators.forEach((validator, index) => {
    if (typeof validator !== "string") {
      errors.push(`Validator at index ${index} must be a string`);
    } else if (!validateValidatorAddress(validator)) {
      errors.push(
        `Invalid validator address format at index ${index}: ${validator}`
      );
    }
  });

  return errors;
}

/**
 * Validate business rules configuration
 */
function validateBusinessRules(business) {
  const errors = [];

  if (!business || typeof business !== "object") {
    errors.push("Business rules configuration is required");
    return errors;
  }

  // Validate commission rate (should be 0.9 for restricted validators)
  if (
    typeof business.validatorCommissionRate !== "number" ||
    business.validatorCommissionRate < 0 ||
    business.validatorCommissionRate > 1
  ) {
    errors.push("Validator commission rate must be a number between 0 and 1");
  }

  // Validate keep rate
  if (
    typeof business.validatorKeepRate !== "number" ||
    business.validatorKeepRate < 0 ||
    business.validatorKeepRate > 1
  ) {
    errors.push("Validator keep rate must be a number between 0 and 1");
  }

  // Validate burn rate
  if (
    typeof business.burnRate !== "number" ||
    business.burnRate < 0 ||
    business.burnRate > 1
  ) {
    errors.push("Burn rate must be a number between 0 and 1");
  }

  // Validate that keep rate + burn rate = commission rate
  if (
    typeof business.validatorKeepRate === "number" &&
    typeof business.burnRate === "number" &&
    typeof business.validatorCommissionRate === "number"
  ) {
    const total = business.validatorKeepRate + business.burnRate;
    const expected = business.validatorCommissionRate;
    if (Math.abs(total - expected) > 0.001) {
      // Allow for floating point precision
      errors.push(
        `Keep rate (${business.validatorKeepRate}) + Burn rate (${business.burnRate}) must equal commission rate (${expected})`
      );
    }
  }

  return errors;
}

/**
 * Validate complete configuration
 */
function validateCompleteConfig(config) {
  const allErrors = [];

  // Validate restricted validators
  if (config.restrictedValidators) {
    const validatorErrors = validateRestrictedValidators(
      config.restrictedValidators
    );
    allErrors.push(...validatorErrors);
  }

  // Validate business rules
  if (config.business) {
    const businessErrors = validateBusinessRules(config.business);
    allErrors.push(...businessErrors);
  }

  if (allErrors.length > 0) {
    console.error("Configuration validation failed:", allErrors);
    return { valid: false, errors: allErrors };
  }

  console.log("Configuration validation successful:", {
    validatorCount: config.restrictedValidators?.length || 0,
    commissionRate: config.business?.validatorCommissionRate,
    burnRate: config.business?.burnRate,
  });

  return { valid: true, errors: [] };
}

module.exports = {
  validateValidatorAddress,
  validateRestrictedValidators,
  validateBusinessRules,
  validateCompleteConfig,
};
