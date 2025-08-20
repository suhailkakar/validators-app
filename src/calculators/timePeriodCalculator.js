/**
 * Time Period Calculator for TAC Validator Burn Calculator
 * Handles monthly period filtering and date range calculations
 */

const logger = require("../utils/logger");
const { ValidationError } = require("../utils/errorHandler");

class TimePeriodCalculator {
  constructor() {
    this.calculatorLogger = logger.withContext("time-period-calculator");
  }

  /**
   * Create a monthly period from year and month
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (1-12)
   * @returns {Object} Period object with start/end dates
   */
  createMonthlyPeriod(year, month) {
    if (!year || !month || month < 1 || month > 12) {
      throw new ValidationError("Invalid year or month", {
        year,
        month,
      });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const period = {
      year,
      month,
      startDate,
      endDate,
      startISO: startDate.toISOString(),
      endISO: endDate.toISOString(),
      label: `${year}-${month.toString().padStart(2, "0")}`,
      displayName: `${this.getMonthName(month)} ${year}`,
      daysInMonth: endDate.getUTCDate(),
    };

    this.calculatorLogger.debug("Monthly period created", {
      period: period.label,
      displayName: period.displayName,
      startISO: period.startISO,
      endISO: period.endISO,
      daysInMonth: period.daysInMonth,
    });

    return period;
  }

  /**
   * Create a monthly period for the current month
   * @returns {Object} Period object for current month
   */
  createCurrentMonthPeriod() {
    const now = new Date();
    return this.createMonthlyPeriod(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1
    );
  }

  /**
   * Create a monthly period for the previous month
   * @returns {Object} Period object for previous month
   */
  createPreviousMonthPeriod() {
    const now = new Date();
    const m = now.getUTCMonth() - 1; // Get previous month (can be -1)
    const year = m < 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
    const month = m < 0 ? 12 : m + 1;

    return this.createMonthlyPeriod(year, month);
  }

  /**
   * Parse period from string (YYYY-MM format)
   * @param {string} periodString - Period in "YYYY-MM" format
   * @returns {Object} Period object
   */
  parsePeriodString(periodString) {
    if (!periodString || typeof periodString !== "string") {
      throw new ValidationError("Period string is required", {
        periodString,
      });
    }

    const match = periodString.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new ValidationError(
        "Invalid period format. Expected YYYY-MM (e.g., 2024-08)",
        { periodString }
      );
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    return this.createMonthlyPeriod(year, month);
  }

  /**
   * Check if a timestamp falls within a period
   * @param {string|Date} timestamp - ISO timestamp or Date object
   * @param {Object} period - Period object
   * @returns {boolean} True if timestamp is within period
   */
  isWithinPeriod(timestamp, period) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    if (isNaN(date.getTime())) {
      this.calculatorLogger.warn("Invalid timestamp provided", { timestamp });
      return false;
    }

    const isWithin = date >= period.startDate && date <= period.endDate;

    if (!isWithin) {
      this.calculatorLogger.debug("Timestamp outside period", {
        timestamp: date.toISOString(),
        period: period.label,
        periodStart: period.startISO,
        periodEnd: period.endISO,
      });
    }

    return isWithin;
  }

  /**
   * Get period progress (0-1, where 1 is complete)
   * @param {Object} period - Period object
   * @param {Date} [currentTime] - Current time (defaults to now)
   * @returns {number} Progress as decimal (0-1)
   */
  getPeriodProgress(period, currentTime = new Date()) {
    if (currentTime < period.startDate) {
      return 0; // Period hasn't started
    }

    if (currentTime > period.endDate) {
      return 1; // Period is complete
    }

    const totalDuration = period.endDate.getTime() - period.startDate.getTime();
    const elapsed = currentTime.getTime() - period.startDate.getTime();

    return Math.min(Math.max(elapsed / totalDuration, 0), 1);
  }

  /**
   * Check if a period is complete
   * @param {Object} period - Period object
   * @param {Date} [currentTime] - Current time (defaults to now)
   * @returns {boolean} True if period is complete
   */
  isPeriodComplete(period, currentTime = new Date()) {
    return currentTime > period.endDate;
  }

  /**
   * Get period status
   * @param {Object} period - Period object
   * @param {Date} [currentTime] - Current time (defaults to now)
   * @returns {Object} Status object with details
   */
  getPeriodStatus(period, currentTime = new Date()) {
    const progress = this.getPeriodProgress(period, currentTime);
    const isComplete = this.isPeriodComplete(period, currentTime);
    const hasStarted = currentTime >= period.startDate;

    let status;
    if (!hasStarted) {
      status = "future";
    } else if (isComplete) {
      status = "complete";
    } else {
      status = "active";
    }

    return {
      status,
      progress,
      isComplete,
      hasStarted,
      progressPercent: `${(progress * 100).toFixed(1)}%`,
      daysRemaining: isComplete
        ? 0
        : Math.max(
            0,
            Math.ceil(
              (period.endDate.getTime() - currentTime.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          ),
    };
  }

  /**
   * Generate period summary for reporting
   * @param {Object} period - Period object
   * @returns {Object} Summary object for reports
   */
  generatePeriodSummary(period) {
    const status = this.getPeriodStatus(period);

    return {
      period: period.label,
      displayName: period.displayName,
      year: period.year,
      month: period.month,
      startDate: period.startISO,
      endDate: period.endISO,
      daysInMonth: period.daysInMonth,
      status: status.status,
      progress: status.progressPercent,
      isComplete: status.isComplete,
      daysRemaining: status.daysRemaining,
      calculationTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Get month name from month number
   * @param {number} month - Month number (1-12)
   * @returns {string} Month name
   */
  getMonthName(month) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1] || "Unknown";
  }

  /**
   * Validate period for burn calculations
   * @param {Object} period - Period object
   * @returns {Object} Validation result
   */
  validatePeriodForCalculation(period) {
    const issues = [];
    const warnings = [];
    const status = this.getPeriodStatus(period);

    // Check if period is in the future
    if (status.status === "future") {
      issues.push("Cannot calculate burns for future periods");
    }

    // Warn if period is still active (incomplete)
    if (status.status === "active") {
      warnings.push("Period is still active - calculations may be incomplete");
    }

    // Check if period is too old (more than 1 year ago)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (period.endDate < oneYearAgo) {
      warnings.push("Period is more than 1 year old - data may be limited");
    }

    const isValid = issues.length === 0;

    this.calculatorLogger.info("Period validation completed", {
      period: period.label,
      isValid,
      issues: issues.length,
      warnings: warnings.length,
      status: status.status,
    });

    return {
      isValid,
      issues,
      warnings,
      status,
      canCalculate: isValid,
      shouldWarn: warnings.length > 0,
    };
  }
}

module.exports = TimePeriodCalculator;
