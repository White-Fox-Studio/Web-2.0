export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const headers = {
            'apikey': process.env.SUPABASE_PUBLISHABLE_KEY
        };

        // Добавили packRes (запрос пакетов)
        const [catRes, prodRes, packRes] = await Promise.all([
            fetch(`${process.env.SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc`, { headers }),
            fetch(`${process.env.SUPABASE_URL}/rest/v1/product_cards?select=*`, { headers }),
            fetch(`${process.env.SUPABASE_URL}/rest/v1/packages_with_price?select=*&order=sort_order.asc`, { headers })
        ]);

        const categories = await catRes.json();
        const products = await prodRes.json();
        const packages = await packRes.json(); // Парсим пакеты

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        // Отдаем все 3 массива
        return res.status(200).json({ categories, products, packages });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
