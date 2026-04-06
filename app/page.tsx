'use client';

import Link from 'next/link';
import { loadProviders } from '@/lib/data';
import ProviderCard from '@/components/ProviderCard';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const providers = loadProviders();
  const featuredProviders = [...providers]
    .sort((a, b) => b.stability - a.stability)
    .slice(0, 3);

  const totalModels = new Set(providers.flatMap(p => p.models)).size;
  const avgStability = (providers.reduce((sum, p) => sum + p.stability, 0) / providers.length).toFixed(1);

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/zhan?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Token1000
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4">
              中文大模型 API 中转站导航
            </p>
            <p className="text-blue-200 mb-10">
              收录全网热门中转站，实时比价，帮您找到最便宜、最稳定的 API 服务
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <p className="text-sm text-blue-100 mb-3">快速搜索</p>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="搜索中转站名称或模型..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{providers.length}</div>
              <div className="text-gray-600 mt-1">收录中转站</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{totalModels}</div>
              <div className="text-gray-600 mt-1">支持模型</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{avgStability}</div>
              <div className="text-gray-600 mt-1">平均稳定性评分</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">推荐服务商</h2>
            <Link href="/zhan" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">为什么选择 Token1000</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">实时价格对比</h3>
              <p className="text-gray-600 text-sm">整合全网主流中转站的价格数据，一目了然找到最低价</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">稳定性监测</h3>
              <p className="text-gray-600 text-sm">基于真实用户反馈，持续追踪各服务商稳定性表现</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">接入教程</h3>
              <p className="text-gray-600 text-sm">提供详细的对接文档和常见问题解答，快速上手</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">开始比价</h2>
          <p className="text-gray-600 mb-8">浏览全部收录的中转站，比较价格和稳定性</p>
          <Link 
            href="/jiage" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
