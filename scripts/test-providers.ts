/**
 * Token1000 Automated Provider Testing Script
 *
 * This script performs automated testing of all API providers.
 * Run with: npx tsx scripts/test-providers.ts
 *
 * Environment variables:
 * - DATABASE_URL: PostgreSQL connection string
 * - TEST_API_KEY: Optional API key for testing (some providers require it)
 * - SLACK_WEBHOOK: Optional Slack webhook for alerts
 *
 * What it tests:
 * 1. API availability (HTTP status)
 * 2. Response latency
 * 3. Price accuracy (if detectable)
 * 4. Model availability
 */

import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';

// Types
interface TestResult {
  providerId: string;
  providerName: string;
  success: boolean;
  latencyMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  testEndpoint: string;
  testModel: string;
  priceAccurate: boolean | null;
  expectedPrice: number | null;
  actualPrice: number | null;
  testedAt: Date;
}

interface Provider {
  id: string;
  name: string;
  url: string;
  models: string[];
  pricing: Record<string, number | undefined>;
  riskLevel: string;
  tier: string;
}

// Load providers from JSON
function loadProviders(): Provider[] {
  const dataPath = path.join(process.cwd(), 'data', 'proxies.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return data.providers;
}

// Normalize model key for lookup
function normalizeModelKey(model: string): string {
  return model
    .toLowerCase()
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
}

// Find the best model to test for a provider
function getTestModel(provider: Provider): { model: string; modelKey: string } | null {
  // Priority order for test models
  const testPriority = [
    'gpt-4o',
    'gpt-4o-mini',
    'deepseek-v3',
    'claude-3.5-sonnet',
    'qwen2.5-72b',
  ];

  for (const priorityModel of testPriority) {
    const found = provider.models.find(m =>
      normalizeModelKey(m).includes(priorityModel)
    );
    if (found) {
      return {
        model: found,
        modelKey: normalizeModelKey(found),
      };
    }
  }

  // Fallback to first model
  if (provider.models.length > 0) {
    return {
      model: provider.models[0],
      modelKey: normalizeModelKey(provider.models[0]),
    };
  }

  return null;
}

// Build test URL for a provider
function buildTestUrl(provider: Provider, model: string): string | null {
  const baseUrl = provider.url.replace(/\/$/, '');

  // Provider-specific URL patterns
  const urlPatterns: Record<string, string> = {
    siliconflow: '/v1/chat/completions',
    api2d: '/v1/chat/completions',
    chatanywhere: '/v1/chat/completions',
    openrouter: '/v1/chat/completions',
    groq: '/v1/chat/completions',
  };

  const endpoint = urlPatterns[provider.id];
  if (!endpoint) {
    // Try generic OpenAI-compatible endpoint
    return `${baseUrl}/v1/chat/completions`;
  }

  return `${baseUrl}${endpoint}`;
}

// Make an HTTP request and measure latency
async function testEndpoint(
  url: string,
  apiKey?: string,
  model?: string
): Promise<{ success: boolean; latencyMs: number; statusCode: number; error: string | null }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let data = '';

    const options: http.RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      timeout: 30000,
    };

    // Determine if HTTP or HTTPS
    const client = url.startsWith('https') ? https : http;

    const req = client.request(url, options, (res) => {
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const latencyMs = Date.now() - startTime;
        const statusCode = res.statusCode || 0;

        if (statusCode >= 200 && statusCode < 300) {
          resolve({
            success: true,
            latencyMs,
            statusCode,
            error: null,
          });
        } else {
          resolve({
            success: false,
            latencyMs,
            statusCode,
            error: `HTTP ${statusCode}: ${data.substring(0, 200)}`,
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        latencyMs: Date.now() - startTime,
        statusCode: 0,
        error: e.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        latencyMs: Date.now() - startTime,
        statusCode: 0,
        error: 'Request timeout',
      });
    });

    // Send minimal test request
    const body = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });

    req.write(body);
    req.end();
  });
}

// Test a single provider
async function testProvider(provider: Provider, apiKey?: string): Promise<TestResult> {
  const testModelInfo = getTestModel(provider);

  if (!testModelInfo) {
    return {
      providerId: provider.id,
      providerName: provider.name,
      success: false,
      latencyMs: null,
      statusCode: null,
      errorMessage: 'No testable model found',
      testEndpoint: provider.url,
      testModel: '',
      priceAccurate: null,
      expectedPrice: null,
      actualPrice: null,
      testedAt: new Date(),
    };
  }

  const testUrl = buildTestUrl(provider, testModelInfo.model);
  if (!testUrl) {
    return {
      providerId: provider.id,
      providerName: provider.name,
      success: false,
      latencyMs: null,
      statusCode: null,
      errorMessage: 'Could not build test URL',
      testEndpoint: provider.url,
      testModel: testModelInfo.model,
      priceAccurate: null,
      expectedPrice: null,
      actualPrice: null,
      testedAt: new Date(),
    };
  }

  const result = await testEndpoint(testUrl, apiKey, testModelInfo.model);

  // Get expected price for accuracy check
  const inputKey = `${testModelInfo.modelKey}_input`;
  const expectedPrice = provider.pricing[inputKey] || null;

  return {
    providerId: provider.id,
    providerName: provider.name,
    success: result.success,
    latencyMs: result.latencyMs,
    statusCode: result.statusCode,
    errorMessage: result.error,
    testEndpoint: testUrl,
    testModel: testModelInfo.model,
    priceAccurate: null, // Would need response parsing to verify
    expectedPrice,
    actualPrice: null,
    testedAt: new Date(),
  };
}

// Save results to file
function saveResults(results: TestResult[], outputPath: string): void {
  const data = {
    timestamp: new Date().toISOString(),
    totalProviders: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Results saved to ${outputPath}`);
}

// Main execution
async function main() {
  console.log('Token1000 Automated Provider Testing');
  console.log('====================================\n');

  const providers = loadProviders();
  console.log(`Loaded ${providers.length} providers\n`);

  const results: TestResult[] = [];
  const apiKey = process.env.TEST_API_KEY;

  if (apiKey) {
    console.log('API key provided, will use for authenticated requests\n');
  }

  console.log('Testing providers...\n');

  for (const provider of providers) {
    process.stdout.write(`Testing ${provider.name.substring(0, 30).padEnd(30)}...`);

    const result = await testProvider(provider, apiKey);
    results.push(result);

    if (result.success) {
      console.log(` ✓ ${result.latencyMs}ms (HTTP ${result.statusCode})`);
    } else {
      console.log(` ✗ ${result.errorMessage?.substring(0, 50) || 'Failed'}`);
    }

    // Rate limiting - wait 500ms between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n====================================');
  console.log('Test Summary');
  console.log('====================================');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgLatency = results
    .filter(r => r.success && r.latencyMs)
    .reduce((sum, r) => sum + (r.latencyMs || 0), 0) / (successCount || 1);

  console.log(`Total: ${results.length}`);
  console.log(`Success: ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failCount}`);
  console.log(`Average latency: ${avgLatency.toFixed(0)}ms\n`);

  // Save results
  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(outputDir, `test-results-${timestamp}.json`);
  saveResults(results, resultsPath);

  // Also save to latest.json for easy access
  const latestPath = path.join(outputDir, 'test-results-latest.json');
  saveResults(results, latestPath);

  // Show failed providers
  if (failCount > 0) {
    console.log('Failed providers:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.providerName}: ${r.errorMessage}`);
      });
  }

  console.log('\nDone!');
}

main().catch(console.error);
