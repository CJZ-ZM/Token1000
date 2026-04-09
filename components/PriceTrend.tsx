'use client';

interface PriceTrendProps {
  priceHistory?: Array<{
    date: string;
    inputPrice: number | null;
    outputPrice: number | null;
  }>;
  currentInputPrice?: number;
  currentOutputPrice?: number;
  modelKey?: string;
}

export default function PriceTrend({
  priceHistory = [],
  currentInputPrice,
  currentOutputPrice,
  modelKey = 'GPT-4o',
}: PriceTrendProps) {
  // If no history, show current price with indicator
  if (priceHistory.length === 0) {
    return (
      <div className="flex items-center gap-4 text-sm">
        {currentInputPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">输入:</span>
            <span className="font-semibold text-gray-900">¥{currentInputPrice.toFixed(2)}</span>
            <span className="text-gray-400">/K</span>
          </div>
        )}
        {currentOutputPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">输出:</span>
            <span className="font-semibold text-gray-900">¥{currentOutputPrice.toFixed(2)}</span>
            <span className="text-gray-400">/K</span>
          </div>
        )}
      </div>
    );
  }

  // Calculate trend
  const latest = priceHistory[priceHistory.length - 1];
  const oldest = priceHistory[0];

  const inputChange = latest.inputPrice !== null && oldest.inputPrice !== null
    ? ((latest.inputPrice - oldest.inputPrice) / oldest.inputPrice) * 100
    : null;

  const outputChange = latest.outputPrice !== null && oldest.outputPrice !== null
    ? ((latest.outputPrice - oldest.outputPrice) / oldest.outputPrice) * 100
    : null;

  return (
    <div className="space-y-3">
      {/* Current prices */}
      <div className="flex items-center gap-4 text-sm">
        {currentInputPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">输入:</span>
            <span className="font-semibold text-gray-900">¥{currentInputPrice.toFixed(2)}</span>
            <span className="text-gray-400">/K</span>
            {inputChange !== null && (
              <TrendBadge change={inputChange} />
            )}
          </div>
        )}
        {currentOutputPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">输出:</span>
            <span className="font-semibold text-gray-900">¥{currentOutputPrice.toFixed(2)}</span>
            <span className="text-gray-400">/K</span>
            {outputChange !== null && (
              <TrendBadge change={outputChange} />
            )}
          </div>
        )}
      </div>

      {/* Mini sparkline chart */}
      <div className="h-12 flex items-end gap-0.5">
        {priceHistory.map((entry, i) => {
          const maxPrice = Math.max(
            ...priceHistory.map(e => Math.max(e.inputPrice ?? 0, e.outputPrice ?? 0))
          );
          const minPrice = Math.min(
            ...priceHistory.map(e => Math.min(e.inputPrice ?? Infinity, e.outputPrice ?? Infinity))
          );
          const range = maxPrice - minPrice || 1;

          const inputHeight = entry.inputPrice !== null
            ? ((entry.inputPrice - minPrice) / range) * 100
            : 0;
          const outputHeight = entry.outputPrice !== null
            ? ((entry.outputPrice - minPrice) / range) * 100
            : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end gap-0.5"
              title={`${entry.date}: ¥${entry.inputPrice?.toFixed(2) ?? '-'}/¥${entry.outputPrice?.toFixed(2) ?? '-'}`}
            >
              <div
                className="w-full bg-blue-300 rounded-t"
                style={{ height: `${Math.max(inputHeight, 5)}%` }}
              />
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${Math.max(outputHeight, 5)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-300 rounded" />
          <span>输入</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded" />
          <span>输出</span>
        </div>
        <span className="ml-auto">{priceHistory.length}个数据点</span>
      </div>
    </div>
  );
}

function TrendBadge({ change }: { change: number }) {
  if (change === 0) {
    return <span className="text-gray-400 text-xs">持平</span>;
  }

  const isPositive = change > 0;
  const isNegative = change < 0;

  if (isNegative) {
    return (
      <span className="text-green-600 text-xs font-medium flex items-center gap-0.5">
        <span>↓</span>
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="text-red-600 text-xs font-medium flex items-center gap-0.5">
      <span>↑</span>
      {change.toFixed(1)}%
    </span>
  );
}
