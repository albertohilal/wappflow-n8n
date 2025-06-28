// scripts/generar_envios.js
const db = require('../db/connection');
require('dotenv').config();

async function generarEnvios(campaniaId, cantidad, rubroId) {
  try {
    // Validación de parámetros
    if (!campaniaId || !cantidad || !rubroId) {
      console.error('❌ Uso: node generar_envios.js <campaniaId> <cantidad> <rubroId>');
      process.exit(1);
    }

    // 1. Traer la campaña
    const [campanias] = await db.execute(
      'SELECT * FROM ll_campanias_whatsapp WHERE id = ?',
      [campaniaId]
    );

    if (campanias.length === 0) {
      console.log('❌ Campaña no encontrada');
      return;
    }

    const campania = campanias[0];
    console.log(`✅ Usando campaña: ${campania.nombre}`);

    // 2. Buscar lugares que aún no fueron usados en esta campaña
    const [lugares] = await db.execute(`
      SELECT l.nombre, l.telefono_wapp AS telefono, r.nombre_es AS rubro
      FROM ll_lugares l
      LEFT JOIN ll_rubros r ON l.rubro_id = r.id
      WHERE l.rubro_id = ?
        AND l.telefono_wapp IS NOT NULL
        AND l.telefono_wapp != ''
        AND NOT EXISTS (
          SELECT 1 FROM ll_envios_whatsapp e
          WHERE e.telefono = l.telefono_wapp AND e.campania_id = ?
        )
      LIMIT ?
    `, [rubroId, campaniaId, cantidad]);

    if (lugares.length === 0) {
      console.log('⚠️ No se encontraron registros pendientes.');
      return;
    }

    let insertados = 0;

    for (const lugar of lugares) {
      const mensajeFinal = campania.mensaje
        .replace('{{nombre}}', lugar.nombre || '')
        .replace('{{rubro}}', lugar.rubro || 'rubro');

      await db.execute(
        `INSERT INTO ll_envios_whatsapp 
          (campania_id, telefono, nombre_destino, mensaje_final, estado, fecha_envio)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [campania.id, lugar.telefono, lugar.nombre, mensajeFinal, 'pendiente']
      );

      insertados++;
    }

    console.log(`✅ ${insertados} mensajes generados para la campaña ${campaniaId}.`);
  } catch (error) {
    console.error('❌ Error generando envíos:', error);
  } finally {
    process.exit();
  }
}

// Leer parámetros desde consola
const campaniaId = parseInt(process.argv[2], 10);
const cantidad = parseInt(process.argv[3], 10);
const rubroId = parseInt(process.argv[4], 10);

generarEnvios(campaniaId, cantidad, rubroId);
