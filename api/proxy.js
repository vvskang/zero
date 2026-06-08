// Zero API Proxy — 保护你的 DeepSeek API Key
// 部署到 Vercel 后，在 Vercel 设置里添加环境变量 DEEPSEEK_KEY=sk-xxx
// 用户浏览器只跟这个代理通信，永远看不到你的 Key

export default async function handler(req, res) {
  // CORS — 允许任何来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只接受 POST 请求' });
  }

  const apiKey = process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 API Key' });
  }

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: data.error?.message || 'DeepSeek API 错误'
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: '代理请求失败: ' + err.message });
  }
}
