import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Tipos para el payload
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

// Validador de payload
const isValidPayload = (payload: unknown): payload is NotificationPayload => {
  return !!(
    payload &&
    typeof payload === "object" &&
    "notification" in payload &&
    "data" in payload &&
    "token" in payload &&
    payload.notification &&
    typeof payload.notification === "object" &&
    "title" in payload.notification &&
    "body" in payload.notification &&
    payload.data &&
    typeof payload.data === "object" &&
    "claimId" in payload.data &&
    "customerName" in payload.data &&
    "customerAddress" in payload.data &&
    "customerPhone" in payload.data &&
    "reason" in payload.data
  );
};

export const sendClaimNotification = functions.https.onRequest(async (request, response) => {
  // Configurar CORS
  response.set("Access-Control-Allow-Origin", "https://www.tdpblog.com.ar");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Max-Age", "3600");

  // Manejar preflight request
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  try {
    // Verificar método HTTP
    if (request.method !== "POST") {
      response.status(405).json({
        success: false,
        error: "Solo se acepta el método POST",
      });
      return;
    }

    // Validar el payload
    const payload = request.body;
    if (!isValidPayload(payload)) {
      response.status(400).json({
        success: false,
        error: "Payload inválido: Faltan campos requeridos",
      });
      return;
    }

    try {
      // Construir el mensaje para FCM
      const message: admin.messaging.Message = {
        notification: {
          title: payload.notification.title,
          body: payload.notification.body,
        },
        data: {
          claimId: payload.data.claimId,
          customerName: payload.data.customerName,
          customerAddress: payload.data.customerAddress,
          customerPhone: payload.data.customerPhone,
          reason: payload.data.reason,
        },
        token: payload.token,
      };

      // Enviar la notificación
      const messageId = await admin.messaging().send(message);

      response.status(200).json({
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
      });
    } catch (fcmError) {
      console.error("Error al enviar notificación FCM:", fcmError);
      response.status(500).json({
        success: false,
        error: "Error al enviar la notificación Push",
        details: fcmError instanceof Error ? fcmError.message : undefined,
      });
    }
  } catch (error) {
    console.error("Error en la función:", error);
    response.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : undefined,
    });
  }
});
