// services/whatsappService.ts

interface WhatsAppMessage {
    to: string;
    body: string;
  }
  
  export const sendWhatsAppMessage = async ({ to, body }: WhatsAppMessage) => {
    try {
      // Verifica que las variables de entorno existan
      const token = import.meta.env.VITE_ULTRAMSG_TOKEN;
      const instance = import.meta.env.VITE_ULTRAMSG_INSTANCE;
  
      if (!token || !instance) {
        throw new Error('Faltan las credenciales de Ultramsg');
      }
  
      // Limpia el número de teléfono
      const cleanPhone = to.replace(/[\s+\-]/g, '');
      // Asegúrate que tenga el código de país
      const formattedPhone = cleanPhone.startsWith('54') ? cleanPhone : `54${cleanPhone}`;
      
      const url = `https://api.ultramsg.com/${instance}/messages/chat`;
      
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('to', formattedPhone);
      params.append('body', body);
      params.append('priority', '1');
      params.append('referenceId', '');
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar mensaje de WhatsApp');
      }
  
      const data = await response.json();
      return data.sent;
    } catch (error) {
      console.error('Error en sendWhatsAppMessage:', error);
      return false;
    }
  };