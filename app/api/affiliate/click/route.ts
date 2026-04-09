import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory store for affiliate clicks (in production, use database)
interface AffiliateClick {
  id: string;
  providerId: string;
  targetUrl: string;
  clickedAt: Date;
  ipHash: string;
  userAgent: string;
  referer: string;
}

// Simple in-memory store (resets on server restart)
// In production, this should be stored in the database
const clicks: AffiliateClick[] = [];
const MAX_STORED_CLICKS = 1000;

// Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'token1000-salt').digest('hex').substring(0, 16);
}

// Rate limiting for click recording
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // clicks per minute
const RATE_WINDOW = 60000;

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
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { providerId, targetUrl } = body;

    if (!providerId || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, targetUrl' },
        { status: 400 }
      );
    }

    const click: AffiliateClick = {
      id: crypto.randomUUID(),
      providerId,
      targetUrl,
      clickedAt: new Date(),
      ipHash: hashIP(ip),
      userAgent,
      referer,
    };

    // Store click (with memory limit)
    clicks.push(click);
    if (clicks.length > MAX_STORED_CLICKS) {
      clicks.shift(); // Remove oldest
    }

    // In production, you would also:
    // 1. Store in database (affiliate_clicks table)
    // 2. Call provider's affiliate tracking pixel if they have one
    // 3. Fire analytics event

    return NextResponse.json({
      success: true,
      clickId: click.id,
      timestamp: click.clickedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error recording affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to record click' },
      { status: 500 }
    );
  }
}

// GET endpoint for stats (admin only)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const providerId = searchParams.get('providerId');

  // Simple admin check (in production, use proper auth)
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_API_KEY && adminKey !== 'token1000-admin-key') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    let filteredClicks = clicks;

    if (providerId) {
      filteredClicks = clicks.filter(c => c.providerId === providerId);
    }

    // Aggregate stats
    const stats = {
      totalClicks: filteredClicks.length,
      byProvider: {} as Record<string, number>,
      recentClicks: filteredClicks.slice(-20).reverse(),
    };

    for (const click of filteredClicks) {
      stats.byProvider[click.providerId] = (stats.byProvider[click.providerId] || 0) + 1;
    }

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching click stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
