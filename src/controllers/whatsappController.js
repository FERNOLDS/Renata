const axios = require('axios');
const { verificarCliente, EncontrarNombre } = require('../services/clienteService');
const { tipo1 } = require('../services/FuncionesClientes/Tipo1');
const { tipo2 } = require('../services/FuncionesClientes/Tipo2');
const { obtenerHistorial, guardarMensajeEnMemoria } = require('../utils/memoriaUsuarioRedis');
const { procesarMensajeCliente } = require('../services/clasificarPreguntaCliente');
const { obtenerRespuestaGPT } = require('../services/openAIService');
const { procesarMensajeProspecto } = require('../services/clasificarPreguntaProspecto');
const { clase1 } = require('../services/FuncionesProspecto/preguntasProductos');
const { responderConRetraso } = require('../utils/retrasoRespuesta');



// Función que maneja el mensaje y da la respuesta correspondiente
async function manejarMensaje(msg) {
    try {

        const whatsappNumber = msg.from.replace('@c.us', ''); // Limpiar número
        console.log("Mensaje recibido:", msg.body);
        console.log("Número de WhatsApp:", whatsappNumber); 
        const cliente = await verificarCliente(whatsappNumber);

        if (cliente) {
            console.log('Cliente es representante legal de la empresa con ID ', cliente);
            const empresaId = cliente;
            const NombreCliente = await EncontrarNombre(empresaId);
            await msg.reply(`Hola estimado ${NombreCliente}, ¿en qué puedo ayudarte?`);
            const historial = await obtenerHistorial(whatsappNumber);   
            console.log("historial", historial);
    
            // Analizar el mensaje con el contexto guardado
            const tipo = await procesarMensajeCliente(msg.body, whatsappNumber, historial);
            console.log("tipo", tipo);
            if (tipo === 1){
                const respuesta = await tipo1(msg.body, whatsappNumber, historial);
                await msg.reply({respuesta});
            }
            else if (tipo === 2){
                const respuesta = await tipo2(msg.body, whatsappNumber, historial);
                await msg.reply({respuesta});
            }
            else{
                const respuesta = await obtenerRespuestaGPT(msg.body, whatsappNumber, historial);
                await msg.reply({respuesta});

            }    
            // Guardar mensaje en la memoria temporal
            await guardarMensajeEnMemoria(whatsappNumber, msg.body);
    
            
        } else {
            // El cliente no está registrado, ofrecer los servicios
            //await msg.reply(`Hola, no te tengo registrado en el sistema como representante legal de una empresa. ¿En qué puedo ayudarte?`);
        
            // Verificar si el usuario ya tiene historial en memoria
            const historial = await obtenerHistorial(whatsappNumber);
            console.log("historial", historial);
    
            // Analizar el mensaje con el contexto guardado
            const clase = await procesarMensajeProspecto(msg.body, whatsappNumber, historial);
            console.log("clase", clase);
            if (clase === "1"){
                console.log("entro a clase 1");
                const respuesta = await clase1(msg.body, whatsappNumber, historial);
                try {
                    await msg.reply(respuesta.toString());
                } catch (error) {
                    console.error("⚠️ Error al enviar el mensaje a WhatsApp:", error);
                }
            }
            else{
                const respuesta = await obtenerRespuestaGPT(msg.body, whatsappNumber, historial);
                console.log("respuesta de obtenerRespuestaGPT", respuesta);
                console.log("Tipo de dato de respuesta:", typeof respuesta);
                
                try {
                    await msg.reply(respuesta.toString());
                } catch (error) {
                    console.error("⚠️ Error al enviar el mensaje a WhatsApp:", error);
                }
                

            }
    
            // Guardar mensaje en la memoria temporal
            await guardarMensajeEnMemoria(whatsappNumber, msg.body);
        }

    } catch (error) {
        console.error('⚠️ Error al manejar mensaje:', error);
        await msg.reply('Lo siento, hubo un problema procesando tu mensaje. Intenta de nuevo.');
    }
    
}

module.exports = {
    manejarMensaje, 
};
