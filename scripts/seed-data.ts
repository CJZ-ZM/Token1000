/**
 * Token1000 Data Migration Script
 *
 * This script migrates data from proxies.json to the PostgreSQL database.
 * Run with: npx tsx scripts/seed-data.ts
 *
 * Prerequisites:
 * 1. Set up PostgreSQL database
 * 2. Run scripts/schema.sql to create tables
 * 3. Set DATABASE_URL environment variable
 */

import * as fs from 'fs';
import * as path from 'path';
import { Provider, ProvidersData, Pricing } from '@/types';

// Load the JSON data
const dataPath = path.join(process.cwd(), 'data', 'proxies.json');
const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as ProvidersData;

interface MigrationProvider {
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
}

function normalizeModelKey(model: string): string {
  return model
    .toLowerCase()
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
}

function getModelDisplayName(model: string): string {
  const modelMap: Record<string, string> = {
    'Qwen/Qwen2.5-72B-Instruct': 'Qwen2.5-72B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct': 'Qwen2.5-32B-Instruct',
    'DeepSeek-V3': 'DeepSeek-V3',
    'DeepSeek-V2.5': 'DeepSeek-V2.5',
    'GLM-4': 'GLM-4',
    'Yi-1.5-34B': 'Yi-1.5-34B',
    'Llama-3.1-70B': 'Llama-3.1-70B',
    'SD3-Medium': 'SD3-Medium',
    'FLUX.1-dev': 'FLUX.1-dev',
    'FLUX.1-schnell': 'FLUX.1-schnell',
    'GPT-4o': 'GPT-4o',
    'GPT-4o-mini': 'GPT-4o-mini',
    'Claude-3.5-Sonnet': 'Claude-3.5-Sonnet',
    'Claude-3-Haiku': 'Claude-3-Haiku',
    'GPT-4-Turbo': 'GPT-4-Turbo',
    'Llama-3.1-8B': 'Llama-3.1-8B',
    'Mixtral-8x7B': 'Mixtral-8x7B',
    'Gemma-2-9B': 'Gemma-2-9B',
    'Gemini-1.5-Pro': 'Gemini-1.5-Pro',
    'Claude-3.5-Haiku': 'Claude-3.5-Haiku',
    'GPT-4': 'GPT-4',
    'Llama-3-70B': 'Llama-3-70B',
    'Gemini-1.5-Flash': 'Gemini-1.5-Flash',
  };
  return modelMap[model] || model;
}

function transformProvider(provider: Provider): MigrationProvider {
  const pricing: MigrationProvider['pricing'] = [];

  // Transform pricing object into array
  if (provider.pricing) {
    for (const [key, value] of Object.entries(provider.pricing)) {
      if (value !== undefined && value !== null) {
        // Key format: "model_input" or "model_output"
        const parts = key.split('_');
        const suffix = parts.pop(); // 'input' or 'output'
        const modelKey = parts.join('_');

        // Find or create pricing entry
        let entry = pricing.find(p => p.model_key === modelKey);
        if (!entry) {
          // Try to find the original model name from the models array
          const originalModel = provider.models.find(m =>
            normalizeModelKey(m).includes(modelKey) ||
            modelKey.includes(normalizeModelKey(m).split('_')[0])
          );
          entry = {
            model_key: modelKey,
            model_display_name: originalModel ? getModelDisplayName(originalModel) : modelKey,
            input_price: null,
            output_price: null,
          };
          pricing.push(entry);
        }

        if (suffix === 'input') {
          entry.input_price = value;
        } else if (suffix === 'output') {
          entry.output_price = value;
        }
      }
    }
  }

  return {
    slug: provider.id,
    name: provider.name,
    url: provider.url,
    affiliate_url: provider.affiliateUrl || null,
    models: provider.models,
    description: provider.description,
    features: provider.features,
    stability: provider.stability,
    speed: provider.speed,
    rating: provider.rating ?? null,
    risk_level: provider.riskLevel,
    tier: provider.tier,
    risk_note: provider.riskNote || null,
    data_verified: provider.dataVerified,
    last_verified: provider.lastVerified || null,
    data_source: 'community', // Original data is community sourced
    review_count: provider.reviewCount || 0,
    recent_feedback: provider.recentFeedback || null,
    status: (provider.status === 'unknown' ? 'unverified' : provider.status) || 'unverified',
    pricing,
  };
}

// Generate SQL for inserting providers
function generateProviderSQL(providers: MigrationProvider[]): string {
  const lines: string[] = [];

  lines.push('-- Provider data migration');
  lines.push('-- Generated at: ' + new Date().toISOString());
  lines.push('');

  for (const p of providers) {
    lines.push(`-- Provider: ${p.name}`);
    lines.push(`INSERT INTO providers (`);
    lines.push(`  slug, name, url, affiliate_url, models, description, features,`);
    lines.push(`  stability, speed, rating, risk_level, tier, risk_note,`);
    lines.push(`  data_verified, last_verified, data_source, review_count, recent_feedback, status`);
    lines.push(`) VALUES (`);
    lines.push(`  '${escapeSQL(p.slug)}',`);
    lines.push(`  '${escapeSQL(p.name)}',`);
    lines.push(`  '${escapeSQL(p.url)}',`);
    lines.push(`  ${p.affiliate_url ? `'${escapeSQL(p.affiliate_url)}'` : 'NULL'},`);
    lines.push(`  ARRAY[${p.models.map(m => `'${escapeSQL(m)}'`).join(', ')}]::text[],`);
    lines.push(`  '${escapeSQL(p.description)}',`);
    lines.push(`  ARRAY[${p.features.map(f => `'${escapeSQL(f)}'`).join(', ')}]::text[],`);
    lines.push(`  ${p.stability},`);
    lines.push(`  ${p.speed},`);
    lines.push(`  ${p.rating},`);
    lines.push(`  '${p.risk_level}',`);
    lines.push(`  '${p.tier}',`);
    lines.push(`  ${p.risk_note ? `'${escapeSQL(p.risk_note)}'` : 'NULL'},`);
    lines.push(`  ${p.data_verified},`);
    lines.push(`  ${p.last_verified ? `'${p.last_verified}'` : 'NULL'},`);
    lines.push(`  '${p.data_source}',`);
    lines.push(`  ${p.review_count},`);
    lines.push(`  ${p.recent_feedback ? `'${escapeSQL(p.recent_feedback)}'` : 'NULL'},`);
    lines.push(`  '${p.status}'`);
    lines.push(`) ON CONFLICT (slug) DO UPDATE SET`);
    lines.push(`  name = EXCLUDED.name,`);
    lines.push(`  url = EXCLUDED.url,`);
    lines.push(`  affiliate_url = EXCLUDED.affiliate_url,`);
    lines.push(`  models = EXCLUDED.models,`);
    lines.push(`  description = EXCLUDED.description,`);
    lines.push(`  features = EXCLUDED.features,`);
    lines.push(`  stability = EXCLUDED.stability,`);
    lines.push(`  speed = EXCLUDED.speed,`);
    lines.push(`  rating = EXCLUDED.rating,`);
    lines.push(`  risk_level = EXCLUDED.risk_level,`);
    lines.push(`  tier = EXCLUDED.tier,`);
    lines.push(`  risk_note = EXCLUDED.risk_note,`);
    lines.push(`  data_verified = EXCLUDED.data_verified,`);
    lines.push(`  last_verified = EXCLUDED.last_verified,`);
    lines.push(`  data_source = EXCLUDED.data_source,`);
    lines.push(`  review_count = EXCLUDED.review_count,`);
    lines.push(`  recent_feedback = EXCLUDED.recent_feedback,`);
    lines.push(`  status = EXCLUDED.status;`);
    lines.push('');

    // Generate pricing inserts
    for (const price of p.pricing) {
      lines.push(`INSERT INTO provider_pricing (`);
      lines.push(`  provider_id, model_key, model_display_name, input_price, output_price, is_current`);
      lines.push(`) SELECT`);
      lines.push(`  id,`);
      lines.push(`  '${escapeSQL(price.model_key)}',`);
      lines.push(`  '${escapeSQL(price.model_display_name)}',`);
      lines.push(`  ${price.input_price},`);
      lines.push(`  ${price.output_price},`);
      lines.push(`  TRUE`);
      lines.push(`FROM providers WHERE slug = '${escapeSQL(p.slug)}'`);
      lines.push(`ON CONFLICT (provider_id, model_key, is_current) DO UPDATE SET`);
      lines.push(`  model_display_name = EXCLUDED.model_display_name,`);
      lines.push(`  input_price = EXCLUDED.input_price,`);
      lines.push(`  output_price = EXCLUDED.output_price,`);
      lines.push(`  updated_at = NOW();`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\n/g, ' ');
}

// Main execution
async function main() {
  console.log('Token1000 Data Migration Script');
  console.log('================================\n');

  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const migratedProviders = jsonData.providers.map(transformProvider);

  console.log(`Found ${migratedProviders.length} providers to migrate\n`);

  // Generate and save migration SQL
  const sql = generateProviderSQL(migratedProviders);
  const sqlPath = path.join(outputDir, 'migrate_providers.sql');
  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`Generated SQL: ${sqlPath}`);

  // Generate a JSON export for verification
  const jsonPath = path.join(outputDir, 'migrated_providers.json');
  fs.writeFileSync(jsonPath, JSON.stringify(migratedProviders, null, 2), 'utf-8');
  console.log(`Generated JSON: ${jsonPath}`);

  // Summary
  console.log('\nMigration Summary:');
  console.log(`- Providers: ${migratedProviders.length}`);
  console.log(`- Total pricing entries: ${migratedProviders.reduce((acc, p) => acc + p.pricing.length, 0)}`);
  console.log(`- Risk levels: safe=${migratedProviders.filter(p => p.risk_level === 'safe').length}, watch=${migratedProviders.filter(p => p.risk_level === 'watch').length}, danger=${migratedProviders.filter(p => p.risk_level === 'danger').length}`);
  console.log(`- Tiers: recommended=${migratedProviders.filter(p => p.tier === 'recommended').length}, standard=${migratedProviders.filter(p => p.tier === 'standard').length}`);

  console.log('\nNext steps:');
  console.log('1. Review the generated SQL in scripts/output/migrate_providers.sql');
  console.log('2. Run: psql $DATABASE_URL -f scripts/output/migrate_providers.sql');
}

main().catch(console.error);
