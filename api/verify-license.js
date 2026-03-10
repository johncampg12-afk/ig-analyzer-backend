const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // ============================================
  // CONFIGURACIÓN CORS PARA MÚLTIPLES ORÍGENES
  // ============================================
  
  // Obtener el origen de la petición
  const origin = req.headers.origin;
  
  // Lista de orígenes permitidos (¡INCLUYE LA EXTENSIÓN!)
  const allowedOrigins = [
    'https://www.instagram.com',
    'https://instagram.com',
    'https://www.igpro-analyzer.com',
    'https://igpro-analyzer.com',
    // Permitir cualquier origen de extensión de Chrome (para desarrollo)
    /^chrome-extension:\/\/[a-z]{32}$/i
  ];
  
  // Verificar si el origen es una extensión de Chrome
  const isChromeExtension = origin && origin.startsWith('chrome-extension://');
  
  // Establecer el header Access-Control-Allow-Origin
  if (isChromeExtension) {
    // Para extensiones, devolvemos el origen exacto
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Por defecto, permitir Instagram (para peticiones sin origen)
    res.setHeader('Access-Control-Allow-Origin', 'https://www.instagram.com');
  }
  
  // Otros headers CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Responder a OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    console.log('[API] Respondiendo a preflight OPTIONS desde:', origin);
    return res.status(200).end();
  }

  // Solo permitir POST para la funcionalidad real
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ============================================
  // LÓGICA PRINCIPAL DE VERIFICACIÓN
  // ============================================
  try {
    const { licenseKey, browserId } = req.body;
    console.log('[API] Verificando licencia:', licenseKey, 'desde:', origin);

    if (!licenseKey) {
      return res.status(200).json({ valid: false, reason: 'No license key provided' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .maybeSingle();

    if (error) {
      console.error('[API] Error de Supabase:', error);
      return res.status(200).json({ valid: false, reason: 'Database error' });
    }

    if (!data) {
      return res.status(200).json({ valid: false, reason: 'License not found' });
    }

    const now = new Date();
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
    const isValid = data.status === 'active' && (!expiresAt || expiresAt > now);

    return res.status(200).json({
      valid: isValid,
      expires_at: data.expires_at,
      status: data.status
    });

  } catch (err) {
    console.error('[API] Error interno:', err);
    return res.status(500).json({ error: err.message });
  }
};