/**
 * Token1000 Database Client
 *
 * This module provides database access functions.
 * Database features are currently DISABLED.
 *
 * To enable:
 * 1. npm install @neondatabase/serverless
 * 2. Set DATABASE_URL environment variable
 * 3. Update this file to use the actual database client
 */

// Re-export everything from data.ts
export {
  loadProviders,
  getProviderById,
  filterProviders,
  sortProviders,
  getAllModels,
  getPriceForModel,
  getRecommendedProviders,
  getDangerProviders,
} from './data';

// Import Provider type for local use
import type { Provider as ProviderType, ProvidersData } from '@/types';
export type { ProviderType as Provider, ProvidersData };

// Database placeholder functions - return null/empty when DB not configured
export async function getProviderHealth(_slug: string): Promise<null> {
  return null;
}

export async function getAllProviderHealth(): Promise<any[]> {
  return [];
}

export async function recordTestResult(_result: {
  providerId: string;
  success: boolean;
  latencyMs?: number;
  statusCode?: number;
  errorMessage?: string;
  testEndpoint?: string;
  testModel?: string;
  priceAccurate?: boolean;
  expectedPrice?: number;
  actualPrice?: number;
}): Promise<void> {
  // Database not configured
}

export async function getRecentTestResults(
  _providerId: string,
  _limit: number = 10
): Promise<any[]> {
  return [];
}

export async function submitPriceUpdate(_data: {
  providerId?: string;
  providerName?: string;
  modelKey: string;
  inputPrice?: number;
  outputPrice?: number;
  evidence?: string;
  submitterHash?: string;
}): Promise<{ id: string; status: string }> {
  return { id: 'disabled', status: 'disabled' };
}

export async function getPendingSubmissions(): Promise<any[]> {
  return [];
}

export async function reviewSubmission(
  _submissionId: string,
  _approved: boolean,
  _reviewedBy: string
): Promise<void> {
  // Database not configured
}

export async function getAffiliateLink(_providerSlug: string): Promise<null> {
  return null;
}

export async function recordAffiliateClick(
  _linkId: string,
  _context: {
    ipHash?: string;
    userAgent?: string;
    referer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }
): Promise<void> {
  // Database not configured
}
