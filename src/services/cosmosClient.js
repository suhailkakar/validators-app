/**
 * Cosmos SDK REST API client for TAC blockchain
 * Handles all interactions with the TAC chain's REST endpoints
 */

const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config/config");
const {
  RetryHandler,
  APIError,
  NetworkError,
  handleAsyncOperation,
} = require("../utils/errorHandler");

class CosmosClient {
  constructor() {
    this.baseURL = config.chain.restEndpoint;
    this.chainId = config.chain.chainId;
    this.tokenDenom = config.chain.tokenDenom;
    this.retryHandler = new RetryHandler(
      config.api.retryAttempts,
      config.api.retryDelay
    );
    this.clientLogger = logger.withContext("cosmos-client");

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.api.requestTimeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request/response interceptors for logging
    this.setupInterceptors();

    this.clientLogger.info("Cosmos client initialized", {
      baseURL: this.baseURL,
      chainId: this.chainId,
      tokenDenom: this.tokenDenom,
    });
  }

  /**
   * Setup axios interceptors for request/response logging
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        logger.apiCall(
          response.config.method.toUpperCase(),
          response.config.url,
          duration,
          response.status,
          {
            responseSize: JSON.stringify(response.data).length + " bytes",
          }
        );
        return response;
      },
      (error) => {
        if (error.config && error.config.metadata) {
          const duration = Date.now() - error.config.metadata.startTime;
          logger.apiCall(
            error.config.method?.toUpperCase() || "UNKNOWN",
            error.config.url || "unknown",
            duration,
            error.response?.status || 0,
            {
              error: error.message,
            }
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request with retry logic
   */
  async get(endpoint, params = {}) {
    return handleAsyncOperation(
      async () => {
        return await this.retryHandler.executeWithRetry(async () => {
          const response = await this.client.get(endpoint, { params });
          return response.data;
        }, `GET ${endpoint}`);
      },
      `cosmos_api_get_${endpoint}`,
      this.clientLogger
    );
  }

  /**
   * Get basic chain information
   */
  async getChainInfo() {
    this.clientLogger.info("Fetching chain information");

    const [nodeInfo, stakingParams] = await Promise.all([
      this.get("/cosmos/base/tendermint/v1beta1/node_info"),
      this.get("/cosmos/staking/v1beta1/params"),
    ]);

    const chainInfo = {
      chainId: nodeInfo.default_node_info?.network || this.chainId,
      nodeVersion: nodeInfo.default_node_info?.version,
      bondDenom: stakingParams.params?.bond_denom || this.tokenDenom,
      maxValidators: parseInt(stakingParams.params?.max_validators || "0"),
      unbondingTime: stakingParams.params?.unbonding_time,
    };

    this.clientLogger.info("Chain information retrieved", chainInfo);
    return chainInfo;
  }

  /**
   * Get all validators (active and inactive)
   */
  async getAllValidators() {
    this.clientLogger.info("Fetching all validators");

    let allValidators = [];
    let nextKey = null;
    let pageCount = 0;

    do {
      const params = {
        "pagination.limit": "100", // Get 100 validators per page
      };

      if (nextKey) {
        params["pagination.key"] = nextKey;
      }

      const response = await this.get(
        "/cosmos/staking/v1beta1/validators",
        params
      );

      if (response.validators) {
        allValidators.push(...response.validators);
        pageCount++;
      }

      nextKey = response.pagination?.next_key;

      this.clientLogger.debug("Validators page fetched", {
        page: pageCount,
        validatorsInPage: response.validators?.length || 0,
        totalSoFar: allValidators.length,
        hasNextPage: !!nextKey,
      });
    } while (nextKey);

    this.clientLogger.info("All validators retrieved", {
      totalValidators: allValidators.length,
      pages: pageCount,
    });

    return allValidators;
  }

  /**
   * Get specific validator by address
   */
  async getValidator(validatorAddress) {
    this.clientLogger.debug("Fetching validator", {
      validator: validatorAddress,
    });

    const validator = await this.get(
      `/cosmos/staking/v1beta1/validators/${validatorAddress}`
    );

    return validator.validator;
  }

  /**
   * Get validator's outstanding rewards
   */
  async getValidatorOutstandingRewards(validatorAddress) {
    this.clientLogger.debug("Fetching validator outstanding rewards", {
      validator: validatorAddress,
    });

    const response = await this.get(
      `/cosmos/distribution/v1beta1/validators/${validatorAddress}/outstanding_rewards`
    );

    const rewards = response.rewards?.rewards || [];

    this.clientLogger.debug("Outstanding rewards retrieved", {
      validator: validatorAddress,
      rewardCount: rewards.length,
      totalAmount:
        rewards.find((r) => r.denom === this.tokenDenom)?.amount || "0",
    });

    return rewards;
  }

  /**
   * Get validator's commission
   */
  async getValidatorCommission(validatorAddress) {
    this.clientLogger.debug("Fetching validator commission", {
      validator: validatorAddress,
    });

    const response = await this.get(
      `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`
    );

    const commission = response.commission?.commission || [];

    this.clientLogger.debug("Commission retrieved", {
      validator: validatorAddress,
      commissionCount: commission.length,
      totalAmount:
        commission.find((c) => c.denom === this.tokenDenom)?.amount || "0",
    });

    return commission;
  }

  /**
   * Get validator's distribution info (commission rate, etc.)
   */
  async getValidatorDistributionInfo(validatorAddress) {
    this.clientLogger.debug("Fetching validator distribution info", {
      validator: validatorAddress,
    });

    const response = await this.get(
      `/cosmos/distribution/v1beta1/validators/${validatorAddress}`
    );

    return response.val_info;
  }

  /**
   * Get distribution parameters
   */
  async getDistributionParams() {
    this.clientLogger.info("Fetching distribution parameters");

    const response = await this.get("/cosmos/distribution/v1beta1/params");

    const params = response.params;
    this.clientLogger.info("Distribution parameters retrieved", {
      communityTax: params?.community_tax,
      baseProposerReward: params?.base_proposer_reward,
      bonusProposerReward: params?.bonus_proposer_reward,
      withdrawAddrEnabled: params?.withdraw_addr_enabled,
    });

    return params;
  }

  /**
   * Health check - verify the client can connect to the chain
   */
  async healthCheck() {
    this.clientLogger.info("Performing health check");

    try {
      const startTime = Date.now();
      const chainInfo = await this.getChainInfo();
      const duration = Date.now() - startTime;

      const isHealthy = chainInfo.chainId === this.chainId;

      this.clientLogger.info("Health check completed", {
        healthy: isHealthy,
        duration: `${duration}ms`,
        chainId: chainInfo.chainId,
        expectedChainId: this.chainId,
      });

      if (!isHealthy) {
        throw new APIError(
          `Chain ID mismatch: expected ${this.chainId}, got ${chainInfo.chainId}`,
          { chainInfo }
        );
      }

      return {
        healthy: true,
        chainInfo,
        duration,
      };
    } catch (error) {
      this.clientLogger.error("Health check failed", {
        error: error.message,
        baseURL: this.baseURL,
      });

      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch fetch multiple validators' data
   */
  async batchGetValidators(validatorAddresses) {
    this.clientLogger.info("Batch fetching validators", {
      count: validatorAddresses.length,
    });

    const results = await Promise.allSettled(
      validatorAddresses.map(async (address) => {
        const [validator, outstandingRewards, commission] = await Promise.all([
          this.getValidator(address),
          this.getValidatorOutstandingRewards(address),
          this.getValidatorCommission(address),
        ]);

        return {
          address,
          validator,
          outstandingRewards,
          commission,
        };
      })
    );

    const successful = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r, index) => ({
        address: validatorAddresses[index],
        error: r.reason.message,
      }));

    this.clientLogger.info("Batch fetch completed", {
      successful: successful.length,
      failed: failed.length,
      failedValidators: failed.map((f) => f.address),
    });

    if (failed.length > 0) {
      this.clientLogger.warn("Some validators failed to fetch", { failed });
    }

    return { successful, failed };
  }
}

module.exports = CosmosClient;
