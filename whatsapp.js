// whatsapp.js
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./scripts" // Reutiliza sesión existente
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log("📲 Escaneá este QR para iniciar sesión:");
  console.log(qr);
});

client.on('ready', () => {
  console.log("🟢 Cliente WhatsApp listo");
});

client.on('auth_failure', (msg) => {
  console.error("❌ Fallo de autenticación:", msg);
});

client.on('disconnected', (reason) => {
  console.log("🔌 Cliente desconectado:", reason);
});

client.initialize();

module.exports = client;
