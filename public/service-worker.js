/* eslint-env serviceworker */
/* global firebase */

// Definir variables globales
let firebaseConfig;
let messaging;

// Lista de recursos para cachear
const CACHE_NAME = 'v1';

// Acceder al objeto self que representa el ServiceWorker
const swGlobal = self;

// Cargar Firebase durante la instalación
swGlobal.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      swGlobal.skipWaiting(),
      // Solo cargar Firebase en producción y si estamos en un dominio real
      (async () => {
        if (swGlobal.location.hostname !== 'localhost' && typeof importScripts === 'function') {
          try {
            // Importar scripts de Firebase
            await Promise.all([
              import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'),
              import('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')
            ]);

            // Inicializar Firebase
            firebaseConfig = {
              apiKey: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_API_KEY,
              authDomain: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_AUTH_DOMAIN,
              projectId: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_PROJECT_ID,
              storageBucket: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
              appId: swGlobal.__WB_MANIFEST.env.VITE_FIREBASE_APP_ID
            };

            firebase.initializeApp(firebaseConfig);
            messaging = firebase.messaging();

            // Configurar el manejo de mensajes en segundo plano
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

              return swGlobal.registration.showNotification(notificationTitle, notificationOptions);
            });
          } catch (error) {
            console.error('Error initializing Firebase in SW:', error);
          }
        }
      })()
    ])
  );
});

swGlobal.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      swGlobal.clients.claim(),
      // Limpiar caches antiguas
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

// Estrategia de caché y red
swGlobal.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retornar de caché si existe
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, hacer la petición a la red
        return fetch(event.request)
          .then(response => {
            // Verificar si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta para guardarla en caché
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Si falla la red, retornar una respuesta offline
            return new Response('Offline', {
              status: 200,
              headers: new Headers({ 'Content-Type': 'text/plain' }),
            });
          });
      })
  );
});

// Manejar notificaciones push
swGlobal.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.notification?.body || 'No message content',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: data.data || {},
      tag: 'notification'
    };

    event.waitUntil(
      swGlobal.registration.showNotification(
        data.notification?.title || 'Nueva notificación',
        options
      )
    );
  } catch (error) {
    console.error('Error showing push notification:', error);
  }
});

// Manejar click en notificaciones
swGlobal.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    swGlobal.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        if (windowClients.length > 0) {
          const client = windowClients[0];
          client.focus();
        } else {
          swGlobal.clients.openWindow('/');
        }
      })
  );
});