const COSMOS_API_URL = 'https://cosmos-api.rpc.tac.build';
const RPC_URL = 'https://rpc.tac.build';

// Restricted validators from requirements.txt
const RESTRICTED_VALIDATORS = [
  "tacvaloper14zdtx5j770q700e8xg2v6lm0g3m58mc0qvs0kp",
  "tacvaloper1e4xgzj8vasua0pd65t3jnr2nc2yccdqhlhmdvl",
  "tacvaloper1mcmgua3ewywj8m3y2a6tayfkt8w7m77tl3ruvf",
  "tacvaloper1vff4r0nc766n6x68ceatv4ffea2ltr8l04u8t6",
  "tacvaloper1w25sweez0ek6wyk0yg2vx3ttqgyn3tuwjkzfjr",
  "tacvaloper1tcjtpw8u7u6eu4hez8z2zfu6lssvt82v79egp5",
  "tacvaloper16937gs3thamqecrrnns3dt7sgzpymkyf5nfpe2",
  "tacvaloper1lh6xd8x9n9jspywcpf6npke9glh56pd5qreyfd",
  "tacvaloper1a4xlewuye9uvjyp4s4yklkvg3pkrua02ms047v"
];

export class CosmosClient {
  private cosmosApiUrl: string;
  private rpcUrl: string;

  constructor() {
    this.cosmosApiUrl = COSMOS_API_URL;
    this.rpcUrl = RPC_URL;
  }

  async getBlockHeight(): Promise<{ height: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.cosmosApiUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        height: data.block?.header?.height || '0',
        timestamp: data.block?.header?.time || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch block height:', error);
      throw error;
    }
  }

  // Method to get validator info from cosmos API
  async getValidator(validatorAddress: string) {
    try {
      const response = await fetch(
        `${this.cosmosApiUrl}/cosmos/staking/v1beta1/validators/${validatorAddress}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch validator: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch validator ${validatorAddress}:`, error);
      throw error;
    }
  }

  // Method to get validator commission (unclaimed rewards)
  async getValidatorCommission(validatorAddress: string) {
    try {
      const response = await fetch(
        `${this.cosmosApiUrl}/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commission for ${validatorAddress}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract TAC commission amount and convert from utac to TAC  
      const commission = data.commission?.commission?.find((c: any) => c.denom === 'utac');
      if (commission) {
        // Convert from utac to TAC (divide by 10^18) using BigInt for precision
        // utac uses 18 decimal places like most cosmos tokens
        const amountInUtac = commission.amount.split('.')[0]; // Remove decimal part
        const amountInTac = (BigInt(amountInUtac) / BigInt(10**18)).toString();
        return amountInTac;
      }
      
      return '0';
    } catch (error) {
      console.error(`Failed to fetch commission for ${validatorAddress}:`, error);
      return '0';
    }
  }

  // Method to get all validators
  async getValidators() {
    try {
      const response = await fetch(
        `${this.cosmosApiUrl}/cosmos/staking/v1beta1/validators?pagination.limit=200`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch validators: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter only restricted validators
      const restrictedValidators = data.validators.filter((validator: any) =>
        RESTRICTED_VALIDATORS.includes(validator.operator_address)
      );
      
      // Transform the data and fetch commission for each validator
      const transformedValidators = await Promise.all(
        restrictedValidators.map(async (validator: any) => {
          // Convert tokens from wei to TAC (divide by 10^18) using BigInt for precision
          const tokensInWei = validator.tokens || '0';
          const tokensInTac = (BigInt(tokensInWei) / BigInt(10**18)).toString();
          
          // Fetch unclaimed rewards (commission) for this validator
          const unclaimedRewards = await this.getValidatorCommission(validator.operator_address);
          
          // Calculate totals and burn amounts
          const claimedRewards = '0'; // Static for now
          const totalRewards = (BigInt(claimedRewards) + BigInt(unclaimedRewards)).toString();
          
          // Calculate burn amount: 88.888889% of total rewards (which equals 80% of original staking rewards)
          // Using 888889/1000000 to represent 88.888889%
          const totalRewardsToBeBurn = (BigInt(totalRewards) * BigInt(888889) / BigInt(1000000)).toString();
          
          return {
            address: validator.operator_address,
            moniker: validator.description?.moniker || 'Unknown',
            status: validator.status,
            isActive: validator.status === 'BOND_STATUS_BONDED',
            totalAccumulatedRewards: totalRewards,
            claimedRewards: claimedRewards,
            unclaimedRewards: unclaimedRewards,
            totalRewardsAlreadyBurnt: '0',
            totalRewardsToBeBurn: totalRewardsToBeBurn,
            totalAmountDelegated: tokensInTac
          };
        })
      );

      return {
        validators: transformedValidators
      };
    } catch (error) {
      console.error('Failed to fetch validators:', error);
      throw error;
    }
  }
}

export const cosmosClient = new CosmosClient();