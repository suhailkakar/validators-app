/**
 * Comprehensive error handling utilities for TAC Validator Burn Calculator
 */

/**
 * Custom error classes for different types of failures
 */
class TACCalculatorError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ConfigurationError extends TACCalculatorError {
  constructor(message, details = {}) {
    super(message, "CONFIG_ERROR", details);
  }
}

class NetworkError extends TACCalculatorError {
  constructor(message, details = {}) {
    super(message, "NETWORK_ERROR", details);
  }
}

class ValidationError extends TACCalculatorError {
  constructor(message, details = {}) {
    super(message, "VALIDATION_ERROR", details);
  }
}

class CalculationError extends TACCalculatorError {
  constructor(message, details = {}) {
    super(message, "CALCULATION_ERROR", details);
  }
}

class APIError extends TACCalculatorError {
  constructor(message, details = {}) {
    super(message, "API_ERROR", details);
  }
}

/**
 * Error handler with retry logic
 */
class RetryHandler {
  constructor(maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2) {
    this.maxAttempts = maxAttempts;
    this.delayMs = delayMs;
    this.backoffMultiplier = backoffMultiplier;
  }

  async executeWithRetry(operation, context = "") {
    let lastError;
    let currentDelay = this.delayMs;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          console.log(`Operation succeeded on attempt ${attempt}:`, context);
        }
        return result;
      } catch (error) {
        lastError = error;

        if (attempt === this.maxAttempts) {
          break;
        }

        // Don't retry certain types of errors
        if (this.isNonRetryableError(error)) {
          break;
        }

        console.log(
          `Attempt ${attempt} failed for ${context}, retrying in ${currentDelay}ms:`,
          error.message
        );

        await this.sleep(currentDelay);
        currentDelay *= this.backoffMultiplier;
      }
    }

    throw new NetworkError(
      `Operation failed after ${this.maxAttempts} attempts: ${context}`,
      {
        originalError: lastError.message,
        attempts: this.maxAttempts,
        context,
      }
    );
  }

  isNonRetryableError(error) {
    // Don't retry validation errors, configuration errors, etc.
    return (
      error instanceof ValidationError ||
      error instanceof ConfigurationError ||
      (error.response &&
        error.response.status >= 400 &&
        error.response.status < 500)
    );
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Graceful error handling for async operations
 */
async function handleAsyncOperation(operation, context, logger) {
  try {
    return await operation();
  } catch (error) {
    const enhancedError = enhanceError(error, context);
    logger.error("Async operation failed", {
      context,
      error: enhancedError.message,
      code: enhancedError.code,
      details: enhancedError.details,
      stack: enhancedError.stack,
    });
    throw enhancedError;
  }
}

/**
 * Enhance errors with additional context
 */
function enhanceError(error, context) {
  if (error instanceof TACCalculatorError) {
    return error;
  }

  // Convert common errors to our custom types
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    return new NetworkError(`Network connection failed: ${error.message}`, {
      context,
      originalCode: error.code,
    });
  }

  if (
    error.name === "ValidationError" ||
    error.message.includes("validation")
  ) {
    return new ValidationError(error.message, { context });
  }

  if (error.response) {
    return new APIError(
      `API request failed: ${error.response.status} ${error.response.statusText}`,
      {
        context,
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.response.config?.url,
      }
    );
  }

  // Generic error wrapper
  return new TACCalculatorError(error.message, "UNKNOWN_ERROR", {
    context,
    originalName: error.name,
  });
}

/**
 * Process exit handler for graceful shutdown
 */
function setupGracefulShutdown(logger) {
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });
    process.exit(1);
  });
}

module.exports = {
  // Error classes
  TACCalculatorError,
  ConfigurationError,
  NetworkError,
  ValidationError,
  CalculationError,
  APIError,

  // Utilities
  RetryHandler,
  handleAsyncOperation,
  enhanceError,
  setupGracefulShutdown,
};
