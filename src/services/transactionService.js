/**
 * Transaction Service for TAC Validator Burn Calculator
 * Handles querying historical transactions for claimed rewards
 */

const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config/config");
const {
  addUtacAmounts,
  cleanDecimalString,
} = require("../utils/tokenConverter");
const {
  RetryHandler,
  APIError,
  handleAsyncOperation,
} = require("../utils/errorHandler");

class TransactionService {
  constructor() {
    this.rpcEndpoint = config.chain.rpcEndpoint; // Tendermint RPC for tx search
    this.retryHandler = new RetryHandler(
      config.api.retryAttempts,
      config.api.retryDelay
    );
    this.serviceLogger = logger.withContext("transaction-service");

    // Create axios instance for Tendermint RPC
    this.rpcClient = axios.create({
      baseURL: this.rpcEndpoint,
      timeout: config.api.requestTimeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.serviceLogger.info("Transaction service initialized", {
      rpcEndpoint: this.rpcEndpoint,
    });
  }

  /**
   * Query validator commission withdrawals for a time period
   * @param {string} validatorAddress - Validator address
   * @param {Date} startDate - Start of period
   * @param {Date} endDate - End of period
   * @returns {Array} Array of withdrawal transactions
   */
  async getValidatorCommissionWithdrawals(
    validatorAddress,
    startDate,
    endDate
  ) {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.debug("Querying commission withdrawals", {
          validator: validatorAddress,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        // Query for WithdrawValidatorCommission events
        const query = `withdraw_commission.validator='${validatorAddress}' AND tx.height>=1 AND block_time>='${startDate.toISOString()}' AND block_time<='${endDate.toISOString()}'`;

        const withdrawals = await this.searchTransactions(query);

        // Parse withdrawal amounts from events
        const parsedWithdrawals = this.parseCommissionWithdrawals(
          withdrawals,
          validatorAddress
        );

        this.serviceLogger.debug("Commission withdrawals found", {
          validator: validatorAddress,
          count: parsedWithdrawals.length,
          totalAmount: parsedWithdrawals.reduce(
            (sum, w) => addUtacAmounts(sum, w.amount),
            "0"
          ),
        });

        return parsedWithdrawals;
      },
      `get_commission_withdrawals_${validatorAddress}`,
      this.serviceLogger
    );
  }

  /**
   * Get all-time commission withdrawals for a validator
   * @param {string} validatorAddress - Validator address
   * @returns {Array} Array of all withdrawal transactions
   */
  async getAllTimeCommissionWithdrawals(validatorAddress) {
    return handleAsyncOperation(
      async () => {
        this.serviceLogger.debug("Querying all-time commission withdrawals", {
          validator: validatorAddress,
        });

        // Query for all WithdrawValidatorCommission events (no time filter)
        const query = `withdraw_commission.validator='${validatorAddress}' AND tx.height>=1`;

        const withdrawals = await this.searchTransactions(query);

        // Parse withdrawal amounts from events
        const parsedWithdrawals = this.parseCommissionWithdrawals(
          withdrawals,
          validatorAddress
        );

        this.serviceLogger.info("All-time commission withdrawals found", {
          validator: validatorAddress,
          count: parsedWithdrawals.length,
          totalAmount: parsedWithdrawals.reduce(
            (sum, w) => addUtacAmounts(sum, w.amount),
            "0"
          ),
        });

        return parsedWithdrawals;
      },
      `get_all_time_withdrawals_${validatorAddress}`,
      this.serviceLogger
    );
  }

  /**
   * Search transactions using Tendermint RPC
   * @param {string} query - Transaction search query
   * @returns {Array} Array of transaction results
   */
  async searchTransactions(query) {
    return await this.retryHandler.executeWithRetry(async () => {
      const response = await this.rpcClient.get("/tx_search", {
        params: {
          query,
          prove: false,
          page: "1",
          per_page: "100", // Max results per page
          order_by: "desc", // Most recent first
        },
      });

      if (response.data.error) {
        throw new APIError(`RPC Error: ${response.data.error.message}`, {
          query,
          error: response.data.error,
        });
      }

      return response.data.result?.txs || [];
    }, `tx_search: ${query}`);
  }

  /**
   * Parse commission withdrawal amounts from transaction events
   * @param {Array} transactions - Array of transaction objects
   * @param {string} validatorAddress - Validator address to filter for
   * @returns {Array} Array of parsed withdrawal objects
   */
  parseCommissionWithdrawals(transactions, validatorAddress) {
    const withdrawals = [];

    for (const tx of transactions) {
      try {
        const txResult = tx.tx_result;
        if (!txResult || !txResult.events) continue;

        // Look for withdraw_commission events
        for (const event of txResult.events) {
          if (event.type === "withdraw_commission") {
            const withdrawal = this.parseWithdrawCommissionEvent(
              event,
              validatorAddress
            );
            if (withdrawal) {
              withdrawals.push({
                ...withdrawal,
                txHash: tx.hash,
                height: parseInt(tx.height),
                timestamp: tx.tx_result.log || new Date().toISOString(),
              });
            }
          }
        }
      } catch (error) {
        this.serviceLogger.warn("Failed to parse transaction", {
          txHash: tx.hash,
          error: error.message,
        });
      }
    }

    return withdrawals;
  }

  /**
   * Parse a single withdraw_commission event
   * @param {Object} event - Event object from transaction
   * @param {string} validatorAddress - Validator address
   * @returns {Object|null} Parsed withdrawal or null
   */
  parseWithdrawCommissionEvent(event, validatorAddress) {
    try {
      const attributes = {};

      // Convert attributes array to object
      for (const attr of event.attributes) {
        const key = Buffer.from(attr.key, "base64").toString();
        const value = Buffer.from(attr.value, "base64").toString();
        attributes[key] = value;
      }

      // Check if this event is for our validator
      if (attributes.validator !== validatorAddress) {
        return null;
      }

      // Extract amount (should be in format like "1000000utac")
      const amountStr = attributes.amount || "0";
      const match = amountStr.match(/^(\d+(?:\.\d+)?)utac$/);

      if (!match) {
        this.serviceLogger.warn("Could not parse commission amount", {
          validator: validatorAddress,
          amountStr,
        });
        return null;
      }

      const amount = cleanDecimalString(match[1]);

      return {
        validator: validatorAddress,
        amount,
        amountStr,
        recipient: attributes.recipient || validatorAddress,
      };
    } catch (error) {
      this.serviceLogger.warn("Failed to parse withdraw_commission event", {
        validator: validatorAddress,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Get total claimed commission for a validator
   * @param {string} validatorAddress - Validator address
   * @param {Date} [startDate] - Optional start date filter
   * @param {Date} [endDate] - Optional end date filter
   * @returns {string} Total claimed commission in utac
   */
  async getTotalClaimedCommission(validatorAddress, startDate, endDate) {
    const withdrawals =
      startDate && endDate
        ? await this.getValidatorCommissionWithdrawals(
            validatorAddress,
            startDate,
            endDate
          )
        : await this.getAllTimeCommissionWithdrawals(validatorAddress);

    const totalClaimed = withdrawals.reduce((sum, withdrawal) => {
      return addUtacAmounts(sum, withdrawal.amount);
    }, "0");

    this.serviceLogger.info("Total claimed commission calculated", {
      validator: validatorAddress,
      withdrawalCount: withdrawals.length,
      totalClaimed,
      period:
        startDate && endDate
          ? `${startDate.toISOString()} to ${endDate.toISOString()}`
          : "all-time",
    });

    return totalClaimed;
  }

  /**
   * Health check for transaction service
   */
  async healthCheck() {
    try {
      // Test basic RPC connectivity
      const response = await this.rpcClient.get("/status");

      if (response.data.error) {
        return {
          healthy: false,
          error: `RPC Error: ${response.data.error.message}`,
        };
      }

      return {
        healthy: true,
        rpcEndpoint: this.rpcEndpoint,
        chainId: response.data.result?.node_info?.network,
        latestHeight: response.data.result?.sync_info?.latest_block_height,
      };
    } catch (error) {
      this.serviceLogger.error("Transaction service health check failed", {
        error: error.message,
        rpcEndpoint: this.rpcEndpoint,
      });

      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = TransactionService;

