'use client';

interface TestResult {
  testAt: string;
  success: boolean;
  latencyMs: number | null;
}

interface AvailabilityTrendProps {
  testResults?: TestResult[];
  providerName?: string;
}

export default function AvailabilityTrend({
  testResults = [],
  providerName = '该供应商',
}: AvailabilityTrendProps) {
  // If no test results, show placeholder
  if (testResults.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        暂无测试数据
      </div>
    );
  }

  // Calculate stats
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  const successRate = (successCount / totalCount) * 100;
  const avgLatency = testResults
    .filter(r => r.success && r.latencyMs !== null)
    .reduce((sum, r) => sum + (r.latencyMs || 0), 0) / successCount || 0;

  // Get last 20 results for the chart
  const recentResults = testResults.slice(-20);

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">成功率</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {successCount}/{totalCount}
          </div>
          <div className="text-xs text-gray-500">成功/总计</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {avgLatency.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500">平均延迟</div>
        </div>
      </div>

      {/* Visual chart */}
      <div className="flex items-center gap-0.5 h-16">
        {recentResults.map((result, i) => {
          const latencyHeight = result.latencyMs
            ? Math.min((result.latencyMs / 5000) * 100, 100) // Cap at 5s
            : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end"
              title={`${new Date(result.testAt).toLocaleString()}: ${result.success ? '成功' + (result.latencyMs ? ` (${result.latencyMs}ms)` : '') : '失败'}`}
            >
              {result.success ? (
                <div
                  className="w-full bg-green-400 rounded-t transition-all hover:bg-green-500"
                  style={{ height: `${Math.max(latencyHeight, 20)}%` }}
                />
              ) : (
                <div className="w-full bg-red-400 rounded-t h-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded" />
          <span>成功</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-400 rounded" />
          <span>失败</span>
        </div>
        <span>最近{recentResults.length}次测试</span>
      </div>
    </div>
  );
}
