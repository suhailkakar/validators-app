/**
 * Configuration for TAC Validator Burn Calculator
 */

// Load environment configuration
function getEnvironmentConfig() {
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

const envConfig = getEnvironmentConfig();

export const config = {
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

export default config;
