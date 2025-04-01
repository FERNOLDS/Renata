
const axios = require('axios');

const { pool } = require('../../config/database'); // Conexión a PostgreSQL con pgvector

require('dotenv').config();

async function buscarNormativa(preguntaUsuario) {
    try {
        // Convertimos la pregunta del usuario en un embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: preguntaUsuario
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Consulta en la base de datos para buscar el texto más cercano
        const query = `
            SELECT texto FROM normativas 
            ORDER BY embedding <-> $1 
            LIMIT 1;
        `;
        const { rows } = await pool.query(query, [embedding]);

        return rows.length ? rows[0].texto : null;
    } catch (error) {
        console.error('⚠️ Error al buscar normativa:', error);
        return null;
    }
}

async function tipo2(preguntaUsuario, whatsappNumber, historial) {
    const resutadoVectorial = await buscarNormativa(preguntaUsuario);
    if (!resutadoVectorial) {
        return "No tengo informacion al respecto, hay algo mas en que te pueda ayudar?.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-mini',
            messages: [
                { role: 'system', content: 'Responde con base en la normativa proporcionada, sin inventar información.' },
                { role: 'user', content: `Pregunta: ${preguntaUsuario}\n\nNormativa relevante: ${resutadoVectorial}` }
            ],
            max_tokens: 200,
            temperature: 0.5
        });

        return response.choices[0].message.content;
                //agregar logica para que  chat gpt encuentre la respuesta en mi base de datoss vectorial 

    } catch (error) {
        console.error('⚠️ Error al consultar OpenAI:', error.response?.data || error.message);
        return 'Hubo un problema al generar la respuesta.';
    }

}

module.exports = { tipo2 };
