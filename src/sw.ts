/// <reference lib="webworker" />

// Ensure this file is treated as a module to support global augmentations
export {};

const CACHE_NAME = 'Cospec-Reclamos-v1.0';


const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/App.css',
  '/src/main.tsx',
  '/src/App.tsx',
];

// Extend ServiceWorkerGlobalScopeEventMap to include `sync`
declare global {
  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}

// Define the SyncEvent interface
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

// Ensure `self` is typed as `ServiceWorkerGlobalScope`
const sw = self as unknown as ServiceWorkerGlobalScope;

// Install event
sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).then(() => sw.skipWaiting())
  );
});

// Activate event
sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => sw.clients.claim())
  );
});

// Fetch event
sw.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
  });

// Push event
sw.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Nueva Notificación';
  const options: NotificationOptions = {
    body: data.body || 'Tienes un nuevo reclamo.',
    icon: '/images/logo_cospec.png',
    badge: '/images/logo_cospec.png',
    data: data.url || '/',
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

// Notification click event
sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  event.waitUntil(
    sw.clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(event.notification.data as string);
      }
    })
  );
});

// Sync event
sw.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('Sincronizando datos en segundo plano');
}

// Message event
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});