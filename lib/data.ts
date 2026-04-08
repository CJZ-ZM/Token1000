import { Provider, ProvidersData } from '@/types';
import proxiesDataRaw from '@/data/proxies.json';

const proxiesData = proxiesDataRaw as ProvidersData;

export function loadProviders(): Provider[] {
  return proxiesData.providers;
}

export function getProviderById(id: string): Provider | undefined {
  const providers = loadProviders();
  return providers.find(p => p.id === id);
}

export function filterProviders(
  model?: string,
  search?: string,
  tier?: string
): Provider[] {
  let providers = loadProviders();

  if (tier && tier !== 'all') {
    providers = providers.filter(p => p.tier === tier);
  }

  if (model && model !== '全部') {
    providers = providers.filter(p =>
      p.models.some(m => m.toLowerCase().includes(model.toLowerCase()))
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    providers = providers.filter(
      p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.models.some(m => m.toLowerCase().includes(searchLower))
    );
  }

  return providers;
}

export function sortProviders(
  providers: Provider[],
  sortBy: 'stability' | 'speed' | 'price' | 'rating'
): Provider[] {
  const sorted = [...providers];

  switch (sortBy) {
    case 'stability':
      return sorted.sort((a, b) => b.stability - a.stability);
    case 'speed':
      return sorted.sort((a, b) => b.speed - a.speed);
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

export function getAllModels(): string[] {
  const providers = loadProviders();
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

export function getRecommendedProviders(): Provider[] {
  return loadProviders().filter(p => p.tier === 'recommended');
}

export function getDangerProviders(): Provider[] {
  return loadProviders().filter(p => p.riskLevel === 'danger' || p.riskLevel === 'watch');
}
