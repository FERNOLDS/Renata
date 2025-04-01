async function responderConRetraso(msg, respuesta) {
    setTimeout(async () => {
        await msg.reply(respuesta);
    }, 5000); // Espera 5 segundos antes de responder
}

module.exports= {responderConRetraso, }