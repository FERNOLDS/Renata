
const axios = require('axios');

async function tipo2(msg, whatsappNumber, historial) {
    try {
                //agregar logica para que  chat gpt encuentre la respuesta en mi base de datoss vectorial 

    } catch (error) {
        console.error('⚠️ Error al consultar OpenAI:', error.response?.data || error.message);
        return 'No puedo responder en este momento.';
    }

}

module.exports = { tipo2 };
