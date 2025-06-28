const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Ruta POST para lanzar campaña
router.post('/lanzar-campania', async (req, res) => {
  const { campaniaId, rubroNombre, cantidad } = req.body;

  try {
    const connection = await pool.getConnection();

    // Obtener mensaje de la campaña
    const [rowsMensaje] = await connection.execute(
      'SELECT mensaje FROM ll_campanias_whatsapp WHERE id = ?',
      [campaniaId]
    );

    if (rowsMensaje.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const mensajeFinal = rowsMensaje[0].mensaje;

    // Buscar keyword_google del rubro elegido
    const [rowsRubro] = await connection.execute(
      "SELECT keyword_google FROM ll_rubros WHERE nombre = ?",
      [rubroNombre]
    );

    if (rowsRubro.length === 0) {
      return res.status(404).json({ error: 'Rubro no encontrado' });
    }

    const keywordGoogle = rowsRubro[0].keyword_google;

    // Obtener registros del rubro que no hayan sido enviados aún
    const [registros] = await connection.execute(
      `SELECT l.telefono_wapp AS telefono, l.nombre
       FROM ll_lugares l
       WHERE l.rubro = ?
       AND l.telefono_wapp NOT IN (
         SELECT e.telefono FROM ll_envios_whatsapp e WHERE e.campania_id = ?
       )
       LIMIT ?`,
      [keywordGoogle, campaniaId, parseInt(cantidad)]
    );

    if (registros.length === 0) {
      return res.status(404).json({ error: 'No hay registros pendientes para esta combinación.' });
    }

    // Insertar registros en ll_envios_whatsapp
    for (const registro of registros) {
      await connection.execute(
        `INSERT INTO ll_envios_whatsapp (campania_id, telefono, nombre_destinatario, mensaje_final, estado)
         VALUES (?, ?, ?, ?, 'pendiente')`,
        [campaniaId, registro.telefono, registro.nombre, mensajeFinal]
      );
    }

    connection.release();
    res.json({ mensaje: 'Campaña generada con éxito' });
  } catch (error) {
    console.error('Error al lanzar campaña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
