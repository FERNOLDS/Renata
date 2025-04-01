const redis = require("./redisClient");

async function manejarMensaje(msg) {
    const whatsappNumber = msg.from;
    const userKey = `whatsapp:${whatsappNumber}`;

    console.log("Mensaje recibido:", msg.body);

    // Verificar si hay contexto previo
    const historial = await redis.get(userKey);

    if (historial) {
        console.log("Recuperando memoria:", historial);
    }

    // Guardar el mensaje en Redis por 15 minutos
    await redis.setex(userKey, 900, msg.body);  // 900 segundos = 15 minutos

    await msg.reply(`Hola, recibí tu mensaje: ${msg.body}`);
}

module.exports = { manejarMensaje };
