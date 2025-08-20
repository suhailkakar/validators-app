/**
 * TAC Restricted Validator Monthly Burn Calculator
 * Entry point for the application
 */

// Disable detailed logging for clean console output
process.env.LOG_LEVEL = "error";

const logger = require("./src/utils/logger");
const config = require("./src/config/config");
const BurnCalculator = require("./src/calculators/burnCalculator");
const {
  setupGracefulShutdown,
  handleAsyncOperation,
} = require("./src/utils/errorHandler");

async function main() {
  // Setup graceful shutdown handlers
  setupGracefulShutdown(logger);

  await handleAsyncOperation(
    async () => {
      const calculator = new BurnCalculator();
      const report = await calculator.calculateMonthlyBurns("2025-08");

      // Clear console output for clean display
      console.clear();

      console.log("🔥 TAC RESTRICTED VALIDATOR BURN CALCULATOR");
      console.log("=".repeat(80));
      console.log(
        "⚠️  ALL-TIME COMMISSION BURN CALCULATION (CLAIMED + UNCLAIMED)"
      );
      console.log(`Calculated as of: ${new Date().toLocaleString()}`);
      console.log(
        `Burn Base: Total Commission (80% burn, 20% validator keeps)`
      );
      console.log(`Strict Mode: Commission rate must be exactly 90%`);
      console.log("");

      // Summary
      console.log("📊 SUMMARY");
      console.log("-".repeat(50));
      console.log(`Total Validators: ${report.summary.totalValidators}`);
      console.log(
        `Active Validators: ${
          report.validators.filter((v) => v.isActive).length
        }`
      );
      console.log(
        `Total Burn Amount: ${report.summary.totalBurnAmountTac} TAC`
      );
      console.log(
        `Total Validator Keeps: ${report.summary.totalValidatorKeepsTac} TAC`
      );
      console.log(
        `Commission Issues: ${report.summary.validatorsWithCommissionIssues}`
      );
      console.log("");

      // Top 3 validators
      const sortedValidators = report.validators
        .filter((v) => !v.hasError && v.shouldBurn)
        .sort((a, b) => {
          const aBurn = parseFloat(a.burnAmountTac.replace(/,/g, ""));
          const bBurn = parseFloat(b.burnAmountTac.replace(/,/g, ""));
          return bBurn - aBurn;
        });

      console.log("🏆 TOP BURN AMOUNTS");
      console.log("-".repeat(50));
      for (let i = 0; i < Math.min(5, sortedValidators.length); i++) {
        const validator = sortedValidators[i];
        const medal =
          i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
        console.log(
          `${medal} ${validator.moniker}: ${validator.burnAmountTac} TAC`
        );
      }
      console.log("");

      // Bottom summary
      console.log("=".repeat(80));
      console.log(
        `🔥 TOTAL COMMISSION BURN: ${report.summary.totalBurnAmountTac} TAC`
      );
      console.log(`📍 Burn Address: ${config.burnAddress}`);
      console.log("");
      console.log(
        "⚠️  IMPORTANT: Burn calculated from ALL-TIME TOTAL COMMISSION (claimed + unclaimed)"
      );
      console.log(
        "   Outstanding delegator rewards are NOT included in burn calculation"
      );
      console.log(
        "   Includes both withdrawn commission and current unclaimed commission"
      );
      console.log("");

      if (report.summary.validatorsWithCommissionIssues === 0) {
        console.log("✅ ALL COMMISSION RATES CORRECT (90%)");
        console.log("✅ SYSTEM READY FOR PRODUCTION");
      } else {
        console.log(
          `⚠️  ${report.summary.validatorsWithCommissionIssues} validators need commission updates first`
        );
      }
      console.log("=".repeat(80));
    },
    "burn_calculation",
    logger
  );
}

if (require.main === module) {
  main();
}

module.exports = { main };
