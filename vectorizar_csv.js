require('dotenv').config(); // Cargar variables de entorno
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./src/config/database'); // Conexión al pool de PostgreSQL

const axios = require('axios');
const archivoCSV = './preguntas.csv';

// Obtener embeddings desde OpenAI usando axios
async function obtenerEmbeddings(texto) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                model: 'text-embedding-ada-002', // Modelo de embeddings
                input: texto,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.data[0].embedding; // Extraer embedding de respuesta
    } catch (error) {
        console.error('⚠️ Error al generar embedding:', error.response?.data || error.message);
        return null;
    }
}

// Almacenar embeddings en PostgreSQL
async function almacenarEmbeddings(pregunta, embedding, respuesta) {
    try {

        // Convertir y validar el formato del embedding
        const formattedEmbedding = `{${embedding.map(value => {
            if (typeof value !== 'number') {
                throw new Error(`El valor no es numérico: ${value}`);
            }
            return value.toString();
        }).join(',')}}`;

        const formatoFinal = formattedEmbedding.replace('{', '[').replace('}', ']');



        const query = `
            INSERT INTO normativasTributariasLaborales (pregunta, embedding, respuesta) 
            VALUES ($1, $2, $3)
        `;
        await pool.query(query, [pregunta, formatoFinal, respuesta]);
        console.log(`✅ Insertado: ${pregunta}`);
    } catch (error) {
        console.error('⚠️ Error al insertar en la base de datos:', error.message);
    }
}

// Procesar el archivo CSV y cargar los datos en la base de datos
async function procesarCSV(archivoCSV) {
    const datos = []; // Almacenar filas del CSV temporalmente
    try {
        // Leer el archivo CSV
        fs.createReadStream(archivoCSV)
            .pipe(csv())
            .on('data', (row) => {
                datos.push(row); // Añadir fila a la lista
            })
            .on('end', async () => {
                console.log('📂 Archivo CSV procesado. Generando embeddings...');
                for (const row of datos) {
                    const pregunta = row.pregunta.trim(); // Limpiar pregunta
                    const respuesta = row.respuesta.trim(); // Limpiar respuesta
                    const embedding = await obtenerEmbeddings(pregunta); // Generar embedding
                    if (embedding) {
                        await almacenarEmbeddings(pregunta, embedding, respuesta); // Guardar en BD
                    }
                }
                console.log('✅ Todos los datos han sido procesados e insertados en la base de datos.');
            });
    } catch (error) {
        console.error('⚠️ Error procesando el archivo CSV:', error.message);
    }
}

// Ejecutar procesamiento del archivo CSV
procesarCSV(archivoCSV);
