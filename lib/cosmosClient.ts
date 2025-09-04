/**
 * Cosmos SDK REST API client for TAC blockchain
 * Handles all interactions with the TAC chain's REST endpoints
 */

import { config } from "./config";
import { addUtacAmounts } from "./tokenConverter";

export interface ChainInfo {
  chainId: string;
  nodeVersion?: string;
  bondDenom: string;
  maxValidators: number;
  unbondingTime?: string;
}

export interface ValidatorInfo {
  operator_address: string;
  consensus_pubkey: any;
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
      max_rate: string;
      max_change_rate: string;
    };
    update_time: string;
  };
  min_self_delegation: string;
}

export interface RewardAmount {
  denom: string;
  amount: string;
}

export interface StakingPool {
  bonded_tokens: string;
  not_bonded_tokens: string;
}

export class CosmosClient {
  private baseURL: string;
  private chainId: string;
  private tokenDenom: string;

  constructor() {
    this.baseURL = config.chain.restEndpoint;
    this.chainId = config.chain.chainId;
    this.tokenDenom = config.chain.tokenDenom;
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(`Cosmos API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get basic chain information
   */
  async getChainInfo(): Promise<ChainInfo> {
    const [nodeInfo, stakingParams] = await Promise.all([
      this.request<any>("/cosmos/base/tendermint/v1beta1/node_info"),
      this.request<any>("/cosmos/staking/v1beta1/params"),
    ]);

    return {
      chainId: nodeInfo.default_node_info?.network || this.chainId,
      nodeVersion: nodeInfo.default_node_info?.version,
      bondDenom: stakingParams.params?.bond_denom || this.tokenDenom,
      maxValidators: parseInt(stakingParams.params?.max_validators || "0"),
      unbondingTime: stakingParams.params?.unbonding_time,
    };
  }

  /**
   * Get the latest block information
   */
  async getLatestBlock(): Promise<any> {
    return this.request<any>("/cosmos/base/tendermint/v1beta1/blocks/latest");
  }

  /**
   * Get specific validator by address
   */
  async getValidator(validatorAddress: string): Promise<ValidatorInfo> {
    const response = await this.request<{ validator: ValidatorInfo }>(
      `/cosmos/staking/v1beta1/validators/${validatorAddress}`
    );

    return response.validator;
  }

  /**
   * Get staking pool totals (bonded and not bonded)
   */
  async getStakingPool(): Promise<StakingPool> {
    const response = await this.request<{ pool: StakingPool }>(
      "/cosmos/staking/v1beta1/pool"
    );

    return response.pool;
  }

  /**
   * Get all withdraw_validator_commission transactions for a validator since genesis
   */
  async getValidatorCommissionWithdrawals(
    validatorAddress: string
  ): Promise<string> {
    try {
      // Get all withdraw_validator_commission txs for this validator
      const response = await this.request<{
        tx_responses: Array<{
          tx: any;
          tx_response: {
            events: Array<{
              type: string;
              attributes: Array<{ key: string; value: string }>;
            }>;
          };
        }>;
        pagination: { next_key: string | null };
      }>(
        `/cosmos/tx/v1beta1/txs?events=message.action='withdraw_validator_commission'&events=validator='${validatorAddress}'&pagination.limit=1000`
      );

      let totalClaimedUtac = "0";

      // Process all pages
      let currentResponse = response;
      while (currentResponse.tx_responses) {
        for (const tx of currentResponse.tx_responses) {
          // Find transfer events with utac denom
          for (const event of tx.tx_response.events) {
            if (event.type === "transfer") {
              for (let i = 0; i < event.attributes.length; i++) {
                if (
                  event.attributes[i].key === "denom" &&
                  event.attributes[i].value === "utac"
                ) {
                  // Next attribute should be amount
                  if (
                    i + 1 < event.attributes.length &&
                    event.attributes[i + 1].key === "amount"
                  ) {
                    totalClaimedUtac = addUtacAmounts(
                      totalClaimedUtac,
                      event.attributes[i + 1].value
                    );
                  }
                }
              }
            }
          }
        }

        // Check if there are more pages
        if (currentResponse.pagination.next_key) {
          currentResponse = await this.request(
            `/cosmos/tx/v1beta1/txs?events=message.action='withdraw_validator_commission'&events=validator='${validatorAddress}'&pagination.limit=1000&pagination.key=${currentResponse.pagination.next_key}`
          );
        } else {
          break;
        }
      }

      return totalClaimedUtac;
    } catch (error) {
      console.error(
        `Failed to get commission withdrawals for ${validatorAddress}:`,
        error
      );
      return "0";
    }
  }

  /**
   * Get validator's outstanding rewards
   */
  async getValidatorOutstandingRewards(
    validatorAddress: string
  ): Promise<RewardAmount[]> {
    const response = await this.request<{
      rewards: { rewards: RewardAmount[] };
    }>(
      `/cosmos/distribution/v1beta1/validators/${validatorAddress}/outstanding_rewards`
    );

    return response.rewards?.rewards || [];
  }

  /**
   * Get validator's commission
   */
  async getValidatorCommission(
    validatorAddress: string
  ): Promise<RewardAmount[]> {
    const response = await this.request<{
      commission: { commission: RewardAmount[] };
    }>(
      `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`
    );

    return response.commission?.commission || [];
  }

  /**
   * Batch fetch multiple validators' data
   */
  async batchGetValidators(validatorAddresses: string[]) {
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
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r, index) => ({
        address: validatorAddresses[index],
        error: (r as PromiseRejectedResult).reason.message,
      }));

    return { successful, failed };
  }

  /**
   * Health check - verify the client can connect to the chain
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      const chainInfo = await this.getChainInfo();
      const duration = Date.now() - startTime;

      const isHealthy = chainInfo.chainId === this.chainId;

      if (!isHealthy) {
        throw new Error(
          `Chain ID mismatch: expected ${this.chainId}, got ${chainInfo.chainId}`
        );
      }

      return {
        healthy: true,
        chainInfo,
        duration,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
