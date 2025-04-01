const axios = require('axios');
require('dotenv').config();


async function obtenerRespuestaGPT(pregunta, whatsappNumber, historial) {
    try {
        if (typeof pregunta !== 'string') {
            pregunta = String(pregunta); // Convertir a string si no lo es
        }

        // Combinar `msg` con `historial` en un formato adecuado
        const contexto = historial.join('. ') + '. ' + pregunta;

        console.log("contexto", contexto);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres un asistente profesional y amigable chileno que responde preguntas' },
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
        console.log('Respuesta completa:', response.data);

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('⚠️ Error al consultar OpenAI perro:', error.response?.data || error.message);
        return 'No puedo responder en este momento.';
    }
}

module.exports = { obtenerRespuestaGPT };
