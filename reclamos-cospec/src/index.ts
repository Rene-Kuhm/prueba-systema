import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();

interface Claim {
    reason: string;
    // Add other fields that your claim object might have
}

const TECH_USER_IDS = [
  "PVchNzWr04Rvi2WIofC8tOO0Kfy2",
  "Pn99XedRMjZrG9UewHkPzVtct0K2",
  "user3_id",
  // Agrega los IDs de los usuarios técnicos aquí
];

export const sendClaimNotification = functions.firestore.onDocumentCreated(
  {
    document: "claims/{claimId}",
  },
  async (event) => {
    const documentPath = event.document; // This is a string representing the document path.
    console.log("Function triggered for document path:", documentPath);

    try {
      const snapshot = await admin.firestore().doc(documentPath).get();
      if (!snapshot.exists) {
        console.error("Document does not exist:", documentPath);
        return;
      }

      const newClaim = snapshot.data() as Claim;
      console.log("New claim data:", newClaim);

      const notification: admin.messaging.WebpushConfig = {
        notification: {
          title: "Nuevo Reclamo",
          body: `Se ha creado un nuevo reclamo: ${newClaim.reason}`,
        },
        data: {
          primaryKey: "new-claim-notification",
        },
      };

      try {
        const response = await admin.messaging().sendToDevice(TECH_USER_IDS, notification);
        console.log("Notificaciones web enviadas con éxito:", response);
      } catch (error) {
        console.error("Error al enviar notificaciones web:", error);
      }

      await snapshot.ref.update({notificationSent: true});
      console.log("Claim updated: notificationSent set to true");
    } catch (error) {
      console.error("Error in sendClaimNotification:", error);
    }
  },
);
