import Link from 'next/link';
import { guides } from '@/lib/guides';

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">教程中心</h1>
      <p className="text-gray-600 mb-8">从入门到精通，这里有你想知道的一切</p>
      
      <div className="grid gap-6">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/guides/${guide.id}`} className="block">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{guide.category}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{guide.difficulty}</span>
                <span className="text-gray-400 text-xs">{guide.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">{guide.title}</h2>
              <p className="text-gray-600">{guide.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
