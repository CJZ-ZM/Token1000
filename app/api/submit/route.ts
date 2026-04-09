import { NextRequest, NextResponse } from 'next/server';
import { submitPriceUpdate, loadProviders } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // submissions per minute
const RATE_WINDOW = 60000;

// Simple hash function for IP (privacy-preserving)
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'token1000-salt').digest('hex');
}

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
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ipHash = hashIP(ip);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { providerId, providerName, modelKey, inputPrice, outputPrice, evidence } = body;

    // Validate required fields
    if (!modelKey) {
      return NextResponse.json(
        { error: 'modelKey is required' },
        { status: 400 }
      );
    }

    if (!providerId && !providerName) {
      return NextResponse.json(
        { error: 'Either providerId or providerName is required' },
        { status: 400 }
      );
    }

    // Validate prices if provided
    if (inputPrice !== undefined && (typeof inputPrice !== 'number' || inputPrice < 0)) {
      return NextResponse.json(
        { error: 'inputPrice must be a non-negative number' },
        { status: 400 }
      );
    }

    if (outputPrice !== undefined && (typeof outputPrice !== 'number' || outputPrice < 0)) {
      return NextResponse.json(
        { error: 'outputPrice must be a non-negative number' },
        { status: 400 }
      );
    }

    // Optional: validate provider exists if providerId provided
    if (providerId) {
      const providers = await loadProviders();
      const providerExists = providers.some(p => p.id === providerId);
      if (!providerExists) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }
    }

    const result = await submitPriceUpdate({
      providerId,
      providerName,
      modelKey,
      inputPrice,
      outputPrice,
      evidence,
      submitterHash: ipHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received. Thank you for your contribution!',
      submissionId: result.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
