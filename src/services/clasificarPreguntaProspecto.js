
const axios = require('axios');

async function procesarMensajeProspecto(msg, whatsappNumber, historial) {
    try {
        if (typeof msg !== 'string') {
            msg = String(msg); // Convertir a string si no lo es
        }

        // Combinar `msg` con `historial` en un formato adecuado
        const contexto = [...historial, msg].join('\n'); // Une historial y msg en un único string con saltos de línea
       
        console.log("contexto", contexto);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres un asistente que logra identificar el tipo de mensaje de mi cliente, debes responder 1 si el mensaje es relacionado a una consulta de los servicios que ofrece mi empresa, 2 si el mensaje es de otro tipo' },
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

module.exports = { procesarMensajeProspecto };
