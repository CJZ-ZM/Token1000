'use client';

import { loadProviders, getDangerProviders, getRecommendedProviders } from '@/lib/data';
import { Provider } from '@/types';
import Link from 'next/link';

function RiskBadge({ level }: { level: Provider['riskLevel'] }) {
  if (level === 'danger') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        🚨 勿入
      </span>
    );
  }
  if (level === 'watch') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        ⚠️ 观察
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      ✅ 安全
    </span>
  );
}

function ProviderRiskCard({ provider }: { provider: Provider }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{provider.name}</h3>
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            {provider.url} →
          </a>
        </div>
        <RiskBadge level={provider.riskLevel} />
      </div>

      {provider.riskNote && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-3">
          ⚠️ {provider.riskNote}
        </p>
      )}

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{provider.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-4">
          <span>稳定 {provider.stability}</span>
          <span>速度 {provider.speed}</span>
          {provider.reviewCount !== undefined && (
            <span>评价 {provider.reviewCount}条</span>
          )}
        </div>
        {provider.lastVerified && (
          <span>验证: {provider.lastVerified}</span>
        )}
      </div>

      {provider.recentFeedback && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">「{provider.recentFeedback}」</p>
        </div>
      )}
    </div>
  );
}

function HistoryItem({
  title,
  date,
  description,
  severity
}: {
  title: string;
  date: string;
  description: string;
  severity: 'runaway' | 'price_hike' | 'service_down';
}) {
  const config = {
    runaway: { label: '🚨 跑路', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    price_hike: { label: '📈 涨价', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    service_down: { label: '🔴 服务异常', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  };
  const c = config[severity];

  return (
    <div className={`border rounded-lg p-4 ${c.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}

export default function BikengPage() {
  const allProviders = loadProviders();
  const dangerProviders = getDangerProviders();
  const recommendedProviders = getRecommendedProviders();

  const runawayProviders = allProviders.filter(
    p => p.riskLevel === 'danger' && p.riskNote?.includes('跑路')
  );
  const watchProviders = allProviders.filter(p => p.riskLevel === 'watch');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🛡️ 避坑专区
            </h1>
            <p className="text-red-100 text-lg mb-6">
              帮用户远离跑路、涨价、不稳定的服务商。
              <br />
              每一条记录都有时间戳和证据，让骗子无处遁形。
            </p>
            <div className="flex gap-3">
              <Link
                href="/zhan?tier=suspicious"
                className="px-5 py-2.5 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                查看可疑中转站
              </Link>
              <button
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-400 transition-colors border border-red-400"
              >
                我要举报
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-red-600">{dangerProviders.length}</div>
            <div className="text-sm text-gray-600 mt-1">高风险中转站</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-yellow-600">{watchProviders.length}</div>
            <div className="text-sm text-gray-600 mt-1">需要观察</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-green-600">{recommendedProviders.length}</div>
            <div className="text-sm text-gray-600 mt-1">已验证推荐</div>
          </div>
        </div>

        {/* 🚨 高风险预警 */}
        {dangerProviders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">🚨 高风险预警</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                勿入
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              以下中转站存在跑路风险或已有大量用户反馈问题，请立即停用或勿首次充值。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dangerProviders.map(p => (
                <ProviderRiskCard key={p.id} provider={p} />
              ))}
            </div>
          </section>
        )}

        {/* ⚠️ 风险观察 */}
        {watchProviders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">⚠️ 风险观察</h2>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full font-medium">
                谨慎
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              以下中转站近期有稳定性波动、价格异常或其他问题，需要持续观察。建议先小量测试。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchProviders.map(p => (
                <ProviderRiskCard key={p.id} provider={p} />
              ))}
            </div>
          </section>
        )}

        {/* 历史避坑记录 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📜 历史避坑记录</h2>
          <div className="space-y-3">
            <HistoryItem
              title="Weelinking"
              date="2026-04-07"
              description="多名用户反馈充值后不到账，客服失联超过72小时。建议已充值的用户尽快联系并提现。"
              severity="runaway"
            />
            <HistoryItem
              title="OpenAI Hub"
              date="2026-04-05"
              description="GPT-4o 价格突然上涨 40%，从 3.0 调整至 4.2。性价比骤降，用户口碑下滑。"
              severity="price_hike"
            />
            <HistoryItem
              title="LinkAI"
              date="2026-04-03"
              description="连续3天出现间歇性服务中断，高峰期可用率低于 70%。官方尚未给出说明。"
              severity="service_down"
            />
            <HistoryItem
              title="BestAI"
              date="2026-03-28"
              description="新站上线不足1个月，用户基数少，缺乏长期稳定性数据。建议观察2-3个月再决定是否长期使用。"
              severity="service_down"
            />
          </div>
        </section>

        {/* 如何避坑 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 避坑指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">💰 充值原则</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 首次充值不超过 50 元，先测试稳定性</li>
                <li>• 优先选择运营超过 6 个月的中转站</li>
                <li>• 避免在价格异常低廉的新站大额充值</li>
                <li>• 优先选择有退款渠道的服务商</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">⚠️ 危险信号</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 价格远低于市场平均（便宜太多不可信）</li>
                <li>• 无法联系到客服或客服响应超过48小时</li>
                <li>• 频繁更换域名或主体信息</li>
                <li>• 社交媒体/群聊中有大量负面投诉</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">✅ 选站标准</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Token1000 推荐标记的中转站</li>
                <li>• 有真实用户评价（不是空白的）</li>
                <li>• 运营时间超过 6 个月</li>
                <li>• 有稳定的价格调整历史（不突然暴涨）</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">📢 举报流程</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 发现问题第一时间在此页面提交</li>
                <li>• 提供截图、充值记录等证据</li>
                <li>• 平台审核后 24 小时内更新状态</li>
                <li>• 重要预警会通过 Token1000 通知用户</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 推荐区域 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">✅ 已验证安全</h2>
          <p className="text-sm text-gray-600 mb-4">
            以下中转站经过 Token1000 验证，稳定性、用户口碑、价格均表现良好。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProviders.slice(0, 6).map(p => (
              <ProviderRiskCard key={p.id} provider={p} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/zhan"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
            >
              查看全部 {recommendedProviders.length} 家中转站
              →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
