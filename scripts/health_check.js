/**
 * 健康检查脚本
 * 测试各中转站的可用性
 */

const https = require('https');

const PROVIDERS = {
  'siliconflow': { name: 'SiliconFlow', testUrl: 'https://api.siliconflow.cn/v1/models', timeout: 5000 },
  'zhipuai': { name: '智谱AI', testUrl: 'https://open.bigmodel.cn/api/paas/v4/models', timeout: 5000 },
  'deepseek': { name: 'DeepSeek', testUrl: 'https://api.deepseek.com/v1/models', timeout: 5000 },
  'moonshot': { name: 'Moonshot AI', testUrl: 'https://api.moonshot.cn/v1/models', timeout: 5000 },
  'minimax': { name: 'MiniMax', testUrl: 'https://api.minimax.chat/v1/models', timeout: 5000 },
  'baichuan': { name: '百川智能', testUrl: 'https://api.baichuan-ai.com/v1/models', timeout: 5000 },
  'tongyi': { name: '通义千问', testUrl: 'https://dashscope.aliyuncs.com/api/v1/models', timeout: 5000 },
  'wenxin': { name: '文心一言', testUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/embeddings', timeout: 5000 },
};

async function checkProvider(key, config) {
  const startTime = Date.now();
  try {
    await fetch(config.testUrl, {
      method: 'HEAD',
      timeout: config.timeout
    });
    const latency = Date.now() - startTime;
    return { key, name: config.name, status: 'online', latency };
  } catch (e) {
    return { key, name: config.name, status: 'offline', latency: null, error: e.message };
  }
}

async function runHealthCheck() {
  console.log('Running health check...\n');

  const results = await Promise.all(
    Object.entries(PROVIDERS).map(([key, config]) => checkProvider(key, config))
  );

  const timestamp = new Date().toISOString();

  console.log(`Health Check Results (${timestamp})`);
  console.log('='.repeat(50));

  results.forEach(r => {
    const icon = r.status === 'online' ? '✅' : '❌';
    const latency = r.latency ? ` (${r.latency}ms)` : '';
    console.log(`${icon} ${r.name}: ${r.status}${latency}`);
  });

  // 输出 JSON 格式供网站使用
  console.log('\n--- JSON Output ---');
  console.log(JSON.stringify({ timestamp, results }, null, 2));

  return { timestamp, results };
}

runHealthCheck().catch(console.error);
