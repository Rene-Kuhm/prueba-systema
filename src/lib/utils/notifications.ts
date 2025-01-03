// src/utils/notifications.ts

export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        ;('Permiso de notificación concedido')
      } else {
        ;('Permiso de notificación denegado')
      }
    })
  }
}
