/**
 * Token conversion utilities for TAC tokens
 * TAC has 18 decimals: 1 TAC = 1000000000000000000 utac
 */

const { Decimal } = require("@cosmjs/math");

/**
 * Clean decimal string to integer string for Decimal library
 * The Cosmos API returns decimal amounts but @cosmjs/math expects integers
 * @param {string} decimalString - String that might contain decimals
 * @returns {string} Integer string (floored)
 */
function cleanDecimalString(decimalString) {
  if (!decimalString || decimalString === "0" || decimalString === "")
    return "0";

  // Convert to string if it's not already
  const str = decimalString.toString();

  // Handle scientific notation by expanding to plain decimal string
  if (str.includes("e") || str.includes("E")) {
    try {
      // Parse the scientific notation manually to avoid precision loss
      const [mantissa, exponent] = str.toLowerCase().split("e");
      const exp = parseInt(exponent, 10);

      if (isNaN(exp)) return "0";

      // Handle positive exponent (multiply by 10^exp)
      if (exp >= 0) {
        const mantissaClean = mantissa.replace(".", "");
        const mantissaDecimals = mantissa.includes(".")
          ? mantissa.split(".")[1].length
          : 0;
        const zerosToAdd = exp - mantissaDecimals;

        if (zerosToAdd >= 0) {
          return mantissaClean + "0".repeat(zerosToAdd);
        } else {
          // Exponent is smaller than decimal places, need to truncate
          const truncateAt = mantissaClean.length + zerosToAdd;
          return truncateAt > 0 ? mantissaClean.substring(0, truncateAt) : "0";
        }
      } else {
        // Negative exponent (division) - results in fractional, floor to 0
        return "0";
      }
    } catch {
      return "0";
    }
  }

  // If it contains a decimal point, truncate it (floor operation)
  const dotIndex = str.indexOf(".");
  if (dotIndex !== -1) {
    const integerPart = str.substring(0, dotIndex);
    return integerPart || "0";
  }

  // Already an integer string
  return str;
}

/**
 * Convert TAC to utac (base units)
 * @param {string|number} tacAmount - Amount in TAC
 * @returns {string} Amount in utac (base units)
 */
function tacToUtac(tacAmount) {
  const decimal = Decimal.fromUserInput(tacAmount.toString(), 18);
  return decimal.atomics;
}

/**
 * Convert utac to TAC (human readable)
 * @param {string} utacAmount - Amount in utac (base units)
 * @returns {string} Amount in TAC with full precision
 */
function utacToTac(utacAmount) {
  const cleanAmount = cleanDecimalString(utacAmount);
  if (cleanAmount === "0") return "0";

  try {
    const bigIntAmount = BigInt(cleanAmount);
    const divisor = BigInt("1000000000000000000"); // 10^18

    const integerPart = bigIntAmount / divisor;
    const fractionalPart = bigIntAmount % divisor;

    // Pad fractional part to 18 digits
    const fractionalStr = fractionalPart.toString().padStart(18, "0");

    // Remove trailing zeros from fractional part for cleaner display
    const trimmedFractional = fractionalStr.replace(/0+$/, "");

    if (trimmedFractional === "") {
      return integerPart.toString();
    }

    return `${integerPart.toString()}.${trimmedFractional}`;
  } catch (error) {
    // Fallback for invalid inputs
    return "0";
  }
}

/**
 * Format TAC amount for display
 * @param {string} utacAmount - Amount in utac (base units)
 * @param {number} precision - Decimal places to show (default: 6)
 * @returns {string} Formatted TAC amount with proper precision
 */
function formatTacAmount(utacAmount, precision = 6) {
  const cleanAmount = cleanDecimalString(utacAmount);
  if (cleanAmount === "0") return "0";

  try {
    const bigIntAmount = BigInt(cleanAmount);
    const divisor = BigInt("1000000000000000000"); // 10^18

    const integerPart = bigIntAmount / divisor;
    const fractionalPart = bigIntAmount % divisor;

    // Pad fractional part to 18 digits
    const fractionalStr = fractionalPart.toString().padStart(18, "0");

    // Truncate to desired precision
    const truncatedFractional = fractionalStr.substring(0, precision);

    // Remove trailing zeros
    const trimmedFractional = truncatedFractional.replace(/0+$/, "");

    // Format integer part with commas
    const formattedInteger = integerPart
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (trimmedFractional === "") {
      return formattedInteger;
    }

    return `${formattedInteger}.${trimmedFractional}`;
  } catch (error) {
    return "0";
  }
}

/**
 * Calculate percentage of an amount using deterministic BigInt math
 * @param {string} utacAmount - Amount in utac (base units)
 * @param {number} percentage - Percentage as decimal (0.8 for 80%)
 * @returns {string} Calculated amount in utac (base units)
 */
function calculatePercentage(utacAmount, percentage) {
  const cleanAmount = cleanDecimalString(utacAmount);
  if (cleanAmount === "0") return "0";

  try {
    const bigIntAmount = BigInt(cleanAmount);

    // Use deterministic fraction for common percentages to avoid float artifacts
    let numerator, denominator;

    // Handle common burn/keep rates deterministically
    if (percentage === 0.8) {
      numerator = BigInt(4);
      denominator = BigInt(5);
    } else if (percentage === 0.2) {
      numerator = BigInt(1);
      denominator = BigInt(5);
    } else if (percentage === 0.9) {
      numerator = BigInt(9);
      denominator = BigInt(10);
    } else if (percentage === 0.1) {
      numerator = BigInt(1);
      denominator = BigInt(10);
    } else {
      // For other percentages, use scaled integer approach
      const scale = 1000000; // Scale to avoid float precision issues
      numerator = BigInt(Math.round(percentage * scale));
      denominator = BigInt(scale);
    }

    // Calculate: (amount * numerator) / denominator
    const result = (bigIntAmount * numerator) / denominator;

    return result.toString();
  } catch (error) {
    return "0";
  }
}

/**
 * Add two utac amounts
 * @param {string} amount1 - First amount in utac
 * @param {string} amount2 - Second amount in utac
 * @returns {string} Sum in utac
 */
function addUtacAmounts(amount1, amount2) {
  const cleanAmount1 = cleanDecimalString(amount1);
  const cleanAmount2 = cleanDecimalString(amount2);

  // Use BigInt for precise addition of large integers
  const sum = BigInt(cleanAmount1) + BigInt(cleanAmount2);
  return sum.toString();
}

/**
 * Validate that an amount is a valid utac amount
 * @param {string} utacAmount - Amount to validate
 * @returns {boolean} True if valid
 */
function isValidUtacAmount(utacAmount) {
  try {
    const cleanAmount = cleanDecimalString(utacAmount);
    const bigIntAmount = BigInt(cleanAmount);
    return bigIntAmount >= 0n;
  } catch {
    return false;
  }
}

/**
 * Convert burn percentage to actual burn amount with exact complement
 * @param {string} totalRewardsUtac - Total rewards in utac
 * @param {number} burnRate - Burn rate (0.8 for 80%)
 * @returns {object} { burnAmount: string, validatorKeeps: string }
 */
function calculateBurnAmount(totalRewardsUtac, burnRate = 0.8) {
  const cleanAmount = cleanDecimalString(totalRewardsUtac);
  if (cleanAmount === "0") {
    return {
      burnAmount: "0",
      validatorKeeps: "0",
      burnAmountTac: "0",
      validatorKeepsTac: "0",
      totalTac: "0",
    };
  }

  const burnAmount = calculatePercentage(totalRewardsUtac, burnRate);

  // Calculate keeps as exact complement to ensure burn + keeps = total exactly
  const validatorKeeps = (BigInt(cleanAmount) - BigInt(burnAmount)).toString();

  return {
    burnAmount,
    validatorKeeps,
    burnAmountTac: formatTacAmount(burnAmount),
    validatorKeepsTac: formatTacAmount(validatorKeeps),
    totalTac: formatTacAmount(totalRewardsUtac),
  };
}

module.exports = {
  tacToUtac,
  utacToTac,
  formatTacAmount,
  calculatePercentage,
  addUtacAmounts,
  isValidUtacAmount,
  calculateBurnAmount,
  cleanDecimalString, // Export for testing
};
