import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface NotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    claimId: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    reason: string;
  };
  token: string;
}

export const sendClaimNotification = functions.https.onRequest((req, res) => {
    const cors = require('cors')({
        origin: ['https://www.tdpblog.com.ar']
    });
  // Configurar manualmente los encabezados CORS
  res.set('Access-Control-Allow-Origin', 'https://www.tdpblog.com.ar'); // Ajusta esto a tu dominio exacto
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Asegurarse de que siempre hay una respuesta JSON válida
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Validar que la solicitud es POST
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const payload = req.body as NotificationPayload;
    
    if (!payload || !payload.token || !payload.notification) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid payload' 
      });
      return;
    }

    const { notification, data, token } = payload;

    const message = {
      notification,
      data,
      token,
    };

    // Enviar la notificación usando Firebase Admin
    admin.messaging()
      .send(message)
      .then((result) => res.status(200).json({ success: true, result }))
      .catch((error) => {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: error.message });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
});
