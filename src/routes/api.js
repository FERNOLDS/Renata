const express = require('express');
const { manejarMensaje } = require('../controllers/whatsappController');

const router = express.Router();

// Ruta para recibir mensajes de WhatsApp
router.post('/whatsapp', async (req, res) => {
    try {
        const { body } = req;
        await manejarMensaje(body); // Procesar el mensaje
        res.status(200).send('Mensaje procesado');
    } catch (error) {
        res.status(500).send('Error al procesar el mensaje');
    }
});

module.exports = router;
