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
  // Configurar manualmente los encabezados CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight request OPTIONS
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
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
