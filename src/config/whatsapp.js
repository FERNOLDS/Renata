const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { manejarMensaje } = require('../controllers/whatsappController');

// Configuración del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot de WhatsApp listo');
});
client.on('message', async (msg) => {
    console.log('Mensaje recibido:', msg);
    await manejarMensaje(msg);
});

client.initialize();

module.exports = client;
