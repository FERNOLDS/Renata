require('dotenv').config();

const pool = require('../config/database');

// Verificar si un número de WhatsApp está registrado en la base de datos
async function verificarCliente(whatsappNumber) {
    const res = await pool.query('SELECT id_company FROM company WHERE phone = $1', [whatsappNumber]);
    if (res.rows.length > 0) {
        return res.rows[0]; // Retorna el cliente encontrado
    }
    console.log("cliente no es representante legal de ninguna empresa");

    return null; // No existe
}

async function EncontrarNombre(id_company) {
    const nombre = await pool.query('SELECT rep_legal FROM company WHERE id_company = $1', [id_company]);
    if (nombre.rows.length > 0) {
        return nombre.rows[0]; // Retorna el cliente encontrado
        
    }
   
    return null; // No existe
}



module.exports = {
    verificarCliente, EncontrarNombre
};
