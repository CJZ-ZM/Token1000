'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  provider_id: string | null;
  provider_name: string | null;
  model_key: string;
  new_input_price: number | null;
  new_output_price: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'duplicate';
  evidence: string | null;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = async (key: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/submissions?status=pending`, {
        headers: {
          'x-admin-key': key,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('认证失败，请检查 Admin API Key');
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: string, action: 'approve' | 'reject' | 'duplicate') => {
    if (!adminKey) return;

    setProcessing(submissionId);
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          submissionId,
          action,
          reviewedBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review');
      }

      // Remove from list
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (err) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">管理员登录</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin API Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入 Admin API Key"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          <button
            onClick={() => fetchSubmissions(adminKey)}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
          >
            登录
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            默认 Key: token1000-admin-key (仅本地开发使用)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">提交审核</h1>
            <p className="text-gray-600">审核用户提交的价格更新</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setAdminKey('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
            <button
              onClick={() => fetchSubmissions(adminKey)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              刷新
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{submissions.length}</div>
            <div className="text-sm text-gray-500">待审核</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.new_input_price !== null).length}
            </div>
            <div className="text-sm text-gray-500">价格更新</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(submissions.map(s => s.provider_id)).size}
            </div>
            <div className="text-sm text-gray-500">涉及供应商</div>
          </div>
        </div>

        {/* Submission List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">✓</div>
            <div className="text-gray-900 font-medium">暂无待审核的提交</div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(submission => (
              <div key={submission.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-medium text-gray-900 text-lg">
                      {submission.provider_name || '未知供应商'}
                      {submission.provider_id && (
                        <span className="ml-2 text-sm text-gray-400">({submission.provider_id})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      提交时间: {new Date(submission.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">模型</div>
                    <div className="font-medium text-gray-900">{submission.model_key}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">新价格</div>
                    <div className="font-medium text-gray-900">
                      {submission.new_input_price !== null && (
                        <span>输入: ¥{submission.new_input_price.toFixed(2)}</span>
                      )}
                      {submission.new_output_price !== null && (
                        <span className="ml-2">输出: ¥{submission.new_output_price.toFixed(2)}</span>
                      )}
                      {!submission.new_input_price && !submission.new_output_price && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {submission.evidence && (
                  <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-blue-500 mb-1">用户提供的证据</div>
                    {submission.evidence}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleReview(submission.id, 'approve')}
                    disabled={processing === submission.id}
                    className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    ✓ 采纳
                  </button>
                  <button
                    onClick={() => handleReview(submission.id, 'reject')}
                    disabled={processing === submission.id}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    ✕ 拒绝
                  </button>
                  <button
                    onClick={() => handleReview(submission.id, 'duplicate')}
                    disabled={processing === submission.id}
                    className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    📋 重复
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
