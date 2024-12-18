import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error('Missing Firebase configuration environment variables');
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const requestNotificationPermission = async () => {
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

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });

    if (token) {
      console.log('Token FCM:', token);
      // Aquí puedes enviar el token al servidor para almacenarlo y usarlo posteriormente
      // para enviar notificaciones push al usuario
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

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registrado exitosamente:', registration);
      })
      .catch((error) => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
}