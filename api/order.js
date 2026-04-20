export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const {
      customer,
      items,
      processing,
      sharing,
      marketing } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const clientUserAgent = req.headers['user-agent'] || 'unknown';

  const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_PUBLISHABLE_KEY,
    'x-secret-token': process.env.MY_SECRET_TOKEN,
    'x-forwarded-for': clientIp,
    'user-agent': clientUserAgent
  };
  const POLICY_VERSION = "v1.0_2026-04-20";
  const POLICY_HASH = "07e7c0e9c3474f481f8208215a777ce08794fc5f09abab2af50b177d9ae3a6a2"

  const body = {
      customer,
      items,
      policy_version: POLICY_VERSION,
      policy_hash: POLICY_HASH,
      consents: {
          processing,
          sharing,
          marketing
      }
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/create_order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Order processing failed' });
  }
}