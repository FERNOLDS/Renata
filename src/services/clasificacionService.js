const { generarConsultaSQL } = require('../utils/queryGenerator');
const { buscarEnBaseVectorial } = require('../utils/vectorDB');
const { obtenerRespuestaGPT } = require('./openAIService');
const { consultarBaseDeDatos } = require('../services/postgreSQLService');

// Procesa preguntas de clientes con empresa registrada
async function procesarPreguntaCliente(pregunta, empresaId) {
    try {
        if (pregunta.toLowerCase().includes('iva') || pregunta.toLowerCase().includes('impuesto')) {
            console.log('🟢 Generando consulta SQL...');
            const sqlQuery = generarConsultaSQL(pregunta, empresaId);
            const resultado = await consultarBaseDeDatos(sqlQuery);
            return resultado || 'No encontré información en la base de datos.';
        }

        console.log('🟠 Buscando en base de datos vectorial...');
        const normativa = await buscarEnBaseVectorial(pregunta);
        return normativa || await obtenerRespuestaGPT(pregunta);
    } catch (error) {
        console.error('⚠️ Error procesando pregunta cliente:', error);
        return 'Hubo un problema procesando tu solicitud.';
    }
}

// Procesa preguntas de prospectos (clientes no registrados)
async function procesarPreguntaProspecto(pregunta) {
    try {
        return await obtenerRespuestaGPT(pregunta);
    } catch (error) {
        console.error('⚠️ Error procesando pregunta prospecto:', error);
        return 'No puedo responder en este momento.';
    }
}

module.exports = { procesarPreguntaCliente, procesarPreguntaProspecto };
