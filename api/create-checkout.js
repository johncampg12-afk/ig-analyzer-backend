const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Usar el Price ID de tu producto anual
    const PRICE_ID = 'price_1T4Lc8Rv1AFDOjredmBAxddO'; // ← REEMPLAZA CON TU ID REAL

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // ← IMPORTANTE: payment, NO subscription
      line_items: [
        {
          price: PRICE_ID, // Usamos el price ID existente
          quantity: 1,
        },
      ],
      // Metadatos para saber que es una licencia anual
      metadata: {
        type: 'annual_license',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      success_url: 'https://tudominio.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://tudominio.com/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};