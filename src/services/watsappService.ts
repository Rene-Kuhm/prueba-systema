

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;


export async function sendWhatsAppMessage(to: string, body: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;


    const formData = new URLSearchParams();
    formData.append('To', `whatsapp:${to}`);
    formData.append('From', TWILIO_WHATSAPP_NUMBER);
    formData.append('Body', body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Mensaje de WhatsApp enviado con éxito', data.sid);
        return data;
    } catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
        throw error;
    }
}