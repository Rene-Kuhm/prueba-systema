/* global importScripts */
/* global firebase */
/* global clients */
/* eslint-disable no-undef */

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

    const notificationTitle = payload.notification.title || 'Cospec Comunicaciones';
    const notificationOptions = {
        body: payload.notification.body || 'Nuevo reclamo cargado',
        icon: "/images/logo_cospec.png",
        badge: "/images/logo_cospec.png",
        tag: payload.data?.claimId || 'notification',
        vibrate: [200, 100, 200], // Agrega vibración
        requireInteraction: true,
        sound: "/assets/notification.mp3",
        data: {
            ...payload.data,
            clickAction: "https://www.tdpblog.com.ar"
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', () => {
    self.skipWaiting();
});