module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pago cancelado - IG Analyzer PRO</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          max-width: 500px;
          margin: 20px;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        .cancel-icon {
          width: 80px;
          height: 80px;
          background: #f43f5e;
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
          margin-bottom: 15px;
        }
        p {
          color: #6b7280;
          font-size: 18px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background: #f43f5e;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #e11d48;
        }
        .btn-secondary {
          background: #6b7280;
          margin-left: 10px;
        }
        .btn-secondary:hover {
          background: #4b5563;
        }
        .reason {
          background: #fef3f2;
          padding: 15px;
          border-radius: 8px;
          margin: 30px 0;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="cancel-icon">✕</div>
        <h1>Pago cancelado</h1>
        <p>No se ha realizado ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
        
        <div class="reason">
          💡 ¿Has tenido algún problema? <a href="mailto:soporte@tudominio.com" style="color: #991b1b;">Contáctanos</a>
        </div>

        <a href="https://www.igpro-analyzer.com/" class="btn">Volver al inicio</a>
        <a href="https://www.igpro-analyzer.com/" class="btn btn-secondary">Ver planes</a>
      </div>
    </body>
    </html>
  `);
};