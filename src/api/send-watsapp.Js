import { Request, Response } from 'express';
import twilio from 'twilio'; // Ensure you import twilio

export default async (Request, Responce) => {
    const { VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, VITE_TWILIO_PHONE_NUMBER } = process.env;

    // Example usage of req to get the recipient's phone number from the request body
    const { to, message } = req.body; // Assuming you're sending a JSON body

    const client = twilio(VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN);

    try {
        await client.messages.create({
            body: message,
            from: VITE_TWILIO_PHONE_NUMBER,
            to: `whatsapp:${to}`, // Use the phone number from the request
        });

        res.status(200).json({ message: 'Mensaje de WhatsApp enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el mensaje de WhatsApp:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje de WhatsApp' });
    }
};