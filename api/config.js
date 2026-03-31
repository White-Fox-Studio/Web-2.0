export default function handler(req, res) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Отключаем кэширование
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Получаем переменные окружения
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('Config API called', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey 
  });
  
  // Проверяем наличие переменных
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Missing Supabase credentials',
      message: 'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in Vercel'
    });
  }
  
  // Отправляем конфиг
  res.status(200).json({
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseKey
  });
}
