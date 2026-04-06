import priceAlertsDataRaw from '@/data/priceAlerts.json';
import type { PriceAlertsData } from '@/types/priceAlerts';

const priceAlertsData = priceAlertsDataRaw as PriceAlertsData;

export const priceAlerts = priceAlertsData;
