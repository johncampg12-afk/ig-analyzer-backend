const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Configurar CORS correctamente (IMPORTANTE para peticiones desde extensiones)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder a preflight OPTIONS (esto es CRÍTICO para extensiones)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // PRICE_ID ya está correcto
    const PRICE_ID = 'price_1T4Lc8Rv1AFDOjredmBAxddO';

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
      // ✅ TUS URLs ya están actualizadas
      success_url: 'https://ig-analyzer-backend.vercel.app/api/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ig-analyzer-backend.vercel.app/api/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};