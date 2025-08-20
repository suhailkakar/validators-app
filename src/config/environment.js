/**
 * Environment configuration handler for TAC Validator Burn Calculator
 * Handles environment variables and configuration validation
 */

// Load environment variables from .env file if it exists
require("dotenv").config();

/**
 * Load configuration from environment variables with fallback defaults
 */
function loadEnvironmentConfig() {
  return {
    // TAC Chain Configuration (real values)
    chainId: process.env.TAC_CHAIN_ID || "tacchain_239-1",
    rpcEndpoint:
      process.env.TAC_RPC_ENDPOINT || "https://tendermint.rpc.tac.build",
    restEndpoint:
      process.env.TAC_REST_ENDPOINT || "https://cosmos-api.rpc.tac.build",
    tokenDenom: process.env.TAC_TOKEN_DENOM || "utac",
    tokenDecimals: parseInt(process.env.TAC_TOKEN_DECIMALS || "18"),

    // Burn address (real TAC Foundation burn address)
    burnAddress:
      process.env.TAC_BURN_ADDRESS ||
      "tac1qqqqqqqqqqqqqqqqqqqqqqqqqqqqph4dsdprc8",

    // API Configuration
    requestTimeout: parseInt(process.env.API_TIMEOUT || "30000"),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || "3"),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || "1000"),

    // Logging
    logLevel: process.env.LOG_LEVEL || "info",
    logFormat: process.env.LOG_FORMAT || "json",
  };
}

/**
 * Validate configuration values
 */
function validateConfig(config) {
  const errors = [];

  // Required fields validation
  if (!config.chainId) errors.push("Chain ID is required");
  if (!config.rpcEndpoint) errors.push("RPC endpoint is required");
  if (!config.restEndpoint) errors.push("REST endpoint is required");
  if (!config.tokenDenom) errors.push("Token denomination is required");
  if (!config.burnAddress) {
    errors.push("Burn address is required");
  }
  // Note: For development, we allow placeholder addresses with 'xxx'
  // In production, this should be a real TAC address

  // Numeric validations
  if (config.tokenDecimals < 0 || config.tokenDecimals > 18) {
    errors.push("Token decimals must be between 0 and 18");
  }
  if (config.requestTimeout < 1000) {
    errors.push("Request timeout must be at least 1000ms");
  }
  if (config.retryAttempts < 0 || config.retryAttempts > 10) {
    errors.push("Retry attempts must be between 0 and 10");
  }

  // URL validations
  try {
    new URL(config.rpcEndpoint);
  } catch {
    errors.push("RPC endpoint must be a valid URL");
  }

  try {
    new URL(config.restEndpoint);
  } catch {
    errors.push("REST endpoint must be a valid URL");
  }

  return errors;
}

/**
 * Get validated environment configuration
 */
function getEnvironmentConfig() {
  const config = loadEnvironmentConfig();
  const errors = validateConfig(config);

  if (errors.length > 0) {
    console.error("Configuration validation failed:", errors);
    throw new Error(`Configuration errors: ${errors.join(", ")}`);
  }

  // Log configuration status (without sensitive data) - using console to avoid circular dependency
  console.log("Environment configuration loaded:", {
    chainId: config.chainId,
    hasCustomRpc: !config.rpcEndpoint.includes("cosmos.directory"),
    hasCustomRest: !config.restEndpoint.includes("cosmos.directory"),
    tokenDenom: config.tokenDenom,
    tokenDecimals: config.tokenDecimals,
    hasBurnAddress: !config.burnAddress.includes("xxx"),
  });

  return config;
}

module.exports = {
  loadEnvironmentConfig,
  validateConfig,
  getEnvironmentConfig,
};
