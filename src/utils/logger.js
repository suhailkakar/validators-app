const winston = require("winston");
const config = require("../config/config");

// Create logs directory if it doesn't exist (before Winston initialization)
const fs = require("fs");
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs", { recursive: true });
}

/**
 * Enhanced logging utility for the TAC Validator Burn Calculator
 * Provides structured logging with context and debugging capabilities
 */

// Custom format for development debugging
const debugFormat = winston.format.printf(
  ({ timestamp, level, message, service, context, ...meta }) => {
    let output = `${timestamp} [${level}]`;

    if (context) {
      output += ` [${context}]`;
    }

    output += `: ${message}`;

    // Add metadata if present (excluding service)
    const metaKeys = Object.keys(meta).filter((key) => key !== "service");
    if (metaKeys.length > 0) {
      const cleanMeta = {};
      metaKeys.forEach((key) => (cleanMeta[key] = meta[key]));
      output += ` ${JSON.stringify(cleanMeta, null, 2)}`;
    }

    return output;
  }
);

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.logging.format === "json" ? winston.format.json() : debugFormat
  ),
  defaultMeta: { service: "tac-burn-calculator" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        config.logging.format === "json" ? winston.format.json() : debugFormat
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Logs directory already created above

/**
 * Enhanced logger with context-aware methods
 */
const enhancedLogger = {
  ...logger,

  /**
   * Log with context information
   */
  withContext(context) {
    return {
      debug: (message, meta = {}) =>
        logger.debug(message, { context, ...meta }),
      info: (message, meta = {}) => logger.info(message, { context, ...meta }),
      warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
      error: (message, meta = {}) =>
        logger.error(message, { context, ...meta }),
    };
  },

  /**
   * Log API request/response
   */
  apiCall(method, url, duration, status, meta = {}) {
    const level = status >= 400 ? "error" : status >= 300 ? "warn" : "info";
    logger[level]("API Call", {
      context: "api",
      method,
      url,
      duration: `${duration}ms`,
      status,
      ...meta,
    });
  },

  /**
   * Log validator operation
   */
  validatorOp(validatorAddress, operation, meta = {}) {
    logger.info("Validator Operation", {
      context: "validator",
      validator: validatorAddress,
      operation,
      ...meta,
    });
  },

  /**
   * Log calculation results
   */
  calculation(type, input, output, meta = {}) {
    logger.info("Calculation", {
      context: "calculation",
      type,
      input,
      output,
      ...meta,
    });
  },

  /**
   * Log configuration changes
   */
  configChange(key, oldValue, newValue) {
    logger.info("Configuration Change", {
      context: "config",
      key,
      oldValue: oldValue ? "[REDACTED]" : null,
      newValue: newValue ? "[REDACTED]" : null,
    });
  },

  /**
   * Log performance metrics
   */
  performance(operation, duration, meta = {}) {
    const level = duration > 5000 ? "warn" : "debug";
    logger[level]("Performance", {
      context: "performance",
      operation,
      duration: `${duration}ms`,
      ...meta,
    });
  },
};

module.exports = enhancedLogger;
