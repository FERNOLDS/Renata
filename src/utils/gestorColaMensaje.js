const { Queue, Worker } = require('bullmq');
const { manejarMensaje } = require('./controllers/mensajeController');
const Redis = require('ioredis');

// Configurar conexión a Redis
const redisConnection = new Redis();

// Crear una cola de mensajes
const mensajeQueue = new Queue('mensajesQueue', { connection: redisConnection });

// Agregar mensaje a la cola
async function encolarMensaje(usuario, mensaje) {
    const clave = "colaMensajes"; // Clave única para la cola
    await redisClient.rpush(clave, JSON.stringify({ usuario, mensaje }));
}

// Procesar mensajes en orden (uno por uno)
const worker = new Worker('mensajesQueue', async job => {
    const msg = job.data;
    await manejarMensaje(msg);
}, { connection: redisConnection });

module.exports = { encolarMensaje };
