const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); // Carga el .env correctamente

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Escaneá el código QR para iniciar sesión en WhatsApp');
});

client.on('ready', async () => {
  console.log('✅ Cliente de WhatsApp listo');

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,   // Usa tu variable real
      database: process.env.DB_DATABASE,   // Usa tu variable real
      port: process.env.DB_PORT
    });

    const [rows] = await db.execute(
      "SELECT * FROM ll_envios_whatsapp WHERE estado = 'pendiente' LIMIT 50"
    );

    for (const row of rows) {
      const numero = row.telefono;
      const mensaje = row.mensaje_final.replace('{{nombre}}', row.nombre_destinatario || '');

      try {
        const chatId = `${numero}@c.us`;
        console.log(`📤 Enviando mensaje a ${chatId}`);
        await client.sendMessage(chatId, mensaje);

        await db.execute(
          "UPDATE ll_envios_whatsapp SET estado = 'enviado', fecha_envio = NOW() WHERE id = ?",
          [row.id]
        );

        console.log(`✅ Mensaje enviado a ${numero}`);
      } catch (err) {
        await db.execute(
          "UPDATE ll_envios_whatsapp SET estado = 'error' WHERE id = ?",
          [row.id]
        );
        console.error(`❌ Error al enviar a ${numero}:`, err.message);
      }
    }

    await db.end();
    console.log('🚀 Envíos finalizados.');
    setTimeout(() => process.exit(0), 5000);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
});

client.initialize();
