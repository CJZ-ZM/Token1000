import Link from 'next/link';
import { guides } from '@/lib/guides';
import { notFound } from 'next/navigation';

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = guides.find(g => g.id === id);
  if (!guide) notFound();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/guides" className="text-blue-500 hover:text-blue-600 mb-6 inline-block">← 返回教程列表</Link>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{guide.category}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{guide.provider}</span>
          <span className="text-gray-400 text-xs">阅读时长 {guide.readTime}</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">{guide.title}</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">{guide.description}</p>
          {/* 详细内容后续填充 */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">📝 教程详细内容即将上线...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
