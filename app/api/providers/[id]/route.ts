import { NextRequest, NextResponse } from 'next/server';
import { getProviderById, getProviderHealth, getRecentTestResults, getAffiliateLink } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await getProviderById(id);

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get health data
    const health = await getProviderHealth(id);

    // Get recent test results
    const testResults = await getRecentTestResults(id, 20);

    // Get affiliate link if available
    const affiliateLink = await getAffiliateLink(id);

    return NextResponse.json({
      provider: {
        ...provider,
        affiliateUrl: affiliateLink || provider.affiliateUrl,
      },
      health,
      recentTests: testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}
