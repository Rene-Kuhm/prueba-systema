import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';

// Validate required environment variables
const validateEnvVars = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ] as const;

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}`
    );
  }
};

// Validate environment variables before initializing
validateEnvVars();

// Firebase configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only once
const initializeFirebase = () => {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    
    // Set Firebase config for service worker
    if (typeof window !== 'undefined') {
      // Type assertion to avoid readonly properties error
      (window as any).FIREBASE_CONFIG = {
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId
      };
    }
    
    return app;
  }
  return getApps()[0];
};

const app = initializeFirebase();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize messaging only in browser environment with service worker support
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
    
    // Register service worker
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  } catch (error) {
    console.error('Firebase Messaging initialization failed:', error);
  }
}

// Función para solicitar permisos de notificación
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.error('Este navegador no soporta notificaciones push');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Permiso de notificación denegado');
      return null;
    }

    if (!messaging) {
      console.error('Firebase Messaging no está inicializado');
      return null;
    }

    const token = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
    });

    if (token) {
      console.log('Token FCM:', token);
      return token;
    } else {
      console.error('No se pudo obtener el token FCM');
      return null;
    }
  } catch (error) {
    console.error('Error al solicitar el token:', error);
    return null;
  }
};

// Exportación de tipos de Firebase (opcional, si los necesitas)
export type {
  Messaging
};

// Exportación de funciones de Firestore para uso directo
export {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot
};

// Export initialized services
export { app, auth, db, storage, messaging, firebaseConfig };