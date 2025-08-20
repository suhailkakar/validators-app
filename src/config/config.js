/**
 * Configuration for TAC Validator Burn Calculator
 */

const { getEnvironmentConfig } = require("./environment");
const { validateCompleteConfig } = require("../utils/configValidator");

// Load environment configuration
const envConfig = getEnvironmentConfig();

module.exports = {
  // TAC Chain Configuration (from environment)
  chain: {
    chainId: envConfig.chainId,
    rpcEndpoint: envConfig.rpcEndpoint,
    restEndpoint: envConfig.restEndpoint,
    tokenDenom: envConfig.tokenDenom,
    tokenDecimals: envConfig.tokenDecimals,
  },

  // Restricted Validators (provided by user)
  restrictedValidators: [
    "tacvaloper14zdtx5j770q700e8xg2v6lm0g3m58mc0qvs0kp",
    "tacvaloper1e4xgzj8vasua0pd65t3jnr2nc2yccdqhlhmdvl",
    "tacvaloper1mcmgua3ewywj8m3y2a6tayfkt8w7m77tl3ruvf",
    "tacvaloper1vff4r0nc766n6x68ceatv4ffea2ltr8l04u8t6",
    "tacvaloper1w25sweez0ek6wyk0yg2vx3ttqgyn3tuwjkzfjr",
    "tacvaloper1tcjtpw8u7u6eu4hez8z2zfu6lssvt82v79egp5",
    "tacvaloper16937gs3thamqecrrnns3dt7sgzpymkyf5nfpe2",
    "tacvaloper1lh6xd8x9n9jspywcpf6npke9glh56pd5qreyfd",
    "tacvaloper1a4xlewuye9uvjyp4s4yklkvg3pkrua02ms047v",
  ],

  // Business Rules
  business: {
    validatorCommissionRate: 0.9, // 90% commission rate
    validatorKeepRate: 0.1, // 10% of commission stays with validator
    burnRate: 0.8, // 80% of commission must be burned
  },

  // Burn address (from environment)
  burnAddress: envConfig.burnAddress,

  // API Configuration (from environment)
  api: {
    requestTimeout: envConfig.requestTimeout,
    retryAttempts: envConfig.retryAttempts,
    retryDelay: envConfig.retryDelay,
  },

  // Logging Configuration (from environment)
  logging: {
    level: envConfig.logLevel,
    format: envConfig.logFormat,
  },
};

// Validate the complete configuration
const validation = validateCompleteConfig(module.exports);
if (!validation.valid) {
  throw new Error(
    `Configuration validation failed: ${validation.errors.join(", ")}`
  );
}
