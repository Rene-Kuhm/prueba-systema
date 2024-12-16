import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as corsLib from 'cors';

// Initialize Firebase Admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize CORS middleware
const cors = corsLib({
  origin: 'https://www.tdpblog.com.ar',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
});

// Type definitions
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

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

interface SuccessResponse {
  success: true;
  result: string; // Firebase returns message ID as string
}

export const sendClaimNotification = functions.https.onRequest((req, res) => {
  return new Promise((resolve) => {
    cors(req, res, async () => {
      try {
        // Validate HTTP method
        if (req.method !== 'POST') {
          const response: ErrorResponse = {
            success: false,
            error: 'Method Not Allowed'
          };
          res.status(405).json(response);
          return resolve();
        }

        // Validate payload
        const payload = req.body as NotificationPayload;
        if (!isValidPayload(payload)) {
          const response: ErrorResponse = {
            success: false,
            error: 'Invalid payload: Missing required fields'
          };
          res.status(400).json(response);
          return resolve();
        }

        const { notification, data, token } = payload;

        const message: admin.messaging.Message = {
          notification,
          data,
          token,
        };

        try {
          // Send Firebase Cloud Messaging notification
          const messageId = await admin.messaging().send(message);
          const response: SuccessResponse = {
            success: true,
            result: messageId
          };
          res.status(200).json(response);
        } catch (error) {
          console.error('Messaging Error:', error);
          const response: ErrorResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Firebase Messaging Error',
            details: error instanceof Error ? error.stack : error
          };
          res.status(500).json(response);
        }

      } catch (error) {
        console.error('Notification Error:', error);
        const response: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unexpected server error',
          details: error instanceof Error ? error.stack : error
        };
        res.status(500).json(response);
      }
      resolve();
    });
  });
});

// Helper function to validate payload
function isValidPayload(payload: unknown): payload is NotificationPayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as NotificationPayload;
  
  return Boolean(
    p.notification?.title &&
    p.notification?.body &&
    p.data?.claimId &&
    p.data?.customerName &&
    p.data?.customerAddress &&
    p.data?.customerPhone &&
    p.data?.reason &&
    p.token
  );
}