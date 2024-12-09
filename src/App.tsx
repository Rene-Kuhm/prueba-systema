import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import Admin from './pages/Admin';

const firebaseConfig = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const App: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' }).then((currentToken) => {
          if (currentToken) {
            console.log('Token:', currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      }
    });

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // Customize notification here
      if (payload.notification) {
        const notificationTitle = payload.notification.title || 'Nuevo Reclamo';
        const notificationOptions = {
          body: payload.notification.body || 'Se ha cargado un nuevo reclamo.',
          icon: '/images/logo_cospec.png'
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/technician"
          element={
            <ProtectedRoute role="technician">
              <Technician />
            </ProtectedRoute>
          }
        /> */}

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <div className="py-8 text-center">
              <h1 className="text-2xl font-bold text-red-500">404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;