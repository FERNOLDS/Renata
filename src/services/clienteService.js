require('dotenv').config();

const pool = require('../config/database');

// Verificar si un número de WhatsApp está registrado en la base de datos
async function verificarCliente(whatsappNumber) {
    try {
        const res = await pool.query('SELECT id_company FROM company WHERE phone = $1', [whatsappNumber]);
        if (res.rows.length > 0) {

            const id_company = res.rows[0].id_company; // Extraer directamente el valor numérico
            console.log("ID de la compañía encontrada:", id_company);
            return Number(id_company); // Asegurarte de que sea un número entero
        }
        console.log("cliente no es representante legal de ninguna empresa");

        return null; // No existe

    }catch (error) {
        console.error("❌ Error en verificarCliente:", error);
        return null;
    }
    
}

async function EncontrarNombre(id_company) {
    console.log("id_company", id_company);

    // Validar que id_company sea un número entero
    if (isNaN(id_company) || !Number.isInteger(Number(id_company))) {
        console.error('❌ Error: id_company no es un número entero válido:', id_company);
        return null;
    }

    const res = await pool.query('SELECT rep_legal FROM company WHERE id_company = $1', [id_company]);
    if (res.rows.length > 0) {

        const nombre = res.rows[0].rep_legal; // Obtener el valor como cadena
        console.log("Nombre del representante legal:", nombre);
        return nombre; // Retorna el cliente encontrado
        
        
    }
   
    console.log("nombre del representante legal", nombre);
    return null; // No existe
}



module.exports = {
    verificarCliente, EncontrarNombre
};
