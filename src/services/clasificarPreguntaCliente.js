
const axios = require('axios');


async function procesarMensajeCliente(msg, whatsappNumber, historial, cliente) {
    try {

        if (typeof msg !== 'string') {
            msg = String(msg); // Convertir a string si no lo es
        }

        const contexto = [...historial, msg].join('\n'); // Une historial y msg en un único string con saltos de línea
        console.log("contexto", contexto);


        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres un asistente que logra identificar el tipo de mensaje de mi cliente, debes responder 1 si el mensaje es relacionado a una consulta de su empresa, 2 si el mensaje es relacionado a una normativa tributaria o laboral y 3 si es un mensaje que no esta relacionado al 1 y 2.' },
                    { role: 'user', content: contexto },
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('⚠️ Error al consultar OpenAI:', error.response?.data || error.message);
        return 'No puedo responder en este momento.';
    }
}

module.exports = { procesarMensajeCliente };
