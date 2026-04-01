const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

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

function formatDate(date) {
  if (!date) return 'Nunca expira (Lifetime)';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatExpirationTime(date) {
  if (!date) return 'Nunca expira (Lifetime)';
  const now = new Date();
  const diffHours = Math.ceil((new Date(date) - now) / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `Expira en ${diffHours} horas`;
  }
  return `Válida hasta: ${formatDate(date)}`;
}

function getPlanDisplayName(plan) {
  const plans = {
    daily: 'Pase Diario (24 horas)',
    annual: 'Licencia Anual',
    lifetime: 'Licencia Lifetime (Pago Único)'
  };
  return plans[plan] || 'Licencia PRO';
}

module.exports = async (req, res) => {
  console.log('🚀 Webhook iniciado');

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
    console.log('✅ Evento válido:', event.type);
  } catch (err) {
    console.error('❌ Firma inválida:', err.message);
    return res.status(400).send('Webhook error');
  }

  // Procesar solo checkout completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Cliente';
    const sessionId = session.id;
    const amountTotal = (session.amount_total / 100).toFixed(2);
    
    // ============================================
    // OBTENER EL PLAN DESDE LOS METADATOS
    // ============================================
    const plan = session.metadata?.plan || 'annual';
    console.log('💰 Datos del pago:', { email, amountTotal, sessionId, plan });

    if (!email) {
      console.log('❌ No hay email en la sesión');
      return res.status(200).json({ received: true });
    }

    // 1️⃣ GUARDAR EN SUPABASE
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const licenseKey = generateLicenseKey();
    
    // ============================================
    // CONFIGURACIÓN DE EXPIRACIÓN SEGÚN EL PLAN
    // ============================================
    let expiresAt;
    let maxDevices = 1;
    let planDisplayName = getPlanDisplayName(plan);
    
    if (plan === 'lifetime') {
      expiresAt = null; // No expira
      maxDevices = 2;
      planDisplayName = 'Lifetime (Pago Único)';
    } else if (plan === 'daily') {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // +24 horas desde ahora
      maxDevices = 1;
      planDisplayName = 'Pase Diario (24h)';
    } else {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // +1 año
      maxDevices = 1;
      planDisplayName = 'Licencia Anual';
    }

    // 📦 INSERTAR (SOLO CAMPOS BÁSICOS + PLAN EN METADATA)
    const { error: dbError } = await supabase.from('licenses').insert({
      license_key: licenseKey,
      email: email,
      status: 'active',
      stripe_session_id: sessionId,
      stripe_customer_id: session.customer,
      amount_total: session.amount_total,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      max_devices: maxDevices,
      plan: plan,  // Guardamos el plan directamente
      metadata: { 
        ...session.metadata,
        plan: plan
      }
    });

    if (dbError) {
      console.error('❌ Error Supabase:', dbError);
    } else {
      console.log('✅ Licencia guardada:', licenseKey);
      console.log(`📱 Plan: ${planDisplayName}`);
      console.log(`⏰ Expira: ${expiresAt ? expiresAt.toISOString() : 'Nunca'}`);
    }

    // 2️⃣ ENVIAR EMAIL CON INFORMACIÓN DEL PLAN
    try {
      console.log('📧 Preparando envío de email a:', email);

      const expirationText = formatExpirationTime(expiresAt);
      
      // Añadir mensaje especial para pase diario
      const specialMessage = plan === 'daily' 
        ? '<p style="background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; text-align: center;">⏰ <strong>Importante:</strong> Este pase expira en 24 horas. Aprovecha al máximo tu día de análisis ilimitados.</p>'
        : '';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Gracias por tu compra!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">IG Analyzer PRO</p>
            </div>
            
            <!-- Contenido -->
            <div style="padding: 40px 30px;">
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${customerName}</strong>,</p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hemos recibido tu pago de <strong style="color: #10b981;">${amountTotal}€</strong> correctamente.</p>
              
              <!-- Información del plan -->
              <div style="background: #e0f2fe; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #0369a1; margin: 0; text-align: center; font-weight: 600;">
                  🏷️ Plan contratado: <strong>${planDisplayName}</strong>
                </p>
              </div>
              
              ${specialMessage}
              
              <!-- Caja de licencia -->
              <div style="background: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px dashed #6366f1;">
                <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tu clave de licencia</p>
                <div style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #4f46e5; letter-spacing: 2px; word-break: break-all;">${licenseKey}</div>
                <p style="color: #6b7280; margin: 15px 0 0; font-size: 14px;">${expirationText}</p>
                ${plan === 'lifetime' ? '<p style="color: #10b981; margin: 10px 0 0; font-size: 13px;">✨ Puedes usar esta licencia en hasta 2 dispositivos ✨</p>' : ''}
              </div>
              
              <!-- Instrucciones -->
              <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #0369a1; margin: 0 0 15px; font-size: 18px;">📋 Cómo activar tu licencia:</h3>
                <ol style="color: #075985; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Abre la extensión IG Analyzer en Chrome</li>
                  <li>Haz clic en "Activar licencia" o "Pasar a PRO"</li>
                  <li>Copia y pega esta clave: <strong style="background: white; padding: 4px 8px; border-radius: 4px;">${licenseKey}</strong></li>
                  <li>¡Disfruta de todas las funciones PRO!</li>
                </ol>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f3f4f6; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">IG Analyzer PRO - La herramienta definitiva para Instagram</p>
              <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">© 2026 IG Analyzer. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: 'IG Analyzer PRO <no-reply@igpro-analyzer.com>',
        to: email,
        subject: `🎉 Tu ${planDisplayName} de IG Analyzer PRO está lista`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Error de Resend:', error);
      } else {
        console.log('✅ Email enviado correctamente a:', email, 'ID:', data.id);
      }
    } catch (emailError) {
      console.error('❌ Excepción en envío de email:', emailError.message);
    }
  }

  res.status(200).json({ received: true });
};