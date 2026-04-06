import Link from 'next/link';
import { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/zhan/${provider.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
            {provider.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="text-yellow-400">★</span>
            <span>{provider.stability}.0</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {provider.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {provider.models.slice(0, 4).map((model) => (
            <span
              key={model}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {model}
            </span>
          ))}
          {provider.models.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{provider.models.length - 4}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {provider.features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 text-xs text-gray-500"
            >
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-gray-500">GPT-4o 输入：</span>
            <span className="font-semibold text-blue-600">
              ¥{provider.pricing.gpt4o_input?.toFixed(2) ?? '-'}
            </span>
            <span className="text-gray-400">/K</span>
          </div>
          <div className="text-blue-500 text-sm group-hover:translate-x-1 transition-transform">
            查看详情 →
          </div>
        </div>
      </div>
    </Link>
  );
}
