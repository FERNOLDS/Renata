const redis = require('redis');

(async () => {
    const client = redis.createClient();

    client.on('error', (err) => console.log('❌ Error en Redis:', err));

    await client.connect();

    try {
        // Prueba de escritura y lectura
        await client.set('test_key', 'Hola Redis wachin!');
        const value = await client.get('test_key');

        console.log('✅ Conexión a Redis exitosa, valor recuperado:', value);
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        await client.disconnect();
    }
})();
