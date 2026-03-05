const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

function generateLicenseKey() {
  return 'IGPRO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send('Webhook error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;

    if (!email) {
      return res.status(200).json({ received: true });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const licenseKey = generateLicenseKey();
    
    // Calcular fecha de expiración (1 año desde ahora)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error } = await supabase.from('licenses').insert({
      license_key: licenseKey,
      email: email,
      status: 'active',
      // Nuevos campos útiles
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      amount_total: session.amount_total,
      expires_at: expiresAt.toISOString(), // ← Guardamos cuándo expira
      metadata: session.metadata || {}
    });

    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log(`✅ Licencia creada: ${licenseKey} para ${email} (expira: ${expiresAt.toISOString()})`);
      // Aquí puedes enviar email con la licencia
    }
  }

  res.status(200).json({ received: true });
};