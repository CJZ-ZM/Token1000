import { NextRequest, NextResponse } from 'next/server';
import { recordTestResult, loadProviders } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { providerId, success, latencyMs, statusCode, errorMessage, testEndpoint, testModel, priceAccurate, expectedPrice, actualPrice } = body;

    // Validate required fields
    if (!providerId || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, success' },
        { status: 400 }
      );
    }

    await recordTestResult({
      providerId,
      success,
      latencyMs,
      statusCode,
      errorMessage,
      testEndpoint,
      testModel,
      priceAccurate,
      expectedPrice,
      actualPrice,
    });

    return NextResponse.json({
      success: true,
      message: 'Test result recorded',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording test result:', error);
    return NextResponse.json(
      { error: 'Failed to record test result' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent test results (for debugging)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json(
      { error: 'providerId is required' },
      { status: 400 }
    );
  }

  try {
    const { getRecentTestResults } = await import('@/lib/db');
    const results = await getRecentTestResults(providerId, 20);

    return NextResponse.json({
      providerId,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}
