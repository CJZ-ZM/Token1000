'use client';

import { useState } from 'react';
import { Provider } from '@/types';

interface PriceSubmitFormProps {
  provider: Provider;
  onSubmitSuccess?: () => void;
}

interface FormData {
  modelKey: string;
  inputPrice: string;
  outputPrice: string;
  evidence: string;
}

export default function PriceSubmitForm({ provider, onSubmitSuccess }: PriceSubmitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    modelKey: '',
    inputPrice: '',
    outputPrice: '',
    evidence: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: provider.id,
          modelKey: formData.modelKey,
          inputPrice: formData.inputPrice ? parseFloat(formData.inputPrice) : undefined,
          outputPrice: formData.outputPrice ? parseFloat(formData.outputPrice) : undefined,
          evidence: formData.evidence || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '提交失败');
      }

      setSubmitted(true);
      setIsOpen(false);
      onSubmitSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get unique model keys from pricing
  const modelKeys = Object.keys(provider.pricing).filter(k => k.endsWith('_input'));

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-lg">✓</span>
          <span className="font-medium">感谢您的提交！</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          我们会尽快核实您提交的价格信息。
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-green-700 underline"
        >
          提交另一个价格
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-2"
      >
        <span>📝</span>
        <span>报告价格更新</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">报告价格更新</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Model Selection */}
        <div>
          <label htmlFor="modelKey" className="block text-sm font-medium text-gray-700 mb-1">
            选择模型
          </label>
          <select
            id="modelKey"
            name="modelKey"
            value={formData.modelKey}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择模型</option>
            {modelKeys.map(key => {
              const modelName = key.replace('_input', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return (
                <option key={key} value={key}>
                  {modelName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Input Price */}
        <div>
          <label htmlFor="inputPrice" className="block text-sm font-medium text-gray-700 mb-1">
            输入价格 (¥/K tokens)
          </label>
          <input
            type="number"
            id="inputPrice"
            name="inputPrice"
            value={formData.inputPrice}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="如: 0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">当前记录价格: ¥{provider.pricing[formData.modelKey]?.toFixed(2) ?? '-'}</p>
        </div>

        {/* Output Price */}
        <div>
          <label htmlFor="outputPrice" className="block text-sm font-medium text-gray-700 mb-1">
            输出价格 (¥/K tokens)
          </label>
          <input
            type="number"
            id="outputPrice"
            name="outputPrice"
            value={formData.outputPrice}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="如: 1.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            当前记录价格: ¥{provider.pricing[formData.modelKey.replace('_input', '_output')]?.toFixed(2) ?? '-'}
          </p>
        </div>

        {/* Evidence */}
        <div>
          <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
            证据/说明 (可选)
          </label>
          <textarea
            id="evidence"
            name="evidence"
            value={formData.evidence}
            onChange={handleInputChange}
            rows={2}
            placeholder="如: 官网最新价格、截图日期等"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '提交价格更新'}
        </button>
      </form>
    </div>
  );
}
