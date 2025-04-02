
const axios = require('axios');
require('dotenv').config();
const pool = require('../../config/database'); // Conexión al pool de PostgreSQL

async function buscarNormativa(preguntaUsuario) {
    try {
        // Convertimos la pregunta del usuario en un embedding
        const embeddingResponse = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                model: 'text-embedding-ada-002', // Modelo de embeddings
                input: preguntaUsuario,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        let embedding = embeddingResponse.data.data[0].embedding;
        const formatoFinal = JSON.stringify(embedding); // Convierte a cadena JSON (compatible con PostgreSQL JSONB)

        // Consulta en la base de datos para buscar el texto más cercano
        const query = `
            SELECT respuesta FROM normativastributariaslaborales 
            ORDER BY embedding <-> $1 
            LIMIT 1;
        `;
        
        const { rows } = await pool.query(query, [formatoFinal]);
        const respuestaString = rows.length ? rows[0].respuesta : "No tengo información al respecto. perro";
        console.log('Respuesta de la base de datos:', respuestaString);

        return respuestaString;
    } catch (error) {
        console.error('⚠️ Error al buscar normativa:', error.message);
        return null;
    }
}

async function tipo2(preguntaUsuario, whatsappNumber, historial) {
    const resutadoVectorial = await buscarNormativa(preguntaUsuario);
    if (!resutadoVectorial) {
        return "No tengo informacion al respecto, hay algo mas en que te pueda ayudar?.";
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Responde con base en la normativa proporcionada, sin inventar información.' },
                    { role: 'user', content: `Pregunta: ${preguntaUsuario}\n\nNormativa relevante: ${resutadoVectorial}` },
                ],
                max_tokens: 150,
                temperature: 0.2,
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
        return 'Hubo un problema al generar la respuesta.';
    }

}

module.exports = { tipo2 };
