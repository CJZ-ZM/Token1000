import { NextRequest, NextResponse } from 'next/server';
import { loadProviders, filterProviders, sortProviders, getAllModels, getProviderHealth, getAllProviderHealth } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const model = searchParams.get('model') || undefined;
    const search = searchParams.get('search') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const sortBy = searchParams.get('sortBy') as 'stability' | 'speed' | 'price' | 'rating' | undefined;
    const includeHealth = searchParams.get('includeHealth') === 'true';

    let providers = await filterProviders(model, search, tier);

    if (sortBy) {
      providers = await sortProviders(providers, sortBy);
    }

    // Optionally include health data
    if (includeHealth) {
      const healthData = await getAllProviderHealth();
      const healthMap = new Map(healthData.map(h => [h.slug, h]));

      providers = providers.map(p => ({
        ...p,
        health: healthMap.get(p.id) || null,
      }));
    }

    return NextResponse.json({
      providers,
      total: providers.length,
      models: await getAllModels(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
