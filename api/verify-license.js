const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CONFIGURACIÓN CORS CRÍTICA
  const origin = req.headers.origin;
  
  // Orígenes permitidos
  const allowedOrigins = [
    'https://www.instagram.com',
    'https://instagram.com',
    'https://www.igpro-analyzer.com',
    'https://igpro-analyzer.com'
  ];
  
  // Establecer CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.instagram.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24h

  // Manejar preflight OPTIONS (¡MUY IMPORTANTE!)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { licenseKey } = req.body;

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

    if (error || !data) {
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
    console.error('Verify error:', err);
    return res.status(500).json({ error: err.message });
  }
};