import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T1K</span>
              </div>
              <span className="text-xl font-bold text-white">Token1000</span>
            </div>
            <p className="text-sm text-gray-400">
              大模型 API 中转站导航平台，帮您找到最便宜、最稳定的 API 服务。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">首页</Link>
              </li>
              <li>
                <Link href="/zhan" className="hover:text-blue-400 transition-colors">中转站目录</Link>
              </li>
              <li>
                <Link href="/jiage" className="hover:text-blue-400 transition-colors">价格对比</Link>
              </li>
              <li>
                <Link href="/bikeng" className="hover:text-red-400 transition-colors">避坑专区</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">帮助与声明</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/bikeng" className="hover:text-red-400 transition-colors">避坑专区</Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-blue-400 transition-colors">接入教程</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">关于我们</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">关于我们</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">联系我们</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500">
          <p className="mb-2">© 2026 Token1000. All rights reserved.</p>
          <p className="text-xs">
            免责声明：Token1000 仅提供信息聚合服务，不提供 API 转发服务。所有价格信息仅供参考，
            请以各服务商官方报价为准。我们不对因使用本平台信息造成的任何损失负责。
          </p>
        </div>
      </div>
    </footer>
  );
}
