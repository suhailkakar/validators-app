/**
 * Express API Server for TAC Validator Burn Calculator
 * Provides REST endpoints for burn calculation data
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const BurnCalculator = require("./src/calculators/burnCalculator");
const TimePeriodCalculator = require("./src/calculators/timePeriodCalculator");
const config = require("./src/config/config");

// Disable verbose logging for API
process.env.LOG_LEVEL = "error";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Initialize services
const burnCalculator = new BurnCalculator();
const timePeriodCalculator = new TimePeriodCalculator();

// Cache for expensive calculations (5 minute cache)
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
};

function isCacheValid() {
  return (
    cache.data && cache.timestamp && Date.now() - cache.timestamp < cache.ttl
  );
}

// Routes

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", async (req, res) => {
  try {
    const health = await burnCalculator.healthCheck();

    res.json({
      status: health.healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        burnCalculator: health.healthy,
        chainConnection:
          health.validatorService?.cosmosClient?.healthy || false,
      },
      chainId: config.chain.chainId,
      validatorCount: config.restrictedValidators.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/burn-report
 * Get current burn calculation report
 */
app.get("/api/burn-report", async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid()) {
      return res.json({
        ...cache.data,
        cached: true,
        cacheAge: Math.round((Date.now() - cache.timestamp) / 1000),
      });
    }

    // Calculate fresh data
    const period = req.query.period || "2025-08";
    const report = await burnCalculator.calculateMonthlyBurns(period);

    // Update cache
    cache.data = report;
    cache.timestamp = Date.now();

    res.json({
      ...report,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    res.status(500).json({
      error: "Calculation failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/burn-summary
 * Get simplified burn summary for dashboards
 */
app.get("/api/burn-summary", async (req, res) => {
  try {
    // Use cache if available
    let report;
    if (isCacheValid()) {
      report = cache.data;
    } else {
      const period = req.query.period || "2025-08";
      report = await burnCalculator.calculateMonthlyBurns(period);
      cache.data = report;
      cache.timestamp = Date.now();
    }

    // Create simplified summary
    const summary = {
      timestamp: new Date().toISOString(),
      period: report.period.displayName,
      status: report.period.status,

      // Key metrics
      totalValidators: report.summary.totalValidators,
      activeValidators: report.validators.filter((v) => v.isActive).length,
      totalBurnAmount: report.summary.totalBurnAmountTac,
      totalBurnAmountRaw: report.summary.totalBurnAmountUtac,

      // Top 3 validators
      topValidators: report.validators
        .filter((v) => !v.hasError && v.shouldBurn)
        .sort((a, b) => {
          const aBurn = parseFloat(a.burnAmountTac.replace(/,/g, ""));
          const bBurn = parseFloat(b.burnAmountTac.replace(/,/g, ""));
          return bBurn - aBurn;
        })
        .slice(0, 3)
        .map((v) => ({
          moniker: v.moniker,
          burnAmount: v.burnAmountTac,
          address: v.address,
        })),

      // System status
      allCommissionRatesCorrect:
        report.summary.validatorsWithCommissionIssues === 0,
      readyForExecution: report.summary.validatorsWithCommissionIssues === 0,

      // Configuration
      burnAddress: config.burnAddress,
      chainId: config.chain.chainId,

      // Alerts count
      alerts: {
        total: report.alerts.length,
        critical: report.alerts.filter((a) => a.type === "critical").length,
        warnings: report.alerts.filter((a) => a.type === "warning").length,
      },
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      error: "Summary calculation failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/validators
 * Get individual validator details
 */
app.get("/api/validators", async (req, res) => {
  try {
    // Use cache if available
    let report;
    if (isCacheValid()) {
      report = cache.data;
    } else {
      const period = req.query.period || "2025-08";
      report = await burnCalculator.calculateMonthlyBurns(period);
      cache.data = report;
      cache.timestamp = Date.now();
    }

    // Format validator data for frontend
    const validators = report.validators.map((v) => ({
      address: v.address,
      moniker: v.moniker,
      status: v.status,
      isActive: v.isActive,

      // Commission info
      commissionRate: `${(v.currentCommissionRate * 100).toFixed(1)}%`,
      commissionRateRaw: v.currentCommissionRate,
      hasCommissionIssues: v.hasCommissionIssues,

      // Amounts (formatted for display)
      outstandingRewards: v.outstandingRewardsTac,
      unclaimedCommission: v.unclaimedCommissionTac,
      claimedCommission: v.claimedCommissionTac,
      totalCommission: v.totalCommissionTac,
      totalRewards: v.totalRewardsTac,
      burnAmount: v.burnAmountTac,
      validatorKeeps: v.validatorKeepsTac,

      // Raw amounts (for precision calculations)
      burnAmountRaw: v.burnAmountUtac,
      totalCommissionRaw: v.totalCommissionUtac,

      // Flags
      shouldBurn: v.shouldBurn,
      hasRewards: v.hasRewards,
      hasCommission: v.hasCommission,

      // Metadata
      calculatedAt: v.calculatedAt,
    }));

    res.json({
      validators,
      count: validators.length,
      timestamp: new Date().toISOString(),
      period: report.period.displayName,
    });
  } catch (error) {
    res.status(500).json({
      error: "Validator data fetch failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/clear-cache
 * Clear the calculation cache
 */
app.post("/api/clear-cache", (req, res) => {
  cache.data = null;
  cache.timestamp = null;

  res.json({
    message: "Cache cleared successfully",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/config
 * Get system configuration
 */
app.get("/api/config", (req, res) => {
  res.json({
    chainId: config.chain.chainId,
    tokenDenom: config.chain.tokenDenom,
    tokenDecimals: config.chain.tokenDecimals,
    burnAddress: config.burnAddress,
    burnRate: config.business.burnRate,
    expectedCommissionRate: config.business.validatorCommissionRate,
    restrictedValidatorCount: config.restrictedValidators.length,
    rpcEndpoint: config.chain.rpcEndpoint.includes("tac.build")
      ? "✅ Real TAC"
      : "⚠️ Placeholder",
  });
});

/**
 * GET /
 * API documentation
 */
app.get("/", (req, res) => {
  res.json({
    name: "TAC Validator Burn Calculator API",
    version: "1.0.0",
    description: "REST API for TAC restricted validator burn calculations",
    endpoints: {
      "GET /api/health": "Health check",
      "GET /api/burn-report": "Complete burn calculation report",
      "GET /api/burn-summary": "Simplified summary for dashboards",
      "GET /api/validators": "Individual validator details",
      "GET /api/config": "System configuration",
      "POST /api/clear-cache": "Clear calculation cache",
    },
    documentation: {
      burnCalculation: "Burns 80% of total commission (claimed + unclaimed)",
      commissionBase: "All-time accumulated commission only",
      strictMode: "Commission rate must be exactly 90%",
      caching: "Results cached for 5 minutes for performance",
    },
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("API Error:", error.message);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 TAC Burn Calculator API running on port ${PORT}`);
  console.log(`📊 Dashboard ready at: http://localhost:${PORT}`);
  console.log(`🔥 Burn report: http://localhost:${PORT}/api/burn-summary`);
  console.log(`👥 Validators: http://localhost:${PORT}/api/validators`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = app;
