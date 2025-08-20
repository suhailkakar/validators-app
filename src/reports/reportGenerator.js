/**
 * Report Generator for TAC Validator Burn Calculator
 * Generates reports in multiple formats (JSON, CSV, Human-readable)
 */

const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");
const { handleAsyncOperation } = require("../utils/errorHandler");

class ReportGenerator {
  constructor() {
    this.reportLogger = logger.withContext("report-generator");
    this.outputDir = "reports";
  }

  /**
   * Generate all report formats
   * @param {Object} burnReport - Complete burn report data
   * @param {string} [customFilename] - Custom filename prefix
   * @returns {Object} Generated report files info
   */
  async generateAllReports(burnReport, customFilename) {
    return handleAsyncOperation(
      async () => {
        // Ensure output directory exists
        await this.ensureOutputDirectory();

        const baseFilename =
          customFilename || this.generateFilename(burnReport);

        this.reportLogger.info("Generating all report formats", {
          period: burnReport.period.period,
          baseFilename,
          totalValidators: burnReport.summary.totalValidators,
          totalBurnAmount: burnReport.summary.totalBurnAmountTac,
        });

        const files = await Promise.all([
          this.generateJSONReport(burnReport, baseFilename),
          this.generateCSVReport(burnReport, baseFilename),
          this.generateHumanReadableReport(burnReport, baseFilename),
          this.generateOperationalSummary(burnReport, baseFilename),
        ]);

        const reportFiles = {
          json: files[0],
          csv: files[1],
          humanReadable: files[2],
          operationalSummary: files[3],
          generatedAt: new Date().toISOString(),
          baseFilename,
        };

        this.reportLogger.info("All reports generated successfully", {
          files: Object.keys(reportFiles).filter(
            (k) => k !== "generatedAt" && k !== "baseFilename"
          ),
          outputDir: this.outputDir,
        });

        return reportFiles;
      },
      "generate_all_reports",
      this.reportLogger
    );
  }

  /**
   * Generate JSON report
   * @param {Object} burnReport - Burn report data
   * @param {string} baseFilename - Base filename
   * @returns {string} Generated file path
   */
  async generateJSONReport(burnReport, baseFilename) {
    const filename = `${baseFilename}.json`;
    const filepath = path.join(this.outputDir, filename);

    const jsonContent = JSON.stringify(burnReport, null, 2);
    await fs.writeFile(filepath, jsonContent, "utf8");

    this.reportLogger.debug("JSON report generated", { filepath });
    return filepath;
  }

  /**
   * Generate CSV report
   * @param {Object} burnReport - Burn report data
   * @param {string} baseFilename - Base filename
   * @returns {string} Generated file path
   */
  async generateCSVReport(burnReport, baseFilename) {
    const filename = `${baseFilename}.csv`;
    const filepath = path.join(this.outputDir, filename);

    const csvContent = this.buildCSVContent(burnReport);
    await fs.writeFile(filepath, csvContent, "utf8");

    this.reportLogger.debug("CSV report generated", { filepath });
    return filepath;
  }

  /**
   * Generate human-readable report
   * @param {Object} burnReport - Burn report data
   * @param {string} baseFilename - Base filename
   * @returns {string} Generated file path
   */
  async generateHumanReadableReport(burnReport, baseFilename) {
    const filename = `${baseFilename}_report.txt`;
    const filepath = path.join(this.outputDir, filename);

    const content = this.buildHumanReadableContent(burnReport);
    await fs.writeFile(filepath, content, "utf8");

    this.reportLogger.debug("Human-readable report generated", { filepath });
    return filepath;
  }

  /**
   * Generate operational summary for TAC Operations team
   * @param {Object} burnReport - Burn report data
   * @param {string} baseFilename - Base filename
   * @returns {string} Generated file path
   */
  async generateOperationalSummary(burnReport, baseFilename) {
    const filename = `${baseFilename}_ops_summary.md`;
    const filepath = path.join(this.outputDir, filename);

    const content = this.buildOperationalSummary(burnReport);
    await fs.writeFile(filepath, content, "utf8");

    this.reportLogger.debug("Operational summary generated", { filepath });
    return filepath;
  }

  /**
   * Build CSV content
   * @param {Object} burnReport - Burn report data
   * @returns {string} CSV content
   */
  buildCSVContent(burnReport) {
    const headers = [
      "Address",
      "Moniker",
      "Status",
      "Commission Rate",
      "Expected Commission Rate",
      "Has Commission Issues",
      "Outstanding Rewards (TAC)",
      "Commission (TAC)",
      "Total Rewards (TAC)",
      "Burn Amount (TAC)",
      "Validator Keeps (TAC)",
      "Should Burn",
      "Has Rewards",
    ];

    const rows = [headers.join(",")];

    for (const validator of burnReport.validators) {
      if (validator.hasError) {
        rows.push(
          [
            validator.address,
            `"${validator.moniker}"`,
            "ERROR",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            `"${validator.error}"`,
          ].join(",")
        );
        continue;
      }

      rows.push(
        [
          validator.address,
          `"${validator.moniker}"`,
          validator.status,
          (validator.currentCommissionRate * 100).toFixed(1) + "%",
          (validator.expectedCommissionRate * 100).toFixed(1) + "%",
          validator.hasCommissionIssues ? "YES" : "NO",
          validator.outstandingRewardsTac,
          validator.commissionTac,
          validator.totalRewardsTac,
          validator.burnAmountTac,
          validator.validatorKeepsTac,
          validator.shouldBurn ? "YES" : "NO",
          validator.hasRewards ? "YES" : "NO",
        ].join(",")
      );
    }

    return rows.join("\n");
  }

  /**
   * Build human-readable content
   * @param {Object} burnReport - Burn report data
   * @returns {string} Human-readable content
   */
  buildHumanReadableContent(burnReport) {
    const lines = [];

    lines.push("=".repeat(80));
    lines.push("TAC RESTRICTED VALIDATOR MONTHLY BURN REPORT");
    lines.push("=".repeat(80));
    lines.push("");

    // Report info
    lines.push(
      `Report Generated: ${new Date(burnReport.generatedAt).toLocaleString()}`
    );
    lines.push(
      `Period: ${burnReport.period.displayName} (${burnReport.period.period})`
    );
    lines.push(`Period Status: ${burnReport.period.status.toUpperCase()}`);
    lines.push(`Chain ID: ${burnReport.configuration.chainId}`);
    lines.push("");

    // Summary
    lines.push("SUMMARY");
    lines.push("-".repeat(40));
    lines.push(`Total Validators: ${burnReport.summary.totalValidators}`);
    lines.push(
      `Validators with Rewards: ${burnReport.summary.validatorsWithRewards}`
    );
    lines.push(
      `Validators Ready to Burn: ${burnReport.summary.validatorsReadyToBurn}`
    );
    lines.push("");
    lines.push(`Total Rewards: ${burnReport.summary.totalRewardsTac} TAC`);
    lines.push(
      `Total Burn Amount: ${burnReport.summary.totalBurnAmountTac} TAC`
    );
    lines.push(
      `Total Validator Keeps: ${burnReport.summary.totalValidatorKeepsTac} TAC`
    );
    lines.push("");

    // Alerts
    if (burnReport.alerts.length > 0) {
      lines.push("ALERTS");
      lines.push("-".repeat(40));
      for (const alert of burnReport.alerts) {
        lines.push(`[${alert.type.toUpperCase()}] ${alert.message}`);
        if (alert.details) {
          lines.push(`  Details: ${alert.details}`);
        }
        if (alert.action) {
          lines.push(`  Action: ${alert.action}`);
        }
        lines.push("");
      }
    }

    // Individual validator details
    lines.push("VALIDATOR DETAILS");
    lines.push("-".repeat(80));

    for (const validator of burnReport.validators) {
      if (validator.hasError) {
        lines.push(`${validator.moniker} (${validator.address})`);
        lines.push(`  ERROR: ${validator.error}`);
        lines.push("");
        continue;
      }

      lines.push(`${validator.moniker} (${validator.address})`);
      lines.push(`  Status: ${validator.status}`);
      lines.push(
        `  Commission Rate: ${(validator.currentCommissionRate * 100).toFixed(
          1
        )}% (Expected: ${(validator.expectedCommissionRate * 100).toFixed(1)}%)`
      );

      if (validator.hasCommissionIssues) {
        lines.push(
          `  ⚠️  COMMISSION RATE ISSUE: Needs to be updated to ${(
            validator.expectedCommissionRate * 100
          ).toFixed(1)}%`
        );
      }

      lines.push(
        `  Outstanding Rewards: ${validator.outstandingRewardsTac} TAC`
      );
      lines.push(`  Commission: ${validator.commissionTac} TAC`);
      lines.push(`  Total Rewards: ${validator.totalRewardsTac} TAC`);
      lines.push(`  Burn Amount: ${validator.burnAmountTac} TAC`);
      lines.push(`  Validator Keeps: ${validator.validatorKeepsTac} TAC`);
      lines.push(`  Should Burn: ${validator.shouldBurn ? "YES" : "NO"}`);
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Build operational summary for TAC Operations team
   * @param {Object} burnReport - Burn report data
   * @returns {string} Markdown operational summary
   */
  buildOperationalSummary(burnReport) {
    const lines = [];

    lines.push("# TAC Restricted Validator Burn Report");
    lines.push("");
    lines.push(
      `**Period:** ${burnReport.period.displayName} (${burnReport.period.period})`
    );
    lines.push(
      `**Generated:** ${new Date(burnReport.generatedAt).toLocaleString()}`
    );
    lines.push(`**Status:** ${burnReport.period.status.toUpperCase()}`);
    lines.push("");

    // Executive Summary
    lines.push("## Executive Summary");
    lines.push("");
    lines.push(
      `- **Total Burn Amount:** ${burnReport.summary.totalBurnAmountTac} TAC`
    );
    lines.push(
      `- **Validators Ready:** ${burnReport.summary.validatorsReadyToBurn} of ${burnReport.summary.totalValidators}`
    );
    lines.push(
      `- **Burn Address:** \`${burnReport.configuration.burnAddress}\``
    );
    lines.push("");

    // Critical Issues
    const criticalAlerts = burnReport.alerts.filter(
      (a) => a.type === "critical"
    );
    if (criticalAlerts.length > 0) {
      lines.push("## 🚨 Critical Issues");
      lines.push("");
      for (const alert of criticalAlerts) {
        lines.push(`### ${alert.message}`);
        lines.push("");
        lines.push(alert.details);
        lines.push("");
        if (alert.action) {
          lines.push(`**Action Required:** ${alert.action}`);
          lines.push("");
        }
        if (alert.affectedValidators) {
          lines.push("**Affected Validators:**");
          for (const v of alert.affectedValidators) {
            lines.push(`- ${v.moniker}: ${v.currentRate} (should be 90%)`);
          }
          lines.push("");
        }
      }
    }

    // Burn Instructions
    lines.push("## Burn Instructions");
    lines.push("");
    lines.push(
      "Once commission rates are corrected, validators should transfer the following amounts:"
    );
    lines.push("");
    lines.push("| Validator | Moniker | Burn Amount | Status |");
    lines.push("|-----------|---------|-------------|--------|");

    for (const validator of burnReport.validators) {
      if (validator.hasError || !validator.shouldBurn) continue;

      const status = validator.hasCommissionIssues
        ? "⚠️ Commission Issue"
        : "✅ Ready";
      lines.push(
        `| \`${validator.address}\` | ${validator.moniker} | ${validator.burnAmountTac} TAC | ${status} |`
      );
    }
    lines.push("");

    // Technical Details
    lines.push("## Technical Details");
    lines.push("");
    lines.push(`- **Chain ID:** ${burnReport.configuration.chainId}`);
    lines.push(`- **Token Denom:** ${burnReport.configuration.tokenDenom}`);
    lines.push(
      `- **Burn Rate:** ${(burnReport.configuration.burnRate * 100).toFixed(
        0
      )}%`
    );
    lines.push(
      `- **Expected Commission:** ${(
        burnReport.configuration.expectedCommissionRate * 100
      ).toFixed(0)}%`
    );
    lines.push("");

    // Next Steps
    lines.push("## Next Steps");
    lines.push("");
    lines.push(
      "1. **Fix Commission Rates:** Update all validator commission rates to 90%"
    );
    lines.push(
      "2. **Verify Calculations:** Re-run calculator after commission updates"
    );
    lines.push("3. **Execute Burns:** Send burn instructions to validators");
    lines.push(
      "4. **Verify Transfers:** Confirm tokens arrive at burn address"
    );
    lines.push("");

    return lines.join("\n");
  }

  /**
   * Generate filename based on report data
   * @param {Object} burnReport - Burn report data
   * @returns {string} Generated filename
   */
  generateFilename(burnReport) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    return `tac_burn_report_${burnReport.period.period}_${timestamp}`;
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      this.reportLogger.info("Created output directory", {
        dir: this.outputDir,
      });
    }
  }
}

module.exports = ReportGenerator;
