import guidesDataRaw from '@/data/guides.json';
import type { GuidesData } from '@/types/guides';

const guidesData = guidesDataRaw as GuidesData;

export const guides = guidesData.guides;
