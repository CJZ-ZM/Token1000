'use client';

import { useState } from 'react';
import { loadProviders } from '@/lib/data';
import PriceTable from '@/components/PriceTable';
import Link from 'next/link';

const MODELS = [
  { key: 'gpt4o', label: 'GPT-4o' },
  { key: 'gpt4o_mini', label: 'GPT-4o mini' },
  { key: 'claude35', label: 'Claude-3.5' },
  { key: 'deepseek', label: 'DeepSeek-V3' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'llama3', label: 'Llama-3' },
];

export default function JiagePage() {
  const [selectedModel, setSelectedModel] = useState('gpt4o');
  const providers = loadProviders();

  const currentModel = MODELS.find(m => m.key === selectedModel);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">价格对比</h1>
          <p className="text-gray-600">对比各中转站主流模型的价格，输入和输出分开显示</p>
        </div>

        {/* Model Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {MODELS.map(model => (
              <button
                key={model.key}
                onClick={() => setSelectedModel(model.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Price Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentModel?.label} 价格对比
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              价格单位：¥/K tokens（1K = 1000 tokens）
            </p>
          </div>
          <PriceTable providers={providers} modelKey={selectedModel} />
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 选型建议</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 输入价格适用于提示词（Prompt），输出价格适用于模型回复（Completion）</li>
            <li>• 实际费用 = 输入tokens × 输入单价 + 输出tokens × 输出单价</li>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
