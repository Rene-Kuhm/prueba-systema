import { getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { toast } from 'react-toastify';

export const requestNotificationPermission = async () => {
  const { createDebounce } = await import('../utils/debounceUtils');
  
  const debouncedRequest = await createDebounce(async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Este navegador no soporta notificaciones');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        if (!messaging) {
          toast.error('Firebase messaging no está inicializado');
          return;
        }

        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY,
          });

          if (token) {
            console.log('Token FCM:', token);
            toast.success('¡Notificaciones activadas con éxito!');
            return token;
          } else {
            toast.error('No se pudo obtener el token de notificación');
          }
        } catch (fcmError) {
          console.error('Error de token FCM:', fcmError);
          toast.error('Error al configurar las notificaciones');
        }
      } else {
        toast.warning('Permiso de notificación denegado');
      }
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      toast.error('Error al activar las notificaciones');
    }
  }, 500);

  return debouncedRequest();
};

export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return () => {};

  return onMessage(messaging, callback);
};