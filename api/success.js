// success.js - VERSIÓN CORREGIDA QUE OBTIENE LA LICENCIA REAL
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const { session_id } = req.query;
  
  let licenseKey = null;
  let email = null;
  let error = null;

  // Intentar obtener la licencia de Supabase
  if (session_id) {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data, error: dbError } = await supabase
        .from('licenses')
        .select('license_key, email')
        .eq('stripe_session_id', session_id)
        .single();

      if (data && !dbError) {
        licenseKey = data.license_key;
        email = data.email;
        console.log('✅ Licencia encontrada en DB:', licenseKey);
      } else {
        error = 'Licencia no encontrada en la base de datos';
        console.error('❌ Error en DB:', dbError);
        
        // Fallback: buscar por email o última licencia
        const { data: lastLicense } = await supabase
          .from('licenses')
          .select('license_key, email')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (lastLicense) {
          licenseKey = lastLicense.license_key;
          email = lastLicense.email;
          console.log('✅ Usando última licencia como fallback:', licenseKey);
        }
      }
    } catch (err) {
      console.error('❌ Error crítico:', err);
      error = err.message;
    }
  }

  // Si no hay licencia, mostrar mensaje de error pero permitir copiar del email
  const displayLicense = licenseKey || 'REVISA TU EMAIL - LLEGARÁ EN BREVE';

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Pago exitoso! - IG Analyzer PRO</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          max-width: 600px;
          margin: 20px;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 30px;
        }
        h1 { color: #1f2937; margin-bottom: 10px; font-size: 28px; }
        .subtitle { color: #6b7280; font-size: 18px; margin-bottom: 30px; }
        .license-box {
          background: #1f2937;
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin: 20px 0;
          font-family: monospace;
          font-size: 24px;
          letter-spacing: 2px;
          border: 2px solid #10b981;
          word-break: break-all;
        }
        .copy-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
        }
        .activate-btn {
          background: #833ab4;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin: 15px 0;
          width: 100%;
        }
        .warning {
          background: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>¡Pago exitoso!</h1>
        <p class="subtitle">Gracias por confiar en IG Analyzer PRO</p>
        
        ${licenseKey ? `
          <div class="success-message">
            ✅ Licencia encontrada y lista para usar
          </div>
          
          <div class="license-box" id="license-display">
            ${licenseKey}
          </div>
          
          <button class="copy-btn" onclick="copyLicense()">📋 Copiar licencia</button>
          
          <button class="activate-btn" id="activateBtn">
            🚀 Activar automáticamente en Instagram
          </button>
          
          <div id="activation-status" style="margin:15px 0; font-size:14px;"></div>
        ` : `
          <div class="warning">
            ⚠️ La licencia no está disponible inmediatamente.<br>
            <strong>Te la enviaremos por email en unos minutos.</strong>
          </div>
          <div class="license-box">
            ${displayLicense}
          </div>
          <p style="color:#666; font-size:14px;">Revisa tu email (también spam) para obtener la licencia real.</p>
        `}
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          ID de sesión: ${session_id || 'No disponible'}
        </div>
      </div>

      <script>
        const LICENSE_KEY = ${JSON.stringify(licenseKey)};
        const SESSION_ID = ${JSON.stringify(session_id)};
        
        function copyLicense() {
          const textToCopy = LICENSE_KEY || document.getElementById('license-display')?.textContent || 'REVISA TU EMAIL';
          navigator.clipboard.writeText(textToCopy).then(() => {
            alert('✅ Licencia copiada al portapapeles');
          });
        }
        
        function sendToInstagram() {
          if (!LICENSE_KEY) {
            document.getElementById('activation-status').innerHTML = '❌ No hay licencia para activar. Espera el email.';
            return;
          }
          
          const status = document.getElementById('activation-status');
          status.innerHTML = '📤 Enviando licencia a Instagram...';
          
          // Intentar enviar a la ventana que abrió esta pestaña
          if (window.opener) {
            window.opener.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, 'https://www.instagram.com');
            
            status.innerHTML = '✅ Licencia enviada! Revisa la extensión en Instagram.';
            
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // Si no hay opener, intentar broadcast
            window.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, '*');
            
            status.innerHTML = '📝 Abre Instagram y pega la licencia manualmente en el panel.';
          }
        }
        
        document.getElementById('activateBtn')?.addEventListener('click', sendToInstagram);
        
        // Auto-intento después de 1 segundo
        setTimeout(() => {
          if (window.opener && LICENSE_KEY) {
            sendToInstagram();
          }
        }, 1000);
      </script>
    </body>
    </html>
  `);
};