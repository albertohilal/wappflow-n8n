// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// ✅ Middlewares (deben ir antes de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Rutas API existentes
const enviosRoutes = require('./routes/envios');
app.use('/api/envios', enviosRoutes);

const campaniasRoutes = require('./routes/campanias');
app.use('/api/campanias', campaniasRoutes);

// ✅ NUEVA ruta para generar envíos desde formulario HTML
const generarRoutes = require('./routes/generar');
app.use('/generar', generarRoutes);

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor wappflow-n8n escuchando en http://localhost:${PORT}`);
  console.log(`🌐 Accedé al formulario: http://localhost:${PORT}/lanzar_campania.html`);
});
