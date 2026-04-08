'use client';

import { useState, useMemo } from 'react';
import { loadProviders } from '@/lib/data';
import Link from 'next/link';

const MODELS = [
  { key: 'gpt4o', label: 'GPT-4o', providerKey: 'gpt4o' },
  { key: 'gpt4o_mini', label: 'GPT-4o mini', providerKey: 'gpt4o_mini' },
  { key: 'claude35', label: 'Claude-3.5', providerKey: 'claude35' },
  { key: 'deepseek_v3', label: 'DeepSeek-V3', providerKey: 'deepseek_v3' },
  { key: 'qwen_turbo', label: 'Qwen-Turbo', providerKey: 'qwen_turbo' },
  { key: 'llama3.1_70b', label: 'Llama-3.1-70B', providerKey: 'llama3.1_70b' },
  { key: 'qwen2.5_72b', label: 'Qwen-2.5-72B', providerKey: 'qwen2.5_72b' },
];

export default function JiagePage() {
  const [selectedModel, setSelectedModel] = useState('gpt4o');
  const [sortBy, setSortBy] = useState<'price' | 'stability' | 'rating'>('price');
  const providers = loadProviders();
  const currentModel = MODELS.find(m => m.key === selectedModel);

  const rows = useMemo(() => {
    const inputKey = `${selectedModel}_input`;
    const outputKey = `${selectedModel}_output`;

    return providers
      .map(p => {
        const input = p.pricing[inputKey];
        const output = p.pricing[outputKey];
        return {
          provider: p,
          input,
          output,
          hasData: input !== undefined || output !== undefined,
        };
      })
      .filter(r => r.hasData)
      .sort((a, b) => {
        if (sortBy === 'price') {
          const aVal = a.input ?? Infinity;
          const bVal = b.input ?? Infinity;
          return aVal - bVal;
        }
        if (sortBy === 'stability') return (b.provider.stability ?? 0) - (a.provider.stability ?? 0);
        if (sortBy === 'rating') return (b.provider.rating ?? 0) - (a.provider.rating ?? 0);
        return 0;
      });
  }, [providers, selectedModel, sortBy]);

  const cheapestInput = rows.length > 0 ? Math.min(...rows.filter(r => r.input !== undefined).map(r => r.input!)) : 0;
  const cheapestOutput = rows.length > 0 ? Math.min(...rows.filter(r => r.output !== undefined).map(r => r.output!)) : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">价格对比</h1>
          <p className="text-gray-600">对比各中转站主流模型的价格，输入和输出分开显示</p>
        </div>

        {/* Model Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {MODELS.map(model => (
              <button
                key={model.key}
                onClick={() => setSelectedModel(model.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedModel === model.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-4">
          <span className="text-sm text-gray-600">排序：</span>
          {[
            { value: 'price', label: '价格最低' },
            { value: 'stability', label: '最稳定' },
            { value: 'rating', label: '评分最高' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as typeof sortBy)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Price Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentModel?.label} 价格对比
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              价格单位：¥/K tokens | 🟢 最低价标注
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无 {currentModel?.label} 的价格数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-sm">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">服务商</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">风险</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">稳定</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">评分</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">输入 ¥/K</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">输出 ¥/K</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => {
                    const p = row.provider;
                    const isCheapestInput = row.input === cheapestInput && row.input !== undefined;
                    const isCheapestOutput = row.output === cheapestOutput && row.output !== undefined;

                    return (
                      <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4">
                          <Link href={`/zhan/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {p.name}
                          </Link>
                          {p.tier === 'recommended' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">⭐推荐</span>
                          )}
                          {p.riskLevel === 'danger' && (
                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">🚨勿入</span>
                          )}
                          {p.riskLevel === 'watch' && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded">⚠️观察</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {p.riskLevel === 'safe' && <span className="text-xs text-green-600 font-medium">✅安全</span>}
                          {p.riskLevel === 'watch' && <span className="text-xs text-yellow-600 font-medium">⚠️观察</span>}
                          {p.riskLevel === 'danger' && <span className="text-xs text-red-600 font-medium">🚨危险</span>}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {p.stability !== null ? p.stability.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {p.rating !== null && p.rating !== undefined ? p.rating.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {row.input !== undefined ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className={`font-semibold ${isCheapestInput ? 'text-green-600' : 'text-gray-900'}`}>
                                ¥{row.input.toFixed(2)}
                              </span>
                              {isCheapestInput && (
                                <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">最低</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {row.output !== undefined ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className={`font-semibold ${isCheapestOutput ? 'text-green-600' : 'text-gray-900'}`}>
                                ¥{row.output.toFixed(2)}
                              </span>
                              {isCheapestOutput && (
                                <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">最低</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 选型建议</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 输入价格适用于提示词（Prompt），输出价格适用于模型回复（Completion）</li>
            <li>• 实际费用 = 输入tokens × 输入单价 + 输出tokens × 输出单价</li>
            <li>• 🟢「最低」标注为当前模型该价格段的最低价</li>
            <li>• 稳定性评分基于用户反馈综合评估，仅供参考</li>
            <li>• 建议先小量测试，确认稳定后再大规模使用</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">想了解某个站点的详细信息？</p>
          <Link
            href="/zhan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            浏览全部中转站
          </Link>
        </div>
      </div>
    </div>
  );
}
