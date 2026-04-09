'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  providerId: string | null;
  providerName: string | null;
  modelKey: string;
  newInputPrice: number | null;
  newOutputPrice: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'duplicate';
  evidence: string | null;
  createdAt: string;
}

function StatusBadge({ status }: { status: Submission['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          ⏳ 待审核
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          ✓ 已采纳
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          ✕ 已拒绝
        </span>
      );
    case 'duplicate':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          📋 重复
        </span>
      );
  }
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll show a message that submissions are stored in the database
      setSubmissions([]);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">价格提交记录</h1>
          <p className="text-gray-600">
            查看社区提交的价格更新记录。所有人都可以提交价格更新，我们会尽快核实。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
            <div className="text-sm text-gray-500">总提交数</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{submissions.filter(s => s.status === 'pending').length}</div>
            <div className="text-sm text-gray-500">待审核</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === 'approved').length}</div>
            <div className="text-sm text-gray-500">已采纳</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{submissions.filter(s => s.status === 'rejected').length}</div>
            <div className="text-sm text-gray-500">已拒绝</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待审核' : f === 'approved' ? '已采纳' : '已拒绝'}
            </button>
          ))}
        </div>

        {/* Submission List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-gray-900 font-medium mb-2">暂无提交记录</div>
            <div className="text-gray-500 text-sm">
              去供应商详情页提交价格更新吧！
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {submission.providerName || '未知供应商'}
                      </span>
                      <StatusBadge status={submission.status} />
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      模型: {submission.modelKey}
                    </div>
                    <div className="flex gap-4 text-sm">
                      {submission.newInputPrice !== null && (
                        <span>
                          输入: <span className="font-medium text-gray-900">¥{submission.newInputPrice.toFixed(2)}</span>
                        </span>
                      )}
                      {submission.newOutputPrice !== null && (
                        <span>
                          输出: <span className="font-medium text-gray-900">¥{submission.newOutputPrice.toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                    {submission.evidence && (
                      <div className="mt-2 text-sm text-gray-500 italic">
                        证据: {submission.evidence}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(submission.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How to Submit */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h2 className="font-semibold text-blue-900 mb-3">如何提交价格更新？</h2>
          <ol className="text-sm text-blue-700 space-y-2">
            <li>1. 前往任意供应商详情页面</li>
            <li>2. 点击「报告价格更新」按钮</li>
            <li>3. 选择模型，填写新价格</li>
            <li>4. 可选择提供证据（截图、官网链接等）</li>
            <li>5. 提交后，我们会尽快核实</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
