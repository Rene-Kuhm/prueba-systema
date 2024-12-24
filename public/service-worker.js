const CACHE_NAME = 'v1';

// Immediately activate the service worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Simple fetch handler
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return new Response('Offline', {
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});

// Only load Firebase in production
if (self.location.hostname !== 'localhost' && typeof importScripts === 'function') {
  try {
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
    
    const firebaseConfig = {
      // Las configuraciones se injectarán en tiempo de ejecución
      // desde el archivo de configuración principal
    };

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'Nueva notificación';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        data: payload.data,
        tag: 'notification'
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('Error loading Firebase scripts:', error);
  }
}
