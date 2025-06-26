const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

router.post('/', (req, res) => {
  const campaniaId = parseInt(req.body.campaniaId, 10);

  if (isNaN(campaniaId)) {
    return res.status(400).send('ID de campaña inválido');
  }

  const scriptPath = path.join(__dirname, '../scripts/generar_envios.js');
  const command = `node "${scriptPath}" ${campaniaId}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error al ejecutar: ${error.message}`);
      return res.status(500).send(`Error al ejecutar el script: ${error.message}`);
    }

    console.log(`📤 Script ejecutado:\n${stdout}`);
    res.send(`<pre>${stdout}</pre>`);
  });
});

module.exports = router;
