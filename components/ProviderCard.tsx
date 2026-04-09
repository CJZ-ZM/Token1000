'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
  healthData?: {
    success_rate_24h: number | null;
    success_rate_7d: number | null;
    avg_latency_24h: number | null;
    last_test_at: string | null;
  } | null;
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

function DataSourceBadge({ source }: { source?: string }) {
  if (source === 'official') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200" title="官方数据">
        官方
      </span>
    );
  }
  if (source === 'automated') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200" title="自动化测试">
        自动
      </span>
    );
  }
  if (source === 'verified') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200" title="人工核实">
        核实
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200" title="社区提交">
      社区
    </span>
  );
}

function HealthIndicator({ healthData }: { healthData: ProviderCardProps['healthData'] }) {
  if (!healthData) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        暂无数据
      </span>
    );
  }

  const { success_rate_24h, success_rate_7d, avg_latency_24h, last_test_at } = healthData;

  // Determine status color based on 24h rate
  let statusColor = 'bg-gray-400';
  let statusText = '未知';

  if (success_rate_24h !== null && success_rate_24h !== undefined) {
    if (success_rate_24h >= 95) {
      statusColor = 'bg-green-500';
      statusText = `${success_rate_24h}%`;
    } else if (success_rate_24h >= 80) {
      statusColor = 'bg-yellow-500';
      statusText = `${success_rate_24h}%`;
    } else {
      statusColor = 'bg-red-500';
      statusText = `${success_rate_24h}%`;
    }
  }

  // Format last test time
  let lastTestText = '';
  if (last_test_at) {
    const lastTest = new Date(last_test_at);
    const now = new Date();
    const diffMs = now.getTime() - lastTest.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      lastTestText = `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      lastTestText = `${diffHours}小时前`;
    } else {
      lastTestText = `${diffDays}天前`;
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Success rate (24h) */}
      <div className="flex items-center gap-1" title="24小时成功率">
        <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
        <span className={success_rate_24h !== null ? 'text-gray-700' : 'text-gray-400'}>
          {statusText}
        </span>
      </div>

      {/* 7-day success rate */}
      {success_rate_7d !== null && success_rate_7d !== undefined && (
        <div className="flex items-center gap-1 text-gray-500" title="7天成功率">
          <span className="text-gray-400">7天</span>
          <span className={success_rate_7d >= 95 ? 'text-green-600' : success_rate_7d >= 80 ? 'text-yellow-600' : 'text-red-600'}>
            {success_rate_7d}%
          </span>
        </div>
      )}

      {/* Latency */}
      {avg_latency_24h !== null && avg_latency_24h !== undefined && (
        <div className="flex items-center gap-1 text-gray-500" title="平均延迟">
          <span>⚡</span>
          <span>{avg_latency_24h}ms</span>
        </div>
      )}

      {/* Last test */}
      {lastTestText && (
        <div className="text-gray-400" title="最后测试">
          {lastTestText}
        </div>
      )}
    </div>
  );
}

export default function ProviderCard({ provider, healthData: initialHealth }: ProviderCardProps) {
  const [healthData, setHealthData] = useState(initialHealth);
  const [status, setStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    // Fetch health data from API
    fetch(`/api/health?type=dns&includeDbHealth=false`)
      .then(res => res.json())
      .then(data => {
        const found = data.results?.find((r: { key: string }) => r.key === provider.id);
        if (found) {
          setStatus(found.status);
        }
      })
      .catch(() => setStatus('unknown'));

    // If we have database health data, use it
    if (!healthData) {
      fetch(`/api/providers/${provider.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.health) {
            setHealthData(data.health);
          }
        })
        .catch(() => {
          // Ignore
        });
    }
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
            <DataSourceBadge source="community" />
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

        {/* Health Status Bar */}
        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <HealthIndicator healthData={healthData} />
          {provider.lastVerified && (
            <span className="text-xs text-gray-400">
              核实于 {provider.lastVerified}
            </span>
          )}
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
          {provider.stability !== null && provider.stability !== undefined ? (
            <span className="flex items-center gap-1">
              <span className="text-green-500">●</span>
              稳定 {provider.stability.toFixed(1)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              稳定 -
            </span>
          )}
          {provider.speed !== null && provider.speed !== undefined ? (
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
