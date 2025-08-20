# TAC Restricted Validator Monthly Burn Calculator

A Node.js application to calculate monthly burn amounts for restricted validators on the TAC blockchain.

## Overview

This calculator determines how much each restricted validator must burn monthly based on their staking rewards:
- **90% commission rate** for restricted validators
- **10%** of commission stays with validator
- **80%** of commission must be burned (sent to TAC Foundation)
- Includes both claimed and unclaimed rewards
- Covers total staking rewards (inflation + transaction fees)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional):**
   ```bash
   cp config.template.env .env
   # Edit .env with actual TAC chain details
   ```

3. **Run the calculator:**
   ```bash
   npm start
   ```

## Configuration

The application uses environment variables for configuration. Default values work for development, but production requires actual TAC chain details.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TAC_CHAIN_ID` | `tac_1559-1` | TAC blockchain chain ID |
| `TAC_RPC_ENDPOINT` | `https://rpc.cosmos.directory/tac` | Tendermint RPC endpoint |
| `TAC_REST_ENDPOINT` | `https://rest.cosmos.directory/tac` | Cosmos REST API endpoint |
| `TAC_TOKEN_DENOM` | `utac` | Native token denomination |
| `TAC_TOKEN_DECIMALS` | `6` | Token decimal places |
| `TAC_BURN_ADDRESS` | *(placeholder)* | **REQUIRED**: TAC Foundation burn address |
| `API_TIMEOUT` | `30000` | API request timeout (ms) |
| `API_RETRY_ATTEMPTS` | `3` | Number of retry attempts |
| `API_RETRY_DELAY` | `1000` | Delay between retries (ms) |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `LOG_FORMAT` | `json` | Log format (json, simple) |

### Restricted Validators

The following 9 restricted validators are configured:
- `tacvaloper1x9tnq2yyf7k5h5cxp2ld3gg9cxy73t5ut90nd2`
- `tacvaloper1xupg7j94nm8vsc5jvvl6fg6897kch5pqa9swz5`
- `tacvaloper1289fula6v075yev6fsp0f2va5wwln5xna4u7wy`
- `tacvaloper1tf36ga22azk7g8tee62cwarkzclv64cdajwz4w`
- `tacvaloper1d4u9zq2k0t8herufjdy0mm5zfzpkgn3t5ck5g6`
- `tacvaloper1nvcclfkfn083g9hx2x39rc7atn3qjdcg72an47`
- `tacvaloper1m8j3udjva70zy9dps0ycgf5c7c0svc3u4u8azl`
- `tacvaloper1ucaequwv2uf799an3c2pgs6ghyk80wq8360tvw`
- `tacvaloper1arnrsukysppc6kn3ts2ar8vgf8tj0nnkflqyw4`

## Project Structure

```
staking-script/
├── src/
│   ├── config/           # Configuration management
│   │   ├── config.js     # Main configuration
│   │   └── environment.js # Environment variable handling
│   ├── services/         # External API services
│   ├── calculators/      # Burn calculation logic
│   ├── utils/           # Utilities
│   │   ├── logger.js    # Logging system
│   │   └── configValidator.js # Configuration validation
│   └── reports/         # Report generation
├── tests/               # Test files
├── logs/               # Log files (auto-created)
├── config.template.env  # Environment template
├── package.json
└── index.js            # Application entry point
```

## Development Status

**Current Phase:** Project Setup and Configuration ✅
- [x] Project structure with proper dependencies
- [x] Configuration system with validation
- [x] Environment variable support
- [x] Logging framework
- [ ] Cosmos SDK REST client (next step)

## Next Steps

1. Implement Cosmos SDK REST client
2. Build validator information fetcher
3. Create reward calculation engine
4. Add report generation
5. Comprehensive testing

## Requirements

- Node.js 18+ 
- npm or yarn
- Access to TAC blockchain RPC/REST endpoints

---

**Note:** This is currently in development. The TAC burn address and exact chain endpoints need to be provided by the TAC Foundation for production use.
