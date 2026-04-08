export interface Pricing {
  [key: string]: number | undefined;
}

export type RiskLevel = 'safe' | 'watch' | 'danger';
export type Tier = 'recommended' | 'standard' | 'suspicious';

export interface Provider {
  id: string;
  name: string;
  url: string;
  /** 官方注册链接（用于Affiliate分润追踪） */
  affiliateUrl?: string;
  models: string[];
  pricing: Pricing;
  stability: number;       // 1-5，基于真实用户反馈
  speed: number;           // 1-5，响应延迟评分
  features: string[];
  description: string;
  /** 风险等级：safe=推荐 | watch=观察 | danger=勿入 */
  riskLevel: RiskLevel;
  /** 平台推荐等级：recommended=推荐 | standard=普通 | suspicious=可疑 */
  tier: Tier;
  /** 数据是否已通过真实调研验证 */
  dataVerified: boolean;
  /** 最后人工验证时间 */
  lastVerified?: string;
  /** 用户评价数量 */
  reviewCount?: number;
  /** 综合评分（用户打分） */
  rating?: number;
  status?: 'online' | 'offline' | 'unknown';
  /** 近期用户评价摘要 */
  recentFeedback?: string;
  /** 已知问题/风险描述 */
  riskNote?: string;
}

export interface ProvidersData {
  providers: Provider[];
  lastUpdated: string;
  totalCount: number;
  recommendedCount: number;
}
