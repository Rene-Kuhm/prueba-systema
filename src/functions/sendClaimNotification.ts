import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const sendClaimNotification = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // Manejo específico para la solicitud de preflight OPTIONS
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.set('Access-Control-Max-Age', '3600');
            return res.status(204).send('');
        }

        // Para solicitudes que no son OPTIONS
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        try {
            const claim = req.body.claim;

            if (!claim || !claim.technicianId) {
                return res.status(400).json({ error: 'Invalid claim data' });
            }

            // Obtener el token FCM del técnico
            const technicianDoc = await admin.firestore().collection('technicians').doc(claim.technicianId).get();
            const technicianFcmToken = technicianDoc.data()?.fcmToken;

            if (!technicianFcmToken) {
                return res.status(400).json({ error: 'Technician FCM token not found' });
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
            return res.status(200).json({ success: true, message: 'Notification sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ error: 'Error sending notification' });
        }
    });
});