
const axios = require('axios');

async function tipo1(msg, whatsappNumber, historial) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres un asistente que crea una consulta sql, en base a la pregunta del cliente, y la estructura de mi base de datos' },
                    { role: 'user', content: historial,msg },
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

    //agregar logica para que segun la respuesta de chat gpt (consulta querie) el sistema realize la consulta en mi base de datos y la respuesta sea devuelta
}

module.exports = { tipo1 };
