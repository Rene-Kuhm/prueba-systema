import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { registerServiceWorker } from './services/serviceWorkerRegistration';
import { setupMessageListener, requestNotificationPermission } from './services/notificationService';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotificationButton from '@/components/common/NotificationButton';
import AppRoutes from './routes/AppRoutes';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

const AppContent: React.FC = () => {
  const { isLoading, currentUser } = useAuth();
  const authLogged = useRef(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!authLogged.current && (currentUser?.email || !isLoading)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Estado de autenticación:', {
          isLoading,
          currentUser: currentUser?.email || null
        });
      }
      authLogged.current = true;
    }
  }, [isLoading, currentUser]);

  useEffect(() => {
    const unsubscribe = setupMessageListener((payload) => {
      if (payload.notification?.title) {
        toast(payload.notification.title);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Add debug logging for notification permission with proper checks
    if (process.env.NODE_ENV === 'development') {
      const notificationSupported = 'Notification' in window;
      console.log('Notification API Supported:', notificationSupported);
      if (notificationSupported) {
        console.log('Notification Permission:', Notification.permission);
      }
      console.log('Current User:', currentUser);
    }
  }, [currentUser]);

  if (isLoading || currentUser === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification button with improved visibility */}
      <div className="fixed z-50 top-4 right-4">
        {currentUser && (
          <NotificationButton onClick={requestNotificationPermission} />
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      
      <AppRoutes />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;