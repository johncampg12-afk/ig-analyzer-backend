const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CONFIGURACIÓN CORS MEJORADA
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'https://www.instagram.com',
    'https://www.igpro-analyzer.com',
    'https://igpro-analyzer.com'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.igpro-analyzer.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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