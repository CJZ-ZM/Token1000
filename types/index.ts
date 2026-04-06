export interface Pricing {
  [key: string]: number | undefined;
}

export interface Provider {
  id: string;
  name: string;
  url: string;
  models: string[];
  pricing: Pricing;
  stability: number;
  speed: number;
  features: string[];
  description: string;
  status?: 'online' | 'offline' | 'unknown';
}

export interface ProvidersData {
  providers: Provider[];
}
