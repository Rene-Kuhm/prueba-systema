importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js")


 
const firebaseConfig = {
    apiKey: "AIzaSyDTG1v3T8sDQGRD3nhWOieLP8CVnKijfiM",
    authDomain: "cospecreclamos.firebaseapp.com",
    projectId: "cospecreclamos",
    storageBucket: "cospecreclamos.firebasestorage.app",
    messagingSenderId: "838077251670",
    appId: "1:838077251670:web:4f9f50feaaa158bdc77bf7"
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);


messaging.onBackgroundMessage(payload => {
    console.log("Recibiste mensaje mientras estabas ausente");
// previo a mostrar notificación
    const notificationTitle= payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/logo192.png"
    }


    return self.registration.showNotification(
        notificationTitle, 
        notificationOptions
    )
})