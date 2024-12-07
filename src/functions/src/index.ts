import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendClaimNotification = functions.firestore
    .onDocumentCreated('claims/{claimId}', async (event) => {
        const snap = event.data;
        if (!snap) {
            console.log('No data associated with the event');
            return;
        }

        const newClaim = snap.data();
        const claimId = event.params.claimId;

        // Asumimos que tienes un campo 'adminUserId' en alguna parte de tu configuración
        // que indica quién debe recibir las notificaciones de nuevos reclamos
        const adminUserId = 'Pn99XedRMjZrG9UewHkPzVtct0K2'; // Reemplaza esto con el ID real del usuario admin

        try {
            // Obtener el token FCM del usuario admin
            const userDoc = await admin.firestore().collection('users').doc(adminUserId).get();
            const userFcmToken = userDoc.data()?.fcmToken;

            if (!userFcmToken) {
                console.log('No FCM token found for the admin user');
                return;
            }

            // Preparar el mensaje de notificación
            const message = {
                notification: {
                    title: 'Nuevo Reclamo',
                    body: `Se ha creado un nuevo reclamo: ${newClaim.reason}`
                },
                data: {
                    claimId: claimId,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK' // Esto es para aplicaciones Flutter
                },
                token: userFcmToken
            };

            // Enviar la notificación
            const response = await admin.messaging().send(message);
            console.log('Notification sent successfully:', response);

            // Actualizar el documento del reclamo para indicar que se envió la notificación
            await snap.ref.update({ notificationSent: true });

        } catch (error) {
            console.error('Error in sendClaimNotification:', error);
        }
    });