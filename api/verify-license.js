const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Obtener el origen de la petición
  const origin = req.headers.origin;
  
  // Detectar si es una extensión de Chrome
  const isChromeExtension = origin && origin.startsWith('chrome-extension://');
  
  // Configurar CORS
  if (isChromeExtension) {
    // Para extensiones, devolver el origen exacto
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ Extensión permitida:', origin);
  } else {
    // Para otros orígenes, permitir los conocidos
    const allowedOrigins = [
      'https://www.instagram.com',
      'https://instagram.com',
      'https://www.igpro-analyzer.com',
      'https://igpro-analyzer.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Fallback a Instagram
      res.setHeader('Access-Control-Allow-Origin', 'https://www.instagram.com');
    }
  }
  
  // Otros headers CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Responder a OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(200).json({ valid: false });
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

    if (error || !data) {
      return res.status(200).json({ valid: false });
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
    console.error('Verify error:', err);
    return res.status(500).json({ error: err.message });
  }
};