
const fs = require('fs');

const jsonData = JSON.parse(fs.readFileSync("baseDatos.json", "utf8"));
console.log(transformarEstructura(jsonData));


function transformarEstructura(jsonData) {
    // Extraer la consulta y la lista de columnas
    const query = Object.keys(jsonData)[0];
    const columns = jsonData[query];

    // Crear un diccionario de tablas y sus columnas
    const tablas = {};
    const relaciones = [];

    columns.forEach(({ table_name, column_name, data_type }) => {
        // Agregar la tabla si no existe
        if (!tablas[table_name]) {
            tablas[table_name] = [];
        }
        // Agregar la columna a la tabla
        tablas[table_name].push(`${column_name} (${data_type})`);
    });

    // Identificar relaciones basadas en convenciones de nombres
    Object.entries(tablas).forEach(([tabla, columnas]) => {
        columnas.forEach(columna => {
            if (columna.includes('_id') || columna.includes('id_')) {
                const refTable = columna.split('_id')[0].replace('id_', ''); // Extraer la posible tabla referenciada
                if (tablas[refTable]) {
                    relaciones.push(`- ${tabla}.${columna.split(' ')[0]} → ${refTable}.id`);
                }
            }
        });
    });

    // Construir la estructura en formato de texto
    let estructuraDB = "Tablas:\n";
    Object.entries(tablas).forEach(([tabla, columnas]) => {
        estructuraDB += `- ${tabla} (${columnas.join(', ')})\n`;
    });

    if (relaciones.length > 0) {
        estructuraDB += "Relacionamientos:\n";
        estructuraDB += relaciones.join('\n');
    }

    return estructuraDB;
}


console.log(transformarEstructura(jsonData));
