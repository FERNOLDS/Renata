
const axios = require('axios');
const { pool } = require('../../config/database'); // Conexión a PostgreSQL con pgvector


async function buscarServicio(preguntaUsuario) {
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
        console.error('⚠️ Error al buscar servicio:', error);
        return null;
    }
}
async function clase1(preguntaUsuario, whatsappNumber, historial) {
    const resutadoVectorial = await buscarServicio(preguntaUsuario);
    if (!resutadoVectorial) {
        return "No tengo informacion al respecto, hay algo mas en que te pueda ayudar?.";
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-mini',
            messages: [
                { role: 'system', content: 'Responde con base en los servicios proporcionada, sin inventar información.' },
                { role: 'user', content: `Pregunta: ${preguntaUsuario}\n\nServicio Relevante: ${resutadoVectorial}` }
            ],
            max_tokens: 200,
            temperature: 0.5
        });

        return response.choices[0].message.content;
        

    } catch (error) {
        console.error('⚠️ Error al consultar OpenAI:', error.response?.data || error.message);
        return 'Hubo un problema al generar la respuesta.';
    }

}

module.exports = { clase1 };
