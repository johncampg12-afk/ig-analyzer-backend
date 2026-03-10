const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // ============================================
  // CORS (igual que antes)
  // ============================================
  const origin = req.headers.origin;
  const isChromeExtension = origin && origin.startsWith('chrome-extension://');
  
  if (isChromeExtension) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    const allowedOrigins = [
      'https://www.instagram.com',
      'https://instagram.com',
      'https://www.igpro-analyzer.com',
      'https://igpro-analyzer.com'
    ];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : 'https://www.instagram.com');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ============================================
  // LÓGICA PRINCIPAL CON CONTROL DE DISPOSITIVO
  // ============================================
  try {
    const { licenseKey, browserId } = req.body;
    console.log('[API] Verificando licencia:', licenseKey, 'browser:', browserId);

    if (!licenseKey || !browserId) {
      return res.status(200).json({ valid: false, reason: 'Faltan datos' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Buscar la licencia
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .maybeSingle();

    if (error || !data) {
      return res.status(200).json({ valid: false, reason: 'Licencia no encontrada' });
    }

    // Verificar si la licencia está activa y no expirada
    const now = new Date();
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
    
    if (data.status !== 'active' || (expiresAt && expiresAt < now)) {
      return res.status(200).json({ valid: false, reason: 'Licencia expirada o inactiva' });
    }

    // ===== CONTROL DE DISPOSITIVO =====
    // Si es la primera vez que se usa esta licencia
    if (!data.browser_id) {
      console.log('[API] Primera activación para browser:', browserId);
      
      // Vincular la licencia a este browserId
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ 
          browser_id: browserId,
          last_used_at: now.toISOString()
        })
        .eq('license_key', licenseKey);

      if (updateError) {
        console.error('[API] Error al vincular:', updateError);
      }

      return res.status(200).json({ 
        valid: true,
        expires_at: data.expires_at,
        status: data.status,
        first_activation: true
      });
    }

    // Si ya tiene un browserId asignado, verificar que coincida
    if (data.browser_id === browserId) {
      // Mismo dispositivo - actualizar last_used
      console.log('[API] Mismo dispositivo, actualizando last_used');
      
      await supabase
        .from('licenses')
        .update({ last_used_at: now.toISOString() })
        .eq('license_key', licenseKey);

      return res.status(200).json({ 
        valid: true,
        expires_at: data.expires_at,
        status: data.status
      });
    } else {
      // Dispositivo diferente - BLOQUEAR
      console.log('[API] ❌ Intento de uso desde otro dispositivo:', browserId);
      console.log('[API] Dispositivo original:', data.browser_id);
      
      return res.status(200).json({ 
        valid: false, 
        reason: 'Esta licencia ya está activada en otro dispositivo',
        error_code: 'ALREADY_ACTIVATED'
      });
    }

  } catch (err) {
    console.error('[API] Error interno:', err);
    return res.status(500).json({ error: err.message });
  }
};