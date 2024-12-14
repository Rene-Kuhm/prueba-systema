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

export const sendNotification = functions.https.onRequest(async (req, res) => {
    try {
        const payload = req.body as NotificationPayload;
        const { notification, data, token } = payload;

        const message = {
            notification,
            data,
            token
        };

        const result = await admin.messaging().send(message);
        res.json({ success: true, result });
    } catch (error: unknown) {
        console.error('Error sending notification:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        });
    }
});