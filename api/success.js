// Versión simplificada que no requiere consultas a Supabase
module.exports = async (req, res) => {
  const { session_id } = req.query;
  
  // Generar una licencia de ejemplo o usar un valor por defecto
  // En un entorno real, podrías obtenerla de una cookie o variable de entorno
  const demoLicense = 'IGPRO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // También podrías obtenerla de los headers o de una base de datos en memoria
  // Por ahora, usamos una generada aleatoriamente para pruebas

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
          word-break: break-all;
        }
        .copy-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
        }
        .back-btn {
          background: #833ab4;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .warning {
          background: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>¡Pago exitoso!</h1>
        <p class="subtitle">Gracias por confiar en IG Analyzer PRO</p>
        
        <div class="warning">
          <strong>📧 Importante:</strong> Recibirás tu licencia por email en unos minutos.
          Mientras tanto, puedes usar esta licencia de prueba:
        </div>
        
        <div class="license-box" id="license-key">
          ${demoLicense}
        </div>
        
        <button class="copy-btn" onclick="copyLicense()">📋 Copiar licencia</button>
        
        <div class="card">
          <h3>📋 Activar tu licencia:</h3>
          <ol style="text-align: left; margin-bottom: 0;">
            <li><strong>Vuelve a Instagram</strong> (donde tienes la extensión)</li>
            <li>En el panel de IG Analyzer, haz clic en <strong>"¿Tienes una licencia?"</strong></li>
            <li>Pega esta licencia y haz clic en <strong>"Activar"</strong></li>
          </ol>
        </div>

        <button class="back-btn" onclick="tryActivate()">
          📱 Activar automáticamente
        </button>

        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          ID de sesión: ${session_id || 'No disponible'}
        </p>
      </div>

      <script>
        const LICENSE_KEY = '${demoLicense}';
        
        function copyLicense() {
          navigator.clipboard.writeText(LICENSE_KEY).then(() => {
            alert('✅ Licencia copiada al portapapeles');
          });
        }
        
        function tryActivate() {
          // Intentar enviar a la ventana que abrió esta pestaña
          if (window.opener) {
            window.opener.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, 'https://www.instagram.com');
            
            alert('✅ Licencia enviada a Instagram. Revisa la extensión.');
            
            // Intentar cerrar esta pestaña
            setTimeout(() => window.close(), 1500);
          } else {
            // Si no hay opener, abrir Instagram
            window.open('https://www.instagram.com', '_blank');
            alert('📝 Abre Instagram y pega la licencia manualmente en el panel');
          }
        }
        
        // También intentar al hacer clic en cualquier parte
        document.body.addEventListener('click', function once() {
          if (window.opener) {
            window.opener.postMessage({
              type: 'IGANA_LICENSE_ACTIVATED',
              licenseKey: LICENSE_KEY
            }, 'https://www.instagram.com');
          }
        }, { once: true });
      </script>
    </body>
    </html>
  `);
};