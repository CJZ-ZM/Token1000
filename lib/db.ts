/**
 * Token1000 Database Client
 *
 * Provides database access functions with fallback to JSON data.
 * When DATABASE_URL is set, uses PostgreSQL via @neondatabase/serverless
 * Otherwise falls back to the static JSON data.
 */

import { Provider, ProvidersData } from '@/types';
import proxiesDataRaw from '@/data/proxies.json';

const proxiesData = proxiesDataRaw as ProvidersData;

// Check if we should use database
const USE_DATABASE = !!process.env.DATABASE_URL;

// Types for database responses
interface DbProvider {
  id: string;
  slug: string;
  name: string;
  url: string;
  affiliate_url: string | null;
  models: string[];
  description: string;
  features: string[];
  stability: number | null;
  speed: number | null;
  rating: number | null;
  risk_level: 'safe' | 'watch' | 'danger' | 'unknown';
  tier: 'recommended' | 'standard' | 'suspicious';
  risk_note: string | null;
  data_verified: boolean;
  last_verified: string | null;
  data_source: 'official' | 'automated' | 'verified' | 'community';
  review_count: number;
  recent_feedback: string | null;
  status: 'online' | 'offline' | 'degraded' | 'unverified';
  pricing: Array<{
    model_key: string;
    model_display_name: string;
    input_price: number | null;
    output_price: number | null;
  }>;
  test_stats: {
    total_tests: number;
    successful_tests: number;
    avg_latency: number | null;
    last_test: string | null;
  } | null;
}

interface DbTestResult {
  provider_id: string;
  success: boolean;
  latency_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  test_at: Date;
  price_accurate: boolean | null;
}

interface DbProviderHealth {
  slug: string;
  name: string;
  status: string;
  success_rate_24h: number | null;
  success_rate_7d: number | null;
  avg_latency_24h: number | null;
  last_test_at: Date | null;
}

// Database client (lazy initialization)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

async function getDb() {
  if (db) return db;

  if (!USE_DATABASE) {
    return null;
  }

  try {
    // Use createRequire for optional dependency
    // This allows the module to be missing without breaking the build
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);

    let neon: any;
    try {
      neon = req('@neondatabase/serverless');
    } catch {
      console.warn('@neondatabase/serverless not installed, database features disabled');
      return null;
    }

    db = neon.neon(process.env.DATABASE_URL!);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
}

// Convert database provider to Provider type
function convertDbProvider(row: DbProvider): Provider {
  const pricing: Record<string, number | undefined> = {};

  if (row.pricing) {
    for (const p of row.pricing) {
      if (p.input_price !== null) {
        pricing[`${p.model_key}_input`] = p.input_price;
      }
      if (p.output_price !== null) {
        pricing[`${p.model_key}_output`] = p.output_price;
      }
    }
  }

  return {
    id: row.slug,
    name: row.name,
    url: row.url,
    affiliateUrl: row.affiliate_url || undefined,
    models: row.models,
    pricing,
    description: row.description,
    features: row.features,
    stability: row.stability ?? null,
    speed: row.speed ?? null,
    rating: row.rating ?? undefined,
    riskLevel: row.risk_level,
    tier: row.tier,
    riskNote: row.risk_note ?? undefined,
    dataVerified: row.data_verified,
    lastVerified: row.last_verified ?? undefined,
    reviewCount: row.review_count || undefined,
    recentFeedback: row.recent_feedback ?? undefined,
    status: row.status,
  };
}

// ============================================
// PUBLIC API - Same interface as lib/data.ts
// ============================================

export async function loadProviders(): Promise<Provider[]> {
  const database = await getDb();

  if (!database) {
    return proxiesData.providers;
  }

  try {
    const rows = await database`
      SELECT * FROM providers_with_pricing
    `;
    return rows.map(convertDbProvider);
  } catch (error) {
    console.error('Database query failed, falling back to JSON:', error);
    return proxiesData.providers;
  }
}

export async function getProviderById(id: string): Promise<Provider | undefined> {
  const database = await getDb();

  if (!database) {
    return proxiesData.providers.find(p => p.id === id);
  }

  try {
    const [row] = await database`
      SELECT * FROM providers_with_pricing WHERE slug = ${id}
    `;
    return row ? convertDbProvider(row) : undefined;
  } catch (error) {
    console.error('Database query failed, falling back to JSON:', error);
    return proxiesData.providers.find(p => p.id === id);
  }
}

export async function filterProviders(
  model?: string,
  search?: string,
  tier?: string
): Promise<Provider[]> {
  const providers = await loadProviders();

  let filtered = [...providers];

  if (tier && tier !== 'all') {
    filtered = filtered.filter(p => p.tier === tier);
  }

  if (model && model !== '全部') {
    filtered = filtered.filter(p =>
      p.models.some(m => m.toLowerCase().includes(model.toLowerCase()))
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.models.some(m => m.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

export async function sortProviders(
  providers: Provider[],
  sortBy: 'stability' | 'speed' | 'price' | 'rating'
): Promise<Provider[]> {
  const sorted = [...providers];

  switch (sortBy) {
    case 'stability':
      return sorted.sort((a, b) => (b.stability ?? 0) - (a.stability ?? 0));
    case 'speed':
      return sorted.sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0));
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'price': {
      return sorted.sort((a, b) => {
        const aPrice = a.pricing.gpt4o_input ?? Infinity;
        const bPrice = b.pricing.gpt4o_input ?? Infinity;
        return aPrice - bPrice;
      });
    }
    default:
      return sorted;
  }
}

export async function getAllModels(): Promise<string[]> {
  const providers = await loadProviders();
  const modelsSet = new Set<string>();
  providers.forEach(p => p.models.forEach(m => modelsSet.add(m)));
  return Array.from(modelsSet).sort();
}

export function getPriceForModel(
  provider: Provider,
  modelKey: string
): { input?: number; output?: number } {
  const inputKey = `${modelKey}_input`;
  const outputKey = `${modelKey}_output`;
  return {
    input: provider.pricing[inputKey],
    output: provider.pricing[outputKey],
  };
}

export async function getRecommendedProviders(): Promise<Provider[]> {
  const providers = await loadProviders();
  return providers.filter(p => p.tier === 'recommended');
}

export async function getDangerProviders(): Promise<Provider[]> {
  const providers = await loadProviders();
  return providers.filter(p => p.riskLevel === 'danger' || p.riskLevel === 'watch');
}

// ============================================
// NEW: Health & Testing API
// ============================================

export async function getProviderHealth(slug: string): Promise<DbProviderHealth | null> {
  const database = await getDb();

  if (!database) {
    return null;
  }

  try {
    const [row] = await database`
      SELECT * FROM provider_health WHERE slug = ${slug}
    `;
    return row || null;
  } catch (error) {
    console.error('Failed to get provider health:', error);
    return null;
  }
}

export async function getAllProviderHealth(): Promise<DbProviderHealth[]> {
  const database = await getDb();

  if (!database) {
    return [];
  }

  try {
    const rows = await database`SELECT * FROM provider_health`;
    return rows;
  } catch (error) {
    console.error('Failed to get provider health:', error);
    return [];
  }
}

export async function recordTestResult(result: {
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
  const database = await getDb();

  if (!database) {
    return;
  }

  try {
    await database`
      INSERT INTO test_results (
        provider_id, success, latency_ms, status_code,
        error_message, test_endpoint, test_model,
        price_accurate, expected_price, actual_price
      )
      VALUES (
        ${result.providerId},
        ${result.success},
        ${result.latencyMs ?? null},
        ${result.statusCode ?? null},
        ${result.errorMessage ?? null},
        ${result.testEndpoint ?? null},
        ${result.testModel ?? null},
        ${result.priceAccurate ?? null},
        ${result.expectedPrice ?? null},
        ${result.actualPrice ?? null}
      )
    `;
  } catch (error) {
    console.error('Failed to record test result:', error);
  }
}

export async function getRecentTestResults(
  providerId: string,
  limit: number = 10
): Promise<DbTestResult[]> {
  const database = await getDb();

  if (!database) {
    return [];
  }

  try {
    const rows = await database`
      SELECT * FROM test_results
      WHERE provider_id = ${providerId}
      ORDER BY test_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error('Failed to get test results:', error);
    return [];
  }
}

// ============================================
// NEW: User Submissions API
// ============================================

export async function submitPriceUpdate(data: {
  providerId?: string;
  providerName?: string;
  modelKey: string;
  inputPrice?: number;
  outputPrice?: number;
  evidence?: string;
  submitterHash?: string;
}): Promise<{ id: string; status: string }> {
  const database = await getDb();

  if (!database) {
    return { id: 'mock-id', status: 'pending' };
  }

  try {
    const [row] = await database`
      INSERT INTO user_submissions (
        provider_id, provider_name, submission_type,
        model_key, new_input_price, new_output_price,
        evidence, submitter_hash
      )
      VALUES (
        ${data.providerId ?? null},
        ${data.providerName ?? null},
        'price_update',
        ${data.modelKey},
        ${data.inputPrice ?? null},
        ${data.outputPrice ?? null},
        ${data.evidence ?? null},
        ${data.submitterHash ?? null}
      )
      RETURNING id, status
    `;
    return { id: row.id, status: row.status };
  } catch (error) {
    console.error('Failed to submit price update:', error);
    throw error;
  }
}

export async function getPendingSubmissions(): Promise<any[]> {
  const database = await getDb();

  if (!database) {
    return [];
  }

  try {
    const rows = await database`
      SELECT * FROM user_submissions
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Failed to get pending submissions:', error);
    return [];
  }
}

export async function reviewSubmission(
  submissionId: string,
  approved: boolean,
  reviewedBy: string
): Promise<void> {
  const database = await getDb();

  if (!database) {
    return;
  }

  try {
    await database`
      UPDATE user_submissions
      SET
        status = ${approved ? 'approved' : 'rejected'},
        reviewed_by = ${reviewedBy},
        reviewed_at = NOW()
      WHERE id = ${submissionId}
    `;
  } catch (error) {
    console.error('Failed to review submission:', error);
    throw error;
  }
}

// ============================================
// NEW: Affiliate Links API
// ============================================

export async function getAffiliateLink(providerSlug: string): Promise<string | null> {
  const database = await getDb();

  if (!database) {
    return null;
  }

  try {
    const [row] = await database`
      SELECT affiliate_url FROM affiliate_links
      WHERE provider_id = (SELECT id FROM providers WHERE slug = ${providerSlug})
      AND is_active = TRUE
      LIMIT 1
    `;
    return row?.affiliate_url || null;
  } catch (error) {
    console.error('Failed to get affiliate link:', error);
    return null;
  }
}

export async function recordAffiliateClick(
  linkId: string,
  context: {
    ipHash?: string;
    userAgent?: string;
    referer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }
): Promise<void> {
  const database = await getDb();

  if (!database) {
    return;
  }

  try {
    await database.transaction([
      database`UPDATE affiliate_links SET click_count = click_count + 1, last_clicked_at = NOW() WHERE id = ${linkId}`,
      database`
        INSERT INTO affiliate_clicks (affiliate_link_id, ip_hash, user_agent, referer, utm_source, utm_medium, utm_campaign)
        VALUES (${linkId}, ${context.ipHash ?? null}, ${context.userAgent ?? null}, ${context.referer ?? null}, ${context.utmSource ?? null}, ${context.utmMedium ?? null}, ${context.utmCampaign ?? null})
      `,
    ]);
  } catch (error) {
    console.error('Failed to record affiliate click:', error);
  }
}
