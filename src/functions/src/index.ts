import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

// Configuración de CORS
const corsHandler = cors({
  origin: [
    'https://www.tdpblog.com.ar', // Dominio de producción
    'http://localhost:5173',      // Localhost para pruebas (Vite)
    'http://localhost:3000'       // Localhost común
  ],
  methods: ['POST', 'OPTIONS'],    // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true,               // Permitir credenciales
});

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
  // Manejo de CORS usando corsHandler
  corsHandler(req, res, async () => {
    try {
      // Verificar el método HTTP
      if (req.method === 'OPTIONS') {
        // Responder a preflight CORS request
        res.status(204).send('');
        return;
      }

      if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method Not Allowed' });
        return;
      }

      // Extraer el payload del body
      const payload = req.body as NotificationPayload;
      const { notification, data, token } = payload;

      // Crear el mensaje de Firebase
      const message = {
        notification,
        data,
        token,
      };

      // Enviar notificación
      const result = await admin.messaging().send(message);
      res.status(200).json({ success: true, result });
    } catch (error: unknown) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  });
});
