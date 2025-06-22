// scripts/generar_envios.js
const db = require('../db/connection');
require('dotenv').config();

async function generarEnvios(campaniaId = 1) {
  try {
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

    // 2. Traer solo algunos números específicos para prueba
    const [lugares] = await db.execute(`
      SELECT nombre, rubro, telefono FROM ll_lugares
      WHERE telefono IN ('5491163083302', '5491158254201')
    `);

    if (lugares.length === 0) {
      console.log('⚠️ No se encontraron coincidencias con los teléfonos especificados.');
      return;
    }

    let insertados = 0;

    for (const lugar of lugares) {
      const mensajeFinal = campania.mensaje
        .replace('{{nombre}}', lugar.nombre)
        .replace('{{rubro}}', lugar.rubro);

      await db.execute(
        'INSERT INTO ll_envios_whatsapp (campania_id, telefono, nombre_destino, mensaje_final, estado) VALUES (?, ?, ?, ?, ?)',
        [campania.id, lugar.telefono, lugar.nombre, mensajeFinal, 'pendiente']
      );

      insertados++;
    }

    console.log(`✅ ${insertados} mensajes generados y guardados en ll_envios_whatsapp.`);
  } catch (error) {
    console.error('❌ Error generando envíos:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar desde terminal: node scripts/generar_envios.js 1
const campaniaId = process.argv[2] || 1;
generarEnvios(campaniaId);
