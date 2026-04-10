import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import https from 'https';
import http from 'http';
import { getAllProviderHealth, loadProviders } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Provider domains for DNS checking
const PROVIDER_DOMAINS: Record<string, string> = {
  'siliconflow': 'api.siliconflow.cn',
  'zhipuai': 'open.bigmodel.cn',
  'deepseek': 'api.deepseek.com',
  'moonshot': 'api.moonshot.cn',
  'minimax': 'api.minimax.chat',
  'baichuan': 'api.baichuan-ai.com',
  'tongyi': 'dashscope.aliyuncs.com',
  'wenxin': 'aip.baidubce.com',
  'openrouter': 'openrouter.ai',
  'groq': 'groq.com',
  'api2d': 'api.api2d.com',
  'chatanywhere': 'api.chatanywhere.tech',
};

// DNS-based health check
async function checkDomain(key: string, domain: string) {
  const start = Date.now();
  try {
    await dns.resolve(domain);
    return {
      key,
      status: 'online',
      latency: null,
      type: 'dns',
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      key,
      status: 'offline',
      latency: null,
      type: 'dns',
      checkedAt: new Date().toISOString(),
    };
  }
}

// HTTP-based health check (tests actual API endpoint)
async function checkHttpEndpoint(key: string, url: string, apiKey?: string): Promise<{
  key: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number | null;
  statusCode: number | null;
  type: string;
  checkedAt: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        key,
        status: 'offline',
        latency: null,
        statusCode: null,
        type: 'http',
        checkedAt: new Date().toISOString(),
        error: 'Request timeout',
      });
    }, 10000); // 10 second timeout

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
    };

    const client = url.startsWith('https') ? https : http;

    const req = client.request(url, options, (res) => {
      cleanup();
      const latency = Date.now() - startTime;

      // Read response to ensure it's complete
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        if (data.length > 1000) {
          // Enough data, stop reading
          res.destroy();
        }
      });

      res.on('end', () => {
        const statusCode = res.statusCode || 0;

        if (statusCode >= 200 && statusCode < 300) {
          resolve({
            key,
            status: 'online',
            latency,
            statusCode,
            type: 'http',
            checkedAt: new Date().toISOString(),
          });
        } else if (statusCode >= 400 && statusCode < 500) {
          // Client error - might mean endpoint exists but auth failed
          resolve({
            key,
            status: 'degraded', // API exists but something's wrong
            latency,
            statusCode,
            type: 'http',
            checkedAt: new Date().toISOString(),
            error: `HTTP ${statusCode}`,
          });
        } else {
          resolve({
            key,
            status: 'offline',
            latency,
            statusCode,
            type: 'http',
            checkedAt: new Date().toISOString(),
            error: `HTTP ${statusCode}`,
          });
        }
      });
    });

    req.on('error', (e) => {
      cleanup();
      resolve({
        key,
        status: 'offline',
        latency: null,
        statusCode: null,
        type: 'http',
        checkedAt: new Date().toISOString(),
        error: e.message,
      });
    });

    // Send minimal test request
    try {
      req.write(JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }));
    } catch {
      // Ignore write errors
    }

    req.end();
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'dns'; // 'dns', 'http', or 'all'
    const includeDbHealth = searchParams.get('includeDbHealth') !== 'false'; // Default true

    const results: any[] = [];

    // 1. DNS checks for known providers
    const dnsPromises = Object.entries(PROVIDER_DOMAINS).map(([key, domain]) =>
      checkDomain(key, domain)
    );

    // 2. HTTP checks if requested
    if (type === 'http' || type === 'all') {
      const httpChecks = Object.entries(PROVIDER_DOMAINS).map(async ([key, domain]) => {
        // Build test URL
        let url: string;
        if (key === 'openrouter') {
          url = `https://openrouter.ai/api/v1/chat/completions`;
        } else if (key === 'groq') {
          url = `https://api.groq.com/openai/v1/chat/completions`;
        } else {
          url = `https://${domain}/v1/chat/completions`;
        }
        return checkHttpEndpoint(key, url);
      });

      const httpResults = await Promise.all(httpChecks);
      results.push(...httpResults);
    } else {
      const dnsResults = await Promise.all(dnsPromises);
      results.push(...dnsResults);
    }

    // 3. Include database health data if available
    let dbHealth: any = null;
    if (includeDbHealth) {
      try {
        dbHealth = await getAllProviderHealth();
      } catch {
        // Database not available
        dbHealth = null;
      }
    }

    // 4. Get basic provider list (count only)
    let providerStats = null;
    try {
      const providers = await loadProviders();
      providerStats = {
        total: providers.length,
        safe: providers.filter(p => p.riskLevel === 'safe').length,
        watch: providers.filter(p => p.riskLevel === 'watch').length,
        danger: providers.filter(p => p.riskLevel === 'danger').length,
      };
    } catch {
      // Ignore
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      type,
      results,
      providerStats,
      databaseHealth: dbHealth,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
