interface Reclamo {
  id: string;
  description: string;
  // ...otras propiedades...
}

export async function handleReclamo(reclamo: Reclamo) {
  // Lógica para cargar el reclamo
  // ...existing code...

  // Enviar notificación
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        console.log('Enviando notificaci��n al service worker');
        registration.active.postMessage({
          type: 'SEND_NOTIFICATION',
          title: 'Nuevo Reclamo',
          options: {
            body: `Se ha cargado un nuevo reclamo: ${reclamo.description}`,
            icon: '/images/logo_cospec.png',
            badge: '/images/logo_cospec.png',
          },
        });
      }
    });
  } else {
    console.log('Permiso de notificaciones no concedido');
  }
}
