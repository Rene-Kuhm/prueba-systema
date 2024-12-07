import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({
    origin: [
        'https://prueba-systema-gn6mvr10q-rene-kuhms-projects.vercel.app',
        'http://localhost:5173', // Para desarrollo local
        // Añade aquí otros dominios que necesites permitir
    ],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

export const sendClaimNotification = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        // Manejar la solicitud de preflight OPTIONS
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        // Verificar que el método sea POST
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method Not Allowed' });
            return;
        }

        try {
            const claim = req.body.claim;

            // Validar los datos del claim
            if (!claim || !claim.technicianId) {
                res.status(400).json({ error: 'Invalid claim data' });
                return;
            }

            // Obtener el token FCM del técnico
            const technicianDoc = await admin.firestore().collection('technicians').doc(claim.technicianId).get();
            const technicianFcmToken = technicianDoc.data()?.fcmToken;

            if (!technicianFcmToken) {
                res.status(400).json({ error: 'Technician FCM token not found' });
                return;
            }

            // Preparar el mensaje de notificación
            const message = {
                notification: {
                    title: 'New Claim Assigned',
                    body: `A new claim has been assigned to you: ${claim.reason}`
                },
                token: technicianFcmToken
            };

            // Enviar la notificación
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
            res.status(200).json({ success: true, message: 'Notification sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Error sending notification' });
        }
    });
});