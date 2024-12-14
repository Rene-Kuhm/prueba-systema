import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: true,
      },
      serviceWorker: {
        path: '/onesignal/OneSignalSDKWorker.js'
      }
    });
    console.log('OneSignal inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando OneSignal:', error);
  }
};

export const subscribeUser = async (email: string, userId: string) => {
  try {
    await OneSignal.login(userId);
    await OneSignal.User.addEmail(email);
    
    const pushSubscription = await OneSignal.User.PushSubscription.optIn();
    console.log('Usuario suscrito a OneSignal:', pushSubscription);
    
    return true;
  } catch (error) {
    console.error('Error en suscripción OneSignal:', error);
    return false;
  }
};

export const addUserData = async (data: Record<string, string>) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      OneSignal.User.addAlias(key, value);
    });
    return true;
  } catch (error) {
    console.error('Error añadiendo datos de usuario a OneSignal:', error);
    return false;
  }
};