'use client';

import Link from 'next/link';
import { loadProviders, getRecommendedProviders, getDangerProviders } from '@/lib/data';
import ProviderCard from '@/components/ProviderCard';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const providers = loadProviders();
  const recommendedProviders = getRecommendedProviders();
  const dangerProviders = getDangerProviders();
  const featuredProviders = recommendedProviders.slice(0, 3);

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/zhan?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      {/* Hero Section - 聚焦避坑痛点 */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              已发现 {dangerProviders.length} 家中转站存在高风险
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              你在用的那家
              <br />
              <span className="text-blue-400">API 中转站</span>，还活着吗？
            </h1>
            <p className="text-xl text-gray-400 mb-4">
              跑路、涨价、稳定性崩盘——这些问题我们帮你盯着。
            </p>
            <p className="text-gray-500 mb-10">
              帮用户避坑、找靠谱省钱渠道的导航平台
            </p>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-lg mx-auto border border-white/10">
              <p className="text-sm text-gray-400 mb-3">🔍 搜索中转站或模型</p>
              <SearchBar
                onSearch={handleSearch}
                placeholder="搜索中转站名称或模型..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/bikeng"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                🚨 查看避坑记录
              </Link>
              <Link
                href="/zhan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
              >
                📋 浏览 {providers.length} 家中转站
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{providers.length}</div>
              <div className="text-sm text-gray-600 mt-1">收录中转站</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600">{recommendedProviders.length}</div>
              <div className="text-sm text-gray-600 mt-1">已验证推荐</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-600">{dangerProviders.length}</div>
              <div className="text-sm text-gray-600 mt-1">高风险勿入</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600">
                {providers.filter(p => p.riskLevel === 'watch').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">需观察</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚨 避坑专区 - 核心差异化 */}
      {dangerProviders.length > 0 && (
        <section className="py-14 bg-red-50 border-y border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🚨 高风险预警</h2>
                <p className="text-sm text-gray-600 mt-1">以下中转站疑似跑路或存在重大风险，请立即停用</p>
              </div>
              <Link href="/bikeng" className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1">
                全部避坑记录 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dangerProviders.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 推荐服务商 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⭐ 已验证推荐</h2>
              <p className="text-sm text-gray-600 mt-1">经过 Token1000 验证，稳定性好、用户口碑佳</p>
            </div>
            <Link href="/zhan?tier=recommended" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium text-sm">
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 价值主张 */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">为什么用户选择 Token1000</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">有人帮你避坑</h3>
              <p className="text-gray-400 text-sm">
                跑路预警、涨价监控、稳定性追踪——你不需要自己盯着每家中转站，我们帮你盯。
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">真实数据驱动</h3>
              <p className="text-gray-400 text-sm">
                不是官网宣传，不是软文，是真实用户反馈 + 主动探测的数据。所有人都能看到每家中转站的真实评分。
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">帮你省钱</h3>
              <p className="text-gray-400 text-sm">
                一个地方对比所有中转站价格，找到最适合你用量和预算的方案，不花冤枉钱。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 价格对比 CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">开始比价</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            对比各家中转站的主流模型价格，找到性价比最高的方案
          </p>
          <Link
            href="/jiage"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            查看价格对比表
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
