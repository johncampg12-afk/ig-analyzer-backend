const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // CONFIGURACIÓN CORS MEJORADA - Acepta múltiples orígenes
  const origin = req.headers.origin;
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'https://www.instagram.com',
    'https://www.igpro-analyzer.com',
    'https://igpro-analyzer.com'
  ];
  
  // Si el origen está permitido, lo reflejamos
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Por defecto, permitimos el dominio principal (para pruebas)
    res.setHeader('Access-Control-Allow-Origin', 'https://www.igpro-analyzer.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Responder a OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IMPORTANTE: REEMPLAZA CON TU PRICE ID REAL DE STRIPE
    const PRICE_ID = 'price_1T4LV2Rv1AFDOjreXXX'; // ← CÓPIALO DE STRIPE
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        type: 'annual_license',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      success_url: 'https://www.igpro-analyzer.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.igpro-analyzer.com/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};