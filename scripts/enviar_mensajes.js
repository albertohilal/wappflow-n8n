const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

const SIMULACION = true; // Cambiar a false para enviar realmente

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
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT
    });

    // Solo tu número de prueba para evitar envíos no deseados
    const [rows] = await db.execute(
      "SELECT * FROM ll_envios_whatsapp WHERE estado = 'pendiente' AND telefono = '5491163083302' LIMIT 3"
    );

    if (rows.length === 0) {
      console.log('⚠️ No hay mensajes pendientes para prueba.');
      await db.end();
      setTimeout(() => process.exit(0), 3000);
      return;
    }

    for (const row of rows) {
      const numero = row.telefono;
      const mensaje = row.mensaje_final.replace('{{nombre}}', row.nombre_destinatario || '');
      const chatId = `${numero}@c.us`;

      if (SIMULACION) {
        console.log(`🟡 Simulación: se enviaría a ${numero} → "${mensaje}"`);
        await db.execute(
          "UPDATE ll_envios_whatsapp SET estado = 'simulado', fecha_envio = NOW() WHERE id = ?",
          [row.id]
        );
      } else {
        try {
          console.log(`📤 Enviando mensaje a ${chatId}`);
          await client.sendMessage(chatId, mensaje);
          await db.execute(
            "UPDATE ll_envios_whatsapp SET estado = 'enviado', fecha_envio = NOW() WHERE id = ?",
            [row.id]
          );
          console.log(`✅ Mensaje enviado a ${numero}`);
        } catch (err) {
          await db.execute(
            "UPDATE ll_envios_whatsapp SET estado = 'error', fecha_envio = NOW() WHERE id = ?",
            [row.id]
          );
          console.error(`❌ Error al enviar a ${numero}:`, err.message);
        }
      }
    }

    await db.end();
    console.log('📋 Finalizado.');
    setTimeout(() => process.exit(0), 5000);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
});

client.initialize();
