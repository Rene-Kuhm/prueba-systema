import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useSearchParams, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import TechnicianPage from './pages/Technician';
import { getAuth, signInAnonymously } from "firebase/auth";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { messaging } from "./firebase"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Action Component
const AuthAction: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  switch (mode) {
    case 'resetPassword':
      return <ResetPassword />;
    default:
      return <Navigate to="/" />;
  }
};

const App: React.FC = () => {
  useEffect(() => {
    // Set up Firebase messaging listener
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
        console.log("Received foreground message:", payload);
        if (payload.notification?.title) {
          toast(payload.notification.title);
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (!messaging) {
        console.log("Firebase messaging is not initialized");
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
      
      // Then request FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY 
      });
      
      if (token) {
        console.log("FCM Token:", token);
        // Here you would typically send this token to your backend
      } else {
        console.log("No registration token available");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return (
    <Router>
      <ToastContainer />
      <button 
        onClick={requestNotificationPermission}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        Enable Notifications
      </button>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/__/auth/action" element={<AuthAction />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician"
          element={
            <ProtectedRoute role="technician">
              <TechnicianPage />
            </ProtectedRoute>
          }
        />

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