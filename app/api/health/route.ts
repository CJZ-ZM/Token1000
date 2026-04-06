import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';

// 简化的健康检查 - 检查 DNS 解析是否正常
const PROVIDER_DOMAINS: Record<string, string> = {
  'siliconflow': 'api.siliconflow.cn',
  'zhipuai': 'open.bigmodel.cn',
  'deepseek': 'api.deepseek.com',
  'moonshot': 'api.moonshot.cn',
  'minimax': 'api.minimax.chat',
  'baichuan': 'api.baichuan-ai.com',
  'tongyi': 'dashscope.aliyuncs.com',
  'wenxin': 'aip.baidubce.com',
};

async function checkDomain(key: string, domain: string) {
  try {
    await dns.resolve(domain);
    return { key, status: 'online', latency: null };
  } catch {
    return { key, status: 'offline', latency: null };
  }
}

export async function GET() {
  const results = await Promise.all(
    Object.entries(PROVIDER_DOMAINS).map(([key, domain]) => checkDomain(key, domain))
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results
  });
}
