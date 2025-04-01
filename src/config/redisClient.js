const Redis = require('ioredis');

// Conectar a Redis (por defecto usa localhost y puerto 6379)
const redis = new Redis();

redis.on('connect', () => console.log('✅ Conectado a Redis'));
redis.on('error', (err) => console.error('❌ Error en Redis:', err));

(async () => {
    try {
        // Guardar un valor en Redis
        await redis.set('test_key', 'Hola desde ioredis!');
        
        // Recuperar el valor almacenado
        const value = await redis.get('test_key');
        console.log('🔹 Valor obtenido de Redis:', value);

        // Cerrar conexión
        redis.quit();
    } catch (error) {
        console.error('⚠️ Error al conectar a Redis:', error);
    }
})();
