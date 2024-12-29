/* eslint-env serviceworker */
/* global firebase */

// Variables globales
let firebaseConfig;
let messaging;

// Nombre del caché
const CACHE_NAME = 'v1';

// Acceso al objeto global del ServiceWorker
const swGlobal = self;

// Escuchar mensajes desde la aplicación principal para inicializar Firebase
swGlobal.addEventListener('message', (event) => {
  if (event.data.type === 'INIT_FIREBASE') {
    firebaseConfig = event.data.firebaseConfig;

    try {
      firebase.initializeApp(firebaseConfig);
      messaging = firebase.messaging();

      // Configurar mensajes en segundo plano
      messaging.onBackgroundMessage((payload) => {
        console.log('Mensaje recibido en segundo plano:', payload);

        const { notification, data } = payload;
        const notificationTitle = notification?.title || 'Nueva notificación';
        const notificationOptions = {
          body: notification?.body || 'Contenido no disponible',
          icon: notification?.icon || '/logo192.png',
          data: data || {},
        };

        swGlobal.registration.showNotification(notificationTitle, notificationOptions);
      });
    } catch (error) {
      console.error('Error inicializando Firebase en el SW:', error);
    }
  }
});

// Instalación del ServiceWorker
swGlobal.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      swGlobal.skipWaiting(),
      // Pre-caching de recursos opcional
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/logo192.png',
          '/logo512.png',
        ]);
      }),
    ])
  );
});

// Activación del ServiceWorker
swGlobal.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      swGlobal.clients.claim(),
      // Limpiar cachés antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
    ])
  );
});

// Manejo de solicitudes de red
swGlobal.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retornar de caché si existe
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, hacer la petición a la red
      return fetch(event.request)
        .then((response) => {
          // Verificar respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar y almacenar en caché
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Respuesta offline
          return new Response('Offline', {
            status: 200,
            headers: new Headers({ 'Content-Type': 'text/plain' }),
          });
        });
    })
  );
});

// Manejo de notificaciones push
swGlobal.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notificationTitle = data.notification?.title || 'Nueva notificación';
    const notificationOptions = {
      body: data.notification?.body || 'Sin contenido disponible',
      icon: data.notification?.icon || '/logo192.png',
      data: data.data || {},
    };

    event.waitUntil(
      swGlobal.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('Error procesando la notificación push:', error);
  }
});

// Manejo de clics en notificaciones
swGlobal.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    swGlobal.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        // Enfocar la primera ventana activa
        return windowClients[0].focus();
      } else {
        // Abrir una nueva ventana si no hay clientes activos
        return swGlobal.clients.openWindow('/');
      }
    })
  );
});
