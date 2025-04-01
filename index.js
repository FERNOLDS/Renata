const express = require('express');
const whatsappClient = require('./src/config/whatsapp'); //revisar funcion por que no existe
const apiRoutes = require('./src/routes/api');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
app.use(express.json());

// Usar las rutas de la API
app.use('/api', apiRoutes);

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
