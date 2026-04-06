import { priceAlerts } from '@/lib/priceAlerts';

export default function AlertsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">价格变动</h1>
      <p className="text-gray-600 mb-8">追踪各中转站价格变动，把握最优时机</p>
      
      {priceAlerts.alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">暂无价格变动通知</p>
        </div>
      ) : (
        <div className="space-y-4">
          {priceAlerts.alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.type === 'price_drop' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {alert.type === 'price_drop' ? '📉 降价' : '📈 涨价'}
                  </span>
                  <span className="font-semibold">{alert.provider}</span>
                  <span className="text-gray-500">{alert.model}</span>
                </div>
                <span className="text-gray-400 text-sm">{alert.date}</span>
              </div>
              <p className="text-gray-600 mb-2">{alert.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">原价: <del>${alert.oldPrice}</del></span>
                <span className="text-green-600 font-semibold">现价: ${alert.newPrice}</span>
                <span className="text-green-600">({alert.change})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
