import { getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { toast } from 'react-toastify';

// Verificar si las notificaciones están soportadas
const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Verificar el estado actual del permiso
const getNotificationPermissionStatus = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  const { createDebounce } = await import('../utils/debounceUtils');
  
  const debouncedRequest = await createDebounce(async () => {
    try {
      // Verificar soporte
      if (!isNotificationSupported()) {
        toast.error('Este navegador no soporta notificaciones');
        return null;
      }

      // Solicitar permiso
      const permission = await window.Notification.requestPermission();

      if (permission === 'granted') {
        if (!messaging) {
          toast.error('Firebase messaging no está inicializado');
          return null;
        }

        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY,
          });

          if (token) {
            console.log('Token FCM:', token);
            toast.success('¡Notificaciones activadas con éxito!');
            return token;
          }
          
          toast.error('No se pudo obtener el token de notificación');
          return null;
        } catch (fcmError) {
          console.error('Error de token FCM:', fcmError);
          toast.error('Error al configurar las notificaciones');
          return null;
        }
      } else {
        toast.warning('Permiso de notificación denegado');
        return null;
      }
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      toast.error('Error al activar las notificaciones');
      return null;
    }
  }, 500);

  return debouncedRequest();
};

export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging || !isNotificationSupported()) {
    return () => {};
  }

  return onMessage(messaging, callback);
};

export const checkNotificationStatus = () => {
  const status = getNotificationPermissionStatus();
  
  return {
    isSupported: status !== 'unsupported',
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    status
  };
};