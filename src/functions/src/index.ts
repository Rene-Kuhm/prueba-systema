import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

// Initialize Firebase Admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

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

export const sendClaimNotification = functions.https.onRequest((req, res) => {
  // Explicitly set CORS headers
  res.set('Access-Control-Allow-Origin', 'https://www.tdpblog.com.ar');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed' 
    });
    return;
  }

  try {
    const payload = req.body as NotificationPayload;
    
    if (!payload || !payload.token || !payload.notification) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid payload: Missing required fields' 
      });
      return;
    }

    const { notification, data, token } = payload;

    const message = {
      notification,
      data,
      token,
    };

    // Send Firebase Cloud Messaging notification
    admin.messaging()
      .send(message)
      .then((result) => {
        res.status(200).json({ 
          success: true, 
          result 
        });
      })
      .catch((error) => {
        console.error('Messaging Error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message,
          details: error
        });
      });

  } catch (error) {
    console.error('Notification Error:', error);
    
    // Detailed error response
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected server error',
      details: error instanceof Error ? error.stack : null
    });
  }
});