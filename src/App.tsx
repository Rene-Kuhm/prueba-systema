import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useSearchParams, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UnauthorizedRoute } from './components/UnauthorizedRoute';
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
import { useAuthStore } from './stores/authStore';
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AdminRoutes from './routes/AdminRoutes';
import TechnicianRoutes from './routes/TechnicianRoutes';

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

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

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
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        toast.error('This browser does not support notifications');
        return;
      }

      // Check if notification permissions are already granted
      if (Notification.permission === 'granted') {
        toast.info('Notifications are already enabled');
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log('Permission:', permission);

      if (permission === 'granted') {
        toast.success('Notifications enabled successfully!');
        
        if (!messaging) {
          toast.error('Firebase messaging is not initialized');
          return;
        }

        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY 
          });
          
          if (token) {
            console.log("FCM Token:", token);
            // Here you would typically send this token to your backend
          } else {
            toast.error('Could not get notification token');
          }
        } catch (fcmError) {
          console.error("FCM token error:", fcmError);
          toast.error('Error setting up notifications');
        }
      } else {
        toast.warning('Notification permission was denied');
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error('Failed to enable notifications');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
        {/* Public routes that require no auth */}
        <Route element={<UnauthorizedRoute />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute role="admin">
              <AdminRoutes />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/technician/*" 
          element={
            <ProtectedRoute role="technician">
              <TechnicianRoutes />
            </ProtectedRoute>
          } 
        />

        <Route path="/__/auth/action" element={<AuthAction />} />

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;