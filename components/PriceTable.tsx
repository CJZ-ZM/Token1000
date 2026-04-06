import { Provider } from '@/types';

interface PriceTableProps {
  providers: Provider[];
  modelKey: string;
}

export default function PriceTable({ providers, modelKey }: PriceTableProps) {
  const inputKey = `${modelKey}_input`;
  const outputKey = `${modelKey}_output`;

  // Find cheapest prices
  const validProviders = providers.filter(p => p.pricing[inputKey] !== undefined && p.pricing[outputKey] !== undefined);
  const prices = validProviders.map(p => ({
    provider: p,
    input: p.pricing[inputKey] as number,
    output: p.pricing[outputKey] as number,
  }));
  
  const cheapestInput = prices.length > 0 ? Math.min(...prices.map(p => p.input)) : 0;
  const cheapestOutput = prices.length > 0 ? Math.min(...prices.map(p => p.output)) : 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 rounded-l-lg">服务商</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">输入价格<br /><span className="text-xs font-normal text-gray-500">(¥/K tokens)</span></th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 rounded-r-lg">输出价格<br /><span className="text-xs font-normal text-gray-500">(¥/K tokens)</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {prices.map((item, index) => {
            const provider = item.provider;
            const inputPrice = item.input;
            const outputPrice = item.output;
            const isCheapestInput = inputPrice === cheapestInput;
            const isCheapestOutput = outputPrice === cheapestOutput;

            return (
              <tr key={provider.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-xs text-gray-500">{provider.models.slice(0, 3).join(', ')}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`font-semibold ${isCheapestInput ? 'text-green-600' : 'text-gray-900'}`}>
                    ¥{inputPrice.toFixed(2)}
                  </span>
                  {isCheapestInput && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      最便宜
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`font-semibold ${isCheapestOutput ? 'text-green-600' : 'text-gray-900'}`}>
                    ¥{outputPrice.toFixed(2)}
                  </span>
                  {isCheapestOutput && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      最便宜
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {prices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无该模型的价格数据
        </div>
      )}
    </div>
  );
}
