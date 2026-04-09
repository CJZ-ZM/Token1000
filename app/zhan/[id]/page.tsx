'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProviderById } from '@/lib/data';
import { Provider } from '@/types';
import PriceSubmitForm from '@/components/PriceSubmitForm';
import AffiliateLink from '@/components/AffiliateLink';

function RiskBadge({ level }: { level: Provider['riskLevel'] }) {
  if (level === 'danger') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        🚨 勿入 — 存在高风险
      </span>
    );
  }
  if (level === 'watch') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <span className="w-2 h-2 rounded-full bg-yellow-500" />
        ⚠️ 观察 — 存在一定风险
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      ✅ 安全 — 暂无已知风险
    </span>
  );
}

function TierBadge({ tier }: { tier: Provider['tier'] }) {
  if (tier === 'recommended') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        ⭐ Token1000 推荐
      </span>
    );
  }
  if (tier === 'suspicious') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        ❓ 可疑
      </span>
    );
  }
  return null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProviderDetailPage({ params }: PageProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      const p = getProviderById(resolvedParams.id);
      setProvider(p ?? null);
      setDataLoaded(true);
    }
  }, [resolvedParams]);

  if (!resolvedParams) return null;

  if (dataLoaded && provider === null) {
    notFound();
  }

  if (!provider) return null;

  const pricingEntries = Object.entries(provider.pricing).filter(([, v]) => v !== undefined);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className={`border-b ${provider.riskLevel === 'danger' ? 'bg-red-50 border-red-200' : provider.riskLevel === 'watch' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link href="/zhan" className="text-sm text-gray-500 hover:text-blue-500 flex items-center gap-1">
              ← 返回中转站目录
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                <TierBadge tier={provider.tier} />
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <RiskBadge level={provider.riskLevel} />
                {provider.tier === 'recommended' && (
                  <span className="text-sm text-gray-500">
                    ★ {provider.rating?.toFixed(1)} · {provider.reviewCount}条评价
                  </span>
                )}
              </div>

              {provider.riskNote && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium">⚠️ {provider.riskNote}</p>
                </div>
              )}

              <p className="text-gray-600 mb-4 max-w-2xl">{provider.description}</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  访问官网 →
                </a>
                {provider.affiliateUrl && (
                  <a
                    href={provider.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🔗 通过Token1000注册（支持我们）
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <div className="text-center bg-white rounded-xl border border-gray-200 p-4 min-w-[90px]">
                <div className="text-2xl font-bold text-blue-600">{provider.stability?.toFixed(1) ?? '-'}</div>
                <div className="text-xs text-gray-500 mt-1">稳定性</div>
              </div>
              <div className="text-center bg-white rounded-xl border border-gray-200 p-4 min-w-[90px]">
                <div className="text-2xl font-bold text-blue-600">{provider.speed?.toFixed(1) ?? '-'}</div>
                <div className="text-xs text-gray-500 mt-1">速度</div>
              </div>
              <div className="text-center bg-white rounded-xl border border-gray-200 p-4 min-w-[90px]">
                <div className="text-2xl font-bold text-blue-600">{provider.reviewCount ?? 0}</div>
                <div className="text-xs text-gray-500 mt-1">评价</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 支持模型 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">支持模型</h2>
              <div className="flex flex-wrap gap-2">
                {provider.models.map(model => (
                  <span
                    key={model}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>

            {/* 价格表 */}
            {pricingEntries.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">价格明细</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-sm">
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 rounded-l-lg">模型</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700 rounded-r-lg">输入 ¥/K</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700 rounded-r-lg">输出 ¥/K</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pricingEntries.map(([key, value]) => {
                        const label = key.replace(/_input$|_output$/, '').replace(/_/g, ' ');
                        const isInput = key.endsWith('_input');
                        const modelLabel = isInput ? label : label;
                        const outputKey = key.replace('_input', '_output');
                        const outputVal = provider.pricing[outputKey];

                        if (!isInput) return null;

                        return (
                          <tr key={key}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{modelLabel}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                              ¥{value!.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                              {outputVal !== undefined ? `¥${outputVal.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 最新用户反馈 */}
            {provider.recentFeedback && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">用户评价摘要</h2>
                <blockquote className="text-gray-600 italic border-l-4 border-blue-300 pl-4">
                  「{provider.recentFeedback}」
                </blockquote>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">基本信息</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">官网</dt>
                  <dd className="text-gray-900">
                    <AffiliateLink
                      providerId={provider.id}
                      providerName={provider.name}
                      targetUrl={provider.affiliateUrl || provider.url}
                      variant="link"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      访问 →
                    </AffiliateLink>
                  </dd>
                </div>
                {provider.affiliateUrl && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Token1000链接</dt>
                    <dd className="text-green-600 font-medium">⭐ 推荐</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">验证时间</dt>
                  <dd className="text-gray-900">{provider.lastVerified ?? '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">功能</dt>
                  <dd className="text-gray-900 text-right">{provider.features.join('、')}</dd>
                </div>
              </dl>
            </div>

            {/* 联盟佣金透明度提示 */}
            {provider.affiliateUrl && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💚</span>
                  <div>
                    <div className="font-medium text-green-800 text-sm">支持 Token1000 继续运营</div>
                    <p className="text-xs text-green-600 mt-1">
                      您通过此链接访问并充值时，我们会获得一点佣金分成。这不会影响您的实际支付价格，也不会收取任何额外费用。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 安全提示 */}
            {provider.riskLevel === 'danger' || provider.riskLevel === 'watch' ? (
              <div className={`rounded-xl border p-6 ${provider.riskLevel === 'danger' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <h3 className={`text-sm font-semibold mb-3 ${provider.riskLevel === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {provider.riskLevel === 'danger' ? '🚨 安全警告' : '⚠️ 风险提示'}
                </h3>
                <p className={`text-sm ${provider.riskLevel === 'danger' ? 'text-red-600' : 'text-yellow-700'}`}>
                  {provider.riskNote ?? '请谨慎使用，建议先小量测试。'}
                </p>
              </div>
            ) : null}

            {/* 避坑指南 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">避坑指南</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 首次充值不超过 50 元</li>
                <li>• 先测试稳定性再大规模使用</li>
                <li>• 关注 Token1000 预警通知</li>
                <li>• 发现问题第一时间反馈给我们</li>
              </ul>
              <Link href="/bikeng" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 font-medium">
                查看全部避坑记录 →
              </Link>
            </div>

            {/* 价格提交 */}
            <PriceSubmitForm provider={provider} />
          </div>
        </div>
      </div>
    </div>
  );
}
