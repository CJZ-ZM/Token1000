import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Token1000 - 大模型 API 中转站导航',
  description: '收录全网最全的大模型 API 中转站，支持 GPT-4o、Claude、DeepSeek 等主流模型比价，帮您找到最便宜、最稳定的服务商。',
  keywords: 'API中转站, GPT-4o API, Claude API, DeepSeek API, 大模型API, API代理, AI API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
