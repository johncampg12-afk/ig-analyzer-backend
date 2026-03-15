const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // ============================================
  // CONFIGURACIÓN CORS
  // ============================================
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'https://www.instagram.com',
    'https://instagram.com',
    'https://www.igpro-analyzer.com',
    'https://igpro-analyzer.com',
    /^chrome-extension:\/\/[a-z]{32}$/i
  ];
  
  const isChromeExtension = origin && origin.startsWith('chrome-extension://');
  
  if (isChromeExtension) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.igpro-analyzer.com');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan = 'annual' } = req.body;
    
    // ============================================
    // MAPEO DE PLANES A PRICE IDS
    // ============================================
    const priceIds = {
      annual: 'price_1TAcMoRvtYANAeOoqAiBT6ZM', // ← TU PRICE ID ACTUAL (29,99€)
      lifetime: 'price_1TAcNrRvtYANAeOo2tXunc44'    // ← REEMPLAZA CON EL ID DE LIFETIME
    };
    
    const selectedPriceId = priceIds[plan];
    
    if (!selectedPriceId) {
      return res.status(400).json({ error: 'Plan no válido' });
    }
    
    // ============================================
    // METADATOS SEGÚN EL PLAN
    // ============================================
    const metadata = {
      plan: plan,
      type: plan === 'lifetime' ? 'lifetime_license' : 'annual_license'
    };
    
    // Solo añadir expires_at si es anual
    if (plan === 'annual') {
      metadata.expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      metadata: metadata,
      success_url: 'https://igpro-analyzer.com/api/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://igpro-analyzer.com/api/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};