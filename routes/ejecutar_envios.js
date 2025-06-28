const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

router.post('/', (req, res) => {
  const { campania_id, cantidad, rubro_id } = req.body;

  if (!campania_id || !cantidad || !rubro_id) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const scriptPath = path.join(__dirname, '../scripts/generar_envios.js');
  const comando = `node ${scriptPath} ${campania_id} ${cantidad} ${rubro_id}`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).json({ error: 'Fallo al ejecutar el script' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    console.log(`stdout: ${stdout}`);
    res.json({ mensaje: 'Envío iniciado correctamente', salida: stdout });
  });
});

module.exports = router;
