module.exports = async (req, res) => {
  const { session_id } = req.query;
  
  // Aquí deberías obtener la licencia de la base de datos usando session_id
  // Por ahora, vamos a simularla o obtenerla de una fuente temporal
  // En un caso real, harías una consulta a Supabase
  const Stripe = require('stripe');
  const { createClient } = require('@supabase/supabase-js');
  
  let licenseKey = 'No disponible';
  let email = '';
  
  try {
    // Inicializar Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Buscar la licencia por session_id
    if (session_id) {
      const { data, error } = await supabase
        .from('licenses')
        .select('license_key, email')
        .eq('stripe_session_id', session_id)
        .single();
      
      if (data && !error) {
        licenseKey = data.license_key;
        email = data.email;
        console.log(`Licencia encontrada: ${licenseKey} para ${email}`);
      }
    }
  } catch (err) {
    console.error('Error obteniendo licencia:', err);
  }

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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
        h1 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 18px;
          margin-bottom: 30px;
        }
        .card {
          background: #f3f4f6;
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: left;
        }
        .card h3 {
          color: #374151;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 20px;
        }
        .card ol {
          margin: 0;
          padding-left: 20px;
          color: #4b5563;
        }
        .card li {
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .card li:last-child {
          margin-bottom: 0;
        }
        .btn {
          display: inline-block;
          background: #6366f1;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          margin: 10px 5px;
        }
        .btn:hover {
          background: #4f52e0;
        }
        .btn-secondary {
          background: #9ca3af;
        }
        .btn-secondary:hover {
          background: #6b7280;
        }
        .footer {
          margin-top: 30px;
          color: #9ca3af;
          font-size: 14px;
        }
        .highlight {
          background: #e0f2fe;
          color: #0369a1;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
        }
        .license-box {
          background: #1f2937;
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          font-family: monospace;
          font-size: 24px;
          letter-spacing: 2px;
          border: 2px solid #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .copy-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-left: 10px;
        }
        .copy-btn:hover {
          background: #059669;
        }
        .back-to-instagram {
          background: #833ab4;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          display: inline-block;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>¡Pago exitoso!</h1>
        <p class="subtitle">Gracias por confiar en IG Analyzer PRO</p>
        
        <!-- NUEVO: MOSTRAR LA LICENCIA -->
        <div class="license-box" id="license-key-display">
          ${licenseKey}
        </div>
        
        <button class="copy-btn" onclick="copyLicense()">📋 Copiar licencia</button>
        
        <div class="card">
          <h3>📋 Próximos pasos:</h3>
          <ol>
            <li><strong>Vuelve a Instagram</strong> (la pestaña donde tenías la extensión)</li>
            <li><strong>La licencia se activará automáticamente</strong> al volver</li>
            <li>Si no se activa, pega esta licencia en el panel</li>
          </ol>
          <p style="margin-top: 20px; margin-bottom: 0; text-align: center;">
            <span class="highlight">⏱️ Tu licencia es válida por 1 año</span>
          </p>
        </div>

        <!-- BOTÓN PARA VOLVER A INSTAGRAM -->
        <a href="#" id="back-to-instagram" class="back-to-instagram" style="display:inline-block; margin:20px 0;">
          📱 Volver a Instagram
        </a>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn" id="manual-activation">🔑 Activar manualmente</button>
          <a href="mailto:soporte@igpro-analyzer.com" class="btn btn-secondary">✉️ Contactar soporte</a>
        </div>

        ${sessionInfo ? `<p><small>ID de sesión: ${session_id}</small></p>` : ''}
        
        <div class="footer">
          <p>¿Problemas? Guarda esta licencia: <strong>${licenseKey}</strong></p>
        </div>
      </div>

      <script>
        // Guardar licencia para usar en los scripts
        const LICENSE_KEY = '${licenseKey}';
        console.log('✅ Licencia cargada:', LICENSE_KEY);

        // Función para copiar licencia
        function copyLicense() {
          navigator.clipboard.writeText(LICENSE_KEY).then(() => {
            alert('✅ Licencia copiada al portapapeles');
          });
        }

        // Función para enviar licencia a la extensión
        function sendLicenseToInstagram() {
          console.log('📤 Enviando licencia a Instagram...');
          
          if (window.opener) {
            // Enviar a la ventana que abrió esta pestaña
            window.opener.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, 'https://www.instagram.com');
            
            console.log('✅ Enviado a opener');
            
            // Intentar cerrar esta pestaña y volver a Instagram
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            console.log('❌ No hay opener, intentando broadcast...');
            
            // Broadcast a todas las ventanas
            window.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, '*');
            
            alert('No se pudo comunicar automáticamente. Copia la licencia y pégala en el panel de Instagram.');
          }
        }

        // Enviar automáticamente al cargar la página
        window.addEventListener('load', () => {
          setTimeout(sendLicenseToInstagram, 1000);
        });

        // Botón para volver a Instagram
        document.getElementById('back-to-instagram').addEventListener('click', (e) => {
          e.preventDefault();
          sendLicenseToInstagram();
        });

        // Botón para activación manual (abre instrucciones)
        document.getElementById('manual-activation').addEventListener('click', () => {
          alert('1. Ve a Instagram\\n2. En el panel de IG Analyzer, haz clic en "¿Tienes una licencia?"\\n3. Pega esta licencia: ' + LICENSE_KEY);
        });

        // También intentar cuando el usuario interactúa con la página
        document.addEventListener('click', () => {
          if (!window.opener) return;
          // Solo enviar si hay opener
          sendLicenseToInstagram();
        }, { once: true });
      </script>
    </body>
    </html>
  `);
};