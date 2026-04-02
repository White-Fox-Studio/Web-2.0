export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { customer, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_PUBLISHABLE_KEY,
        'x-secret-token': process.env.MY_SECRET_TOKEN
      },
      body: JSON.stringify({ customer, items })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Order processing failed' });
  }
}