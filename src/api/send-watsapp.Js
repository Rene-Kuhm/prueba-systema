import twilio from 'twilio';

// Configurar la función para manejar solicitudes HTTP
export default async function handler(req, res) {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    // Obtener las variables de entorno
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        return res.status(500).json({
            error: 'Faltan las credenciales de Twilio en las variables de entorno.',
        });
    }

    // Obtener el cuerpo de la solicitud
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({
            error: 'Los parámetros "to" y "message" son requeridos.',
        });
    }

    // Crear cliente de Twilio
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    try {
        // Enviar el mensaje de WhatsApp
        const response = await client.messages.create({
            body: message,
            from: `whatsapp:${TWILIO_PHONE_NUMBER}`, // Número de Twilio para WhatsApp
            to: `whatsapp:${to}`, // Número del destinatario
        });

        return res.status(200).json({
            message: 'Mensaje de WhatsApp enviado con éxito',
            data: response,
        });
    } catch (error) {
        console.error('Error al enviar el mensaje de WhatsApp:', error);
        return res.status(500).json({
            error: 'Error al enviar el mensaje de WhatsApp',
            details: error.message,
        });
    }
}
