const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // ============================================
  // CONFIGURACIÓN CORS ABSOLUTA (PRIMERO SIEMPRE)
  // ============================================
  
  // 1. Establecer cabeceras CORS para TODAS las respuestas
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://www.instagram.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
  
  // 2. Responder a OPTIONS INMEDIATAMENTE (esto es CRÍTICO)
  if (req.method === 'OPTIONS') {
    console.log('[API] Respondiendo a preflight OPTIONS');
    return res.status(200).end();
  }

  // 3. Solo permitir POST para la funcionalidad real
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ============================================
  // LÓGICA PRINCIPAL DE VERIFICACIÓN
  // ============================================
  try {
    const { licenseKey } = req.body;
    console.log('[API] Verificando licencia:', licenseKey);

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