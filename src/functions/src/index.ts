import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.sendClaimNotification = functions.firestore
    .onDocumentCreated('claims/{claimId}', async (event) => {
        const snap = event.data;
        if (!snap) {
            console.log('No data associated with the event');
            return;
        }

        const newClaim = snap.data();
        const technicianId = newClaim.technicianId;

        // Obtener el token FCM del técnico
        const technicianDoc = await admin.firestore().collection('technicians').doc(technicianId).get();
        const technicianFcmToken = technicianDoc.data()?.fcmToken;

        if (!technicianFcmToken) {
            console.log('No FCM token for technician:', technicianId);
            return;
        }

        const message = {
            notification: {
                title: 'New Claim Assigned',
                body: `A new claim has been assigned to you: ${newClaim.reason}`
            },
            token: technicianFcmToken
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('Notification sent successfully:', response);
            
            // Actualizar el documento de la reclamación
            await snap.ref.update({ notificationSent: true });
        } catch (error) {
            console.log('Error sending notification:', error);
        }
    });