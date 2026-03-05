module.exports = async (req, res) => {
  const { session_id } = req.query;
  
  // Intentar obtener información de la sesión si hay session_id
  let sessionInfo = '';
  if (session_id) {
    sessionInfo = `<p><small>ID de sesión: ${session_id}</small></p>`;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>¡Pago exitoso!</h1>
        <p class="subtitle">Gracias por confiar en IG Analyzer PRO</p>
        
        <div class="card">
          <h3>📋 Próximos pasos:</h3>
          <ol>
            <li><strong>Revisa tu email</strong> (también la carpeta de spam)</li>
            <li><strong>Copia la clave de licencia</strong> que recibirás en el email</li>
            <li><strong>Pégala en la extensión</strong> para activar todas las funciones PRO</li>
          </ol>
          <p style="margin-top: 20px; margin-bottom: 0; text-align: center;">
            <span class="highlight">⏱️ Tu licencia es válida por 1 año</span>
          </p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="https://chromewebstore.google.com/..." class="btn" target="_blank">📲 Ir a la extensión</a>
          <a href="mailto:soporte@tudominio.com" class="btn btn-secondary">✉️ Contactar soporte</a>
        </div>

        ${sessionInfo}
        
        <div class="footer">
          <p>¿No recibes el email? Revisa spam o contacta con soporte</p>
        </div>
      </div>
    </body>
    </html>
  `);
};