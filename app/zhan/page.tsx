'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { filterProviders, sortProviders, getAllModels } from '@/lib/data';
import ProviderCard from '@/components/ProviderCard';
import SearchBar from '@/components/SearchBar';

const SORT_OPTIONS = [
  { value: 'stability', label: '稳定性' },
  { value: 'speed', label: '速度' },
  { value: 'rating', label: '评分' },
  { value: 'price', label: '价格' },
];

function ZhanContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTier = searchParams.get('tier') || 'all';

  const [search, setSearch] = useState(initialQuery);
  const [selectedModel, setSelectedModel] = useState('全部');
  const [tierFilter, setTierFilter] = useState<string>(initialTier);
  const [sortBy, setSortBy] = useState<'stability' | 'speed' | 'price' | 'rating'>('stability');

  const allModels = getAllModels();
  
  const providers = useMemo(() => {
    const filtered = filterProviders(
      selectedModel !== '全部' ? selectedModel : undefined,
      search || undefined,
      tierFilter !== 'all' ? tierFilter : undefined
    );
    return sortProviders(filtered, sortBy);
  }, [search, selectedModel, sortBy, tierFilter]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">中转站目录</h1>
          <p className="text-gray-600">浏览所有收录的中转站，支持按模型筛选和排序</p>
        </div>

        {/* Risk Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="text-sm text-gray-600 mb-3 block">风险等级：</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: '全部', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
              { value: 'recommended', label: '⭐ 推荐', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { value: 'standard', label: '普通', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
              { value: 'suspicious', label: '❓ 可疑', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTierFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tierFilter === option.value
                    ? 'bg-blue-500 text-white'
                    : option.color
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <SearchBar 
                onSearch={setSearch} 
                placeholder="搜索中转站名称或模型..."
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 whitespace-nowrap">排序：</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Filter */}
          <div className="mt-6">
            <label className="text-sm text-gray-600 mb-3 block">按模型筛选：</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedModel('全部')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedModel === '全部'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {allModels.map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedModel === model
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            共找到 <span className="font-semibold text-gray-900">{providers.length}</span> 个中转站
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">未找到匹配的中转站</h3>
            <p className="text-gray-500">尝试调整筛选条件或搜索关键词</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ZhanPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    }>
      <ZhanContent />
    </Suspense>
  );
}
