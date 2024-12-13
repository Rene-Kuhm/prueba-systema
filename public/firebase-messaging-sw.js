importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDTG1v3T8sDQGRD3nhWOieLP8CVnKijfiM",
  authDomain: "cospecreclamos.firebaseapp.com",
  projectId: "cospecreclamos",
  storageBucket: "cospecreclamos.appspot.com",
  messagingSenderId: "1010981981198",
  appId: "1:838077251670:web:4f9f50feaaa158bdc77bf7"

};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  console.log('Recibido mensaje en background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  try {
    await self.registration.showNotification(notificationTitle, notificationOptions);
    console.log('Notificación mostrada con éxito');
  } catch (error) {
    console.error('Error al mostrar la notificación:', error);
  }
});