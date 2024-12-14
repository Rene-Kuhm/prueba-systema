import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as cors from 'cors'

admin.initializeApp()

const corsHandler = cors({
  origin: [
    'https://www.tdpblog.com.ar',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

interface NotificationPayload {
  notification: {
    title: string
    body: string
  }
  data: {
    claimId: string
    customerName: string
    customerAddress: string
    customerPhone: string
    reason: string
  }
  token: string
}

export const sendClaimNotification = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    // Set explicit CORS headers
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const payload = req.body as NotificationPayload
      const { notification, data, token } = payload

      const message = {
        notification,
        data,
        token,
      }

      const result = await admin.messaging().send(message)
      res.json({ success: true, result })
    } catch (error: unknown) {
      console.error('Error sending notification:', error)
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  })
})
