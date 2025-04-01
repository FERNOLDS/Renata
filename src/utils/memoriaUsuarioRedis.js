const Redis = require('ioredis');
const redisClient = new Redis();


redisClient.on('connect', () => {
    console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
    console.error('Error de conexión a Redis:', err);
});

// Guardar mensajes recientes en Redis con TTL
async function guardarMensajeEnMemoria(usuario, mensaje) {
    const clave = `chat:${usuario}`;
    
    // Recuperar historial actual
    let historial = await redisClient.lrange(clave, 0, -1);

    // Agregar nuevo mensaje al final
    historial.push(mensaje);

    // Mantener solo los últimos 5 mensajes
    if (historial.length > 5) {
        historial.shift(); // Elimina el más antiguo
    }

    // Guardar en Redis con un TTL de 15 minutos
    await redisClient.del(clave); // Borrar clave para resetear TTL
    await redisClient.rpush(clave, ...historial);
    await redisClient.expire(clave, 900); // 900s = 15 min
}

// Obtener historial de memoria
async function obtenerHistorial(usuario) {
    const clave = `chat:${usuario}`;
    return await redisClient.lrange(clave, 0, -1);
}

module.exports = {guardarMensajeEnMemoria, obtenerHistorial};