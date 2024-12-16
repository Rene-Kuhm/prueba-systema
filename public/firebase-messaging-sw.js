// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDTG1v3T8sDQGRD3nhWOieLP8CVnKijfiM",
    authDomain: "cospecreclamos.firebaseapp.com",
    projectId: "cospecreclamos",
    storageBucket: "cospecreclamos.firebasestorage.app",
    messagingSenderId: "838077251670",
    appId: "1:838077251670:web:4f9f50feaaa158bdc77bf7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('notificationclick', function(event) {
    const clickedNotification = event.notification;
    clickedNotification.close();
    
    const claimId = event.notification.tag;
    if (claimId) {
        clients.openWindow(`/reclamos/${claimId}`);
    }
});

messaging.onBackgroundMessage(payload => {
    console.log("Recibiste mensaje mientras estabas ausente:", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: payload.data?.claimId || 'notification',
        vibrate: [200, 100, 200], // Agrega vibración
        requireInteraction: true,  // La notificación permanece hasta que el usuario interactúe
        actions: [
            {
                action: 'view',
                title: 'Ver reclamo'
            }
        ]
    };

    return self.registration.showNotification(
        notificationTitle, 
        notificationOptions
    );
});