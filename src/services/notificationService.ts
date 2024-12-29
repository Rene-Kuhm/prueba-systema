import { getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { toast } from 'react-toastify';

// Tipos personalizados para manejar el estado de las notificaciones
type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

interface NotificationState {
  isSupported: boolean;
  permissionStatus: NotificationStatus;
}

// Función para verificar el soporte de notificaciones
const checkNotificationSupport = (): NotificationState => {
  const isSupported = !!(
    window &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );

  if (!isSupported) {
    return {
      isSupported: false,
      permissionStatus: 'unsupported'
    };
  }

  return {
    isSupported: true,
    permissionStatus: (Notification?.permission as NotificationStatus) || 'default'
  };
};

export const requestNotificationPermission = async () => {
  try {
    const { isSupported } = checkNotificationSupport();

    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones');
      return null;
    }

    // Asegurarse de que Notification está disponible
    if (typeof Notification === 'undefined') {
      toast.error('API de notificaciones no disponible');
      return null;
    }

    let permission: NotificationPermission;

    try {
      permission = await Notification.requestPermission();
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      toast.error('Error al solicitar permiso de notificaciones');
      return null;
    }

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
          toast.success('¡Notificaciones activadas con éxito!');
          return token;
        } else {
          toast.error('No se pudo obtener el token de notificación');
          return null;
        }
      } catch (error) {
        console.error('Error al obtener token FCM:', error);
        toast.error('Error al configurar las notificaciones');
        return null;
      }
    } else {
      toast.warning(
        permission === 'denied'
          ? 'Permiso de notificaciones denegado'
          : 'No se otorgó permiso para notificaciones'
      );
      return null;
    }
  } catch (error) {
    console.error('Error en el proceso de notificaciones:', error);
    toast.error('Error al configurar las notificaciones');
    return null;
  }
};

export const getNotificationStatus = (): NotificationState => {
  return checkNotificationSupport();
};

export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  const { isSupported } = checkNotificationSupport();
  
  if (!isSupported || !messaging) {
    return () => {};
  }

  return onMessage(messaging, callback);
};