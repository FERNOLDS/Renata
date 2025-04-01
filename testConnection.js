require('dotenv').config();
const pool = require('./src/config/database');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa:', res.rows);
    }
    pool.end();
});