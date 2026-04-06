export interface PriceAlert {
  id: string;
  provider: string;
  model: string;
  type: 'price_drop' | 'price_rise';
  change: string;
  oldPrice: number;
  newPrice: number;
  date: string;
  description: string;
}

export interface PriceAlertsData {
  alerts: PriceAlert[];
}
