export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-App-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Password check ──
  const appPassword = req.headers['x-app-password'];
  if (appPassword !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // ── Rate limiting (simple in-memory, resets on cold start) ──
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const now = Date.now();
  if (!global._rateMap) global._rateMap = new Map();
  const userReqs = (global._rateMap.get(ip) || []).filter(t => now - t < 60_000);
  if (userReqs.length >= 15) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }
  global._rateMap.set(ip, [...userReqs, now]);

  // ── Proxy to OpenRouter ──
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  if (prompt.length > 8000) {
    return res.status(400).json({ error: 'Prompt too long' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'HTTP-Referer': 'https://alsisarimpact.org',
        'X-Title': 'Alsisar FundPilot',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(502).json({ error: data.error.message });
    if (data.choices?.[0]) return res.status(200).json({ result: data.choices[0].message.content });
    return res.status(502).json({ error: 'Unexpected response from AI' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error: ' + e.message });
  }
}
