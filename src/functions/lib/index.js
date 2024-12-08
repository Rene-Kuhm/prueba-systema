"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClaimNotification = void 0;
const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();
exports.sendClaimNotification = functions.firestore
    .onDocumentCreated('claims/{claimId}', async (event) => {
    var _a;
    console.log('Function triggered for claim:', event.params.claimId);
    const snap = event.data;
    if (!snap) {
        console.log('No data associated with the event');
        return;
    }
    const newClaim = snap.data();
    console.log('New claim data:', newClaim);
    const adminUserIds = [
        'Pn99XedRMjZrG9UewHkPzVtct0K2',
        // Otros IDs...
    ];
    try {
        for (const adminUserId of adminUserIds) {
            console.log('Processing admin:', adminUserId);
            const userDoc = await admin.firestore().collection('users').doc(adminUserId).get();
            if (!userDoc.exists) {
                console.log(`User document not found for admin: ${adminUserId}`);
                continue;
            }
            const userFcmToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
            if (!userFcmToken) {
                console.log(`No FCM token found for admin: ${adminUserId}`);
                continue;
            }
            console.log(`FCM token found for admin: ${adminUserId}`);
            const message = {
                notification: {
                    title: 'Nuevo Reclamo',
                    body: `Se ha creado un nuevo reclamo: ${newClaim.reason}`
                },
                token: userFcmToken
            };
            try {
                const response = await admin.messaging().send(message);
                console.log(`Notification sent successfully to ${adminUserId}:`, response);
            }
            catch (sendError) {
                console.error(`Error sending notification to ${adminUserId}:`, sendError);
            }
        }
        await snap.ref.update({ notificationSent: true });
        console.log('Claim updated: notificationSent set to true');
    }
    catch (error) {
        console.error('Error in sendClaimNotification:', error);
    }
});
//# sourceMappingURL=index.js.map