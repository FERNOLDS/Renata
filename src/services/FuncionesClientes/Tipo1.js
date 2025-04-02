const axios = require('axios');

const  pool  = require('../../config/database'); // Conexión a PostgreSQL con pgvector
require('dotenv').config();


// Estructura de la base de datos (debe actualizarse según tu esquema real)

const estructuraDB = `Tablas:
- clasificador_proveedores_gastos (id_company (integer), id_proveedor (integer), id_tipo_gasto (integer), rut_proveedor (character varying))
- gastos_imagen (fecha_carga (timestamp without time zone), id (integer), id_company (integer), fecha (date), total (integer), iva (integer), neto (integer), folio (integer), registrado (boolean), id_usuario (integer), categoria_gasto (integer), rut (character varying), articulos (text))
- libro_mayor (id (integer), sum_debe (numeric), sum_haber (numeric), sum_deudor (numeric), sum_acreedor (numeric), fecha (timestamp without time zone), calculado (boolean), id_company (integer), id_cuenta (integer), cuenta (character varying))
- balance_general (id (integer), debe (integer), haber (integer), deudor (integer), acreedor (integer), activo (integer), pasivo (integer), perdida (integer), ganancia (integer), fecha (date), usuario (integer), mes (integer), anual (integer), id_company (integer), cuenta (character varying))
- facturas_compra (id (integer), nro (integer), fecha_docto (date), fecha_recepcion (date), fecha_acuse (date), monto_exento (numeric), monto_neto (numeric), monto_iva_recuperable (numeric), monto_iva_no_recuperable (numeric), monto_total (numeric), monto_neto_activo_fijo (numeric), iva_activo_fijo (numeric), iva_uso_comun (numeric), impto_sin_derecho_a_credito (numeric), iva_no_retenido (numeric), tabacos_puros (numeric), tabacos_cigarrillos (numeric), tabacos_elaborados (numeric), valor_otro_impuesto (numeric), tasa_otro_impuesto (numeric), registrado (boolean), id_company (integer), folio (character varying), nce_nde_sobre_factura_compra (character varying), codigo_iva_no_rec (character varying), codigo_otro_impuesto (character varying), tipo_doc (character varying), tipo_compra (character varying), rut_proveedor (character varying), razon_social (character varying))
- boletas_honorarios (id (integer), id_company (integer), fecha (date), numero_boleta (integer), fecha_anulacion (date), bruto (integer), retenido (integer), pagado (integer), fecha_carga (timestamp without time zone), id_usuario (integer), registrado (boolean), rut (character varying), nombre_razon_social (character varying), es_soc_prof (character varying), estado (character varying))
- clasificador_cuentas (id_cuenta (integer), tipo_cuenta (character varying), nombre_cuenta (character varying))
- tipo_gasto (id_tipo_gasto (integer), nombre_gasto (character varying))
- facturas_venta (id (integer), nro (integer), fecha_docto (date), fecha_recepcion (date), fecha_acuse (date), fecha_reclamo (date), monto_exento (numeric), monto_neto (numeric), monto_iva (numeric), monto_total (numeric), iva_retenido_total (numeric), iva_retenido_parcial (numeric), iva_no_retenido (numeric), iva_propio (numeric), iva_terceros (numeric), neto_comision_liquid_factura (numeric), exento_comision_liquid_factura (numeric), iva_comision_liquid_factura (numeric), iva_fuera_plazo (numeric), credito_empresa_constructora (numeric), impto_zona_franca (numeric), garantia_dep_envases (numeric), indicador_venta_sin_costo (integer), indicador_servicio_periodico (integer), monto_no_facturable (numeric), total_monto_periodo (numeric), venta_pasajes_transporte_nacional (numeric), venta_pasajes_transporte_internacional (numeric), valor_otro_impuesto (numeric), tasa_otro_impuesto (numeric), registrado (boolean), id_company (integer), codigo_sucursal (character varying), nce_nde_sobre_fact_compra (character varying), codigo_otro_impuesto (character varying), tipo_doc (character varying), tipo_venta (character varying), rut_cliente (character varying), razon_social (character varying), folio (character varying), rut_emisor_liquid_factura (character varying), tipo_docto_referencia (character varying), folio_docto_referencia (character varying), num_ident_receptor_extranjero (character varying), nacionalidad_receptor_extranjero (character varying), numero_interno (character varying))
- comprobantes (id_comprobante (integer), id_company (integer), id_usuario (integer), fecha (date), neto (integer), iva (integer), total (integer), comision (integer), depositado (integer), registrado (boolean), terminal (character varying), tipo (character varying), estado (character varying))
- company (id_company (integer), created_at (timestamp without time zone), is_active (boolean), creado_por (integer), name (character varying), rut (character varying), address (character varying), rep_legal (character varying), email (character varying), phone (character varying), area (character varying))
- boletas_sii (id (integer), id_company (integer), id_usuario (integer), folio (integer), neto (numeric), iva (numeric), total (numeric), dte (integer), fecha (timestamp with time zone), registrado (boolean), vendedor (character varying), sucursal (character varying), estado_boleta (character varying))
- asientos_contables (id (integer), fecha (date), debe (integer), usuario_id (integer), haber (integer), id_registro (integer), fecha_registro (date), calculado (boolean), id_company (integer), descripcion (text), tipo (character varying), categoria (character varying), cuenta (character varying))
Relacionamientos:
- asientos_contables.usuario_id → usuario.id`;


function limpiarRespuestaSQL(respuesta) {
    try {
        // Buscar el inicio de la consulta SQL
        const inicio = respuesta.indexOf('SELECT');
        const fin = respuesta.lastIndexOf(';'); // Buscar el último punto y coma
        if (inicio !== -1 && fin !== -1) {
            // Extraer la consulta SQL
            const query = respuesta.substring(inicio, fin + 1).trim();
            return query;
        } else {
            throw new Error('No se encontró una consulta SQL válida en la respuesta.');
        }
    } catch (error) {
        console.error('⚠️ Error limpiando la respuesta SQL:', error.message);
        return null;
    }
}




async function generarConsultaSQL(msg, whatsappNumber, historial, id_company) {
    try {
        if (isNaN(id_company)) {
            throw new Error('❌ id_company no es un número válido.');
        }


        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', 
                    content: 'Eres un asistente que crea una consulta SQL en base a la pregunta del cliente y la estructura de la base de datos. La consulta SQL generada debe incluir siempre un filtro WHERE id_company = {id_company} para asegurar que los resultados solo correspondan a la empresa específica, la respuesta debe ser solamente la consulta SQL.',              
                  },

                    { role: 'user', content: `Estructura de la base de datos:
${estructuraDB}

Historial:
${historial}

Pregunta:
${msg}
Recuerda: La consulta debe incluir SIEMPRE un filtro WHERE id_company = ${id_company}.
` },
                ],
                max_tokens: 300,
                temperature: 0.3,
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
        console.error('⚠️ Error al generar consulta SQL:', error.response?.data || error.message);
        return null;
    }
}

async function ejecutarConsultaSQL(consultaSQL) {
    console.log('Ejecutando la consulta SQL:',consultaSQL);

    try {
        
        const resultado = await pool.query(consultaSQL);
    
        return resultado.rows;
    } catch (error) {
        console.error('⚠️ Error ejecutando la consulta SQL:', error.message);
        return [];
    }
}


async function tipo1(msg, whatsappNumber, historial, id_company) {
    const consultaSQL = await generarConsultaSQL(msg, whatsappNumber, historial, id_company);


    if (!consultaSQL) {
        console.error('No se pudo generar la consulta SQL.');
    }

    // Limpiar la respuesta de la IA
    const consultaSQLlimpia = limpiarRespuestaSQL(consultaSQL);
    if (!consultaSQL) {
        console.error('No se pudo limpiar la consulta SQL.');
        return 'Error al procesar la consulta SQL.';
    }

    console.log('Consulta SQL limpia:', consultaSQLlimpia);

    const resultado = await ejecutarConsultaSQL(consultaSQLlimpia);
    if (!resultado) {
        console.error('No se pudo ejecutar la consulta SQL.');
        return 'Error al ejecutar la consulta SQL.';
    }

    // Convertir resultado a string
    const respuestaTexto = resultado
        .map(row => Object.values(row).join(', ')) // Convierte cada fila a un string
        .join('\n'); // Une las filas con saltos de línea
    console.log("Respuesta procesada:", respuestaTexto);
    return respuestaTexto;
}

module.exports = { tipo1 };


