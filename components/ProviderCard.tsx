'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
}

function RiskBadge({ level }: { level: Provider['riskLevel'] }) {
  if (level === 'danger') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        🚨 勿入
      </span>
    );
  }
  if (level === 'watch') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        ⚠️ 观察
      </span>
    );
  }
  return null;
}

function TierBadge({ tier }: { tier: Provider['tier'] }) {
  if (tier === 'recommended') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        ⭐ 推荐
      </span>
    );
  }
  if (tier === 'suspicious') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        ❓ 可疑
      </span>
    );
  }
  return null;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        const found = data.results?.find((r: { key: string }) => r.key === provider.id);
        if (found) setStatus(found.status);
      })
      .catch(() => setStatus('unknown'));
  }, [provider.id]);

  const hasVerifiedRating = provider.rating !== null && provider.rating !== undefined;

  return (
    <Link href={`/zhan/${provider.id}`} className="block group">
      <div className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 ${
        provider.riskLevel === 'danger'
          ? 'border-red-300 hover:border-red-400'
          : provider.riskLevel === 'watch'
          ? 'border-yellow-300 hover:border-yellow-400'
          : 'border-gray-200 hover:border-blue-300'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
              {provider.name}
            </h3>
            <TierBadge tier={provider.tier} />
            <RiskBadge level={provider.riskLevel} />
            {!provider.dataVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                ⚠️ 待核实
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
            {hasVerifiedRating ? (
              <>
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{provider.rating!.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-gray-400">★ -</span>
            )}
          </div>
        </div>

        {/* Risk Note */}
        {provider.riskNote && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mb-3">
            {provider.riskNote}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {provider.description}
        </p>

        {/* Models */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.models.slice(0, 4).map((model) => (
            <span
              key={model}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {model}
            </span>
          ))}
          {provider.models.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{provider.models.length - 4}
            </span>
          )}
        </div>

        {/* Trust indicators - only show if verified */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          {provider.stability !== null ? (
            <span className="flex items-center gap-1">
              <span className="text-green-500">●</span>
              稳定 {provider.stability.toFixed(1)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              稳定 -
            </span>
          )}
          {provider.speed !== null ? (
            <span className="flex items-center gap-1">
              ⚡ 速度 {provider.speed.toFixed(1)}
            </span>
          ) : null}
          {provider.reviewCount !== null && provider.reviewCount !== undefined ? (
            <span className="flex items-center gap-1">
              💬 {provider.reviewCount}条评价
            </span>
          ) : null}
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-sm">
            {provider.pricing.gpt4o_input !== undefined ? (
              <>
                <span className="text-gray-500">GPT-4o：</span>
                <span className="font-semibold text-blue-600">
                  ¥{provider.pricing.gpt4o_input.toFixed(2)}
                </span>
                <span className="text-gray-400">/K</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">暂无价格数据</span>
            )}
          </div>
          <div className="text-blue-500 text-sm group-hover:translate-x-1 transition-transform">
            查看详情 →
          </div>
        </div>
      </div>
    </Link>
  );
}
