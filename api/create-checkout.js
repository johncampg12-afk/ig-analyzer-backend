const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // CONFIGURACIÓN CORS CORRECTA
  res.setHeader('Access-Control-Allow-Origin', 'https://www.instagram.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Manejar preflight OPTIONS (CRÍTICO PARA CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IMPORTANTE: REEMPLAZA CON TU PRICE ID REAL DE STRIPE
    const PRICE_ID = 'price_1T4Lc8Rv1AFDOjredmBAxddO'; // 
    
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
      success_url: 'https://igpro-analyzer.com/api/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://igpro-analyzer.com/api/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};