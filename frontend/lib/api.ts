/**
 * API Client for TAC Validator Burn Calculator
 * Handles communication with the backend REST API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface BurnSummary {
  timestamp: string;
  period: string;
  status: string;
  totalValidators: number;
  activeValidators: number;
  totalBurnAmount: string;
  totalBurnAmountRaw: string;
  topValidators: Array<{
    moniker: string;
    burnAmount: string;
    address: string;
  }>;
  allCommissionRatesCorrect: boolean;
  readyForExecution: boolean;
  burnAddress: string;
  chainId: string;
  alerts: {
    total: number;
    critical: number;
    warnings: number;
  };
}

export interface ValidatorData {
  address: string;
  moniker: string;
  status: string;
  isActive: boolean;
  commissionRate: string;
  commissionRateRaw: number;
  hasCommissionIssues: boolean;
  outstandingRewards: string;
  unclaimedCommission: string;
  claimedCommission: string;
  totalCommission: string;
  totalRewards: string;
  burnAmount: string;
  validatorKeeps: string;
  burnAmountRaw: string;
  totalCommissionRaw: string;
  shouldBurn: boolean;
  hasRewards: boolean;
  hasCommission: boolean;
  calculatedAt: string;
}

export interface ValidatorsResponse {
  validators: ValidatorData[];
  count: number;
  timestamp: string;
  period: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    burnCalculator: boolean;
    chainConnection: boolean;
  };
  chainId: string;
  validatorCount: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  async getBurnSummary(period?: string): Promise<BurnSummary> {
    const queryParam = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<BurnSummary>(`/api/burn-summary${queryParam}`);
  }

  async getValidators(period?: string): Promise<ValidatorsResponse> {
    const queryParam = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<ValidatorsResponse>(`/api/validators${queryParam}`);
  }

  async getBurnReport(period?: string): Promise<any> {
    const queryParam = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<any>(`/api/burn-report${queryParam}`);
  }

  async clearCache(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/clear-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cache clear failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
