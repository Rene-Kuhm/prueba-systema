import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendClaimNotification = functions.https.onCall(async (data: any, _context) => {
    const claim = data.claim;
    
    if (!claim || !claim.technicianId) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid claim data');
    }

    // Get the technician's FCM token (you need to store this when the technician logs in)
    const technicianDoc = await admin.firestore().collection('technicians').doc(claim.technicianId).get();
    const technicianFcmToken = technicianDoc.data()?.fcmToken;

    if (!technicianFcmToken) {
        throw new functions.https.HttpsError('failed-precondition', 'Technician FCM token not found');
    }

    // Prepare the notification message
    const message = {
        notification: {
            title: 'New Claim Assigned',
            body: `A new claim has been assigned to you: ${claim.reason}`
        },
        token: technicianFcmToken
    };

    // Send the notification
    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
        console.log('Error sending message:', error);
        throw new functions.https.HttpsError('internal', 'Error sending notification');
    }
});