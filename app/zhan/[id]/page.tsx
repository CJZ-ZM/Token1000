import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadProviders, getProviderById, getPriceForModel } from '@/lib/data';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const provider = getProviderById(id);
  if (!provider) return { title: '未找到' };
  return {
    title: `${provider.name} - Token1000`,
    description: `${provider.name} API 中转站详情，包含价格、支持的模型、稳定性评分等信息`,
  };
}

export async function generateStaticParams() {
  const providers = loadProviders();
  return providers.map((p) => ({ id: p.id }));
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-gray-600">{rating}.0</span>
    </div>
  );
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;
  const provider = getProviderById(id);

  if (!provider) {
    notFound();
  }

  // Get unique pricing keys
  const pricingKeys = new Set<string>();
  Object.keys(provider.pricing).forEach(key => {
    const base = key.replace('_input', '').replace('_output', '');
    pricingKeys.add(base);
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/zhan" className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回中转站目录
        </Link>

        {/* Provider Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
              <p className="text-gray-600 mb-4">{provider.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">稳定性：</span>
                  <StarRating rating={provider.stability} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">速度：</span>
                  <StarRating rating={provider.speed} />
                </div>
              </div>
            </div>

            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              访问官网
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Supported Models */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">支持的模型</h2>
          <div className="flex flex-wrap gap-2">
            {provider.models.map((model) => (
              <span
                key={model}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700"
              >
                {model}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">价格明细</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">模型</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">输入价格<br /><span className="text-xs font-normal text-gray-500">(¥/K)</span></th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">输出价格<br /><span className="text-xs font-normal text-gray-500">(¥/K)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from(pricingKeys).map((modelKey) => {
                  const prices = getPriceForModel(provider, modelKey);
                  const displayName = modelKey.replace(/_/g, '-');
                  
                  return (
                    <tr key={modelKey}>
                      <td className="px-4 py-4 font-medium text-gray-900">{displayName}</td>
                      <td className="px-4 py-4 text-center text-gray-900">
                        {prices.input !== undefined ? `¥${prices.input.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-900">
                        {prices.output !== undefined ? `¥${prices.output.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {provider.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Compare */}
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 快速对比</h3>
          <p className="text-sm text-gray-600">
            想和其他中转站比较价格？<Link href="/jiage" className="text-blue-500 hover:underline">查看价格对比表</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
