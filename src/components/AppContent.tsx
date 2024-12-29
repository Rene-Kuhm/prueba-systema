import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { setupMessageListener, checkNotificationStatus, requestNotificationPermission } from '@/services/notificationService';
import NotificationButton from '@/components/common/NotificationButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AppRoutes from '@/routes/AppRoutes';

const AppContent: React.FC = () => {
  const { isLoading, currentUser } = useAuth();

  useEffect(() => {
    const { isSupported, isGranted } = checkNotificationStatus();
    
    if (isSupported && isGranted) {
      const unsubscribe = setupMessageListener((payload) => {
        if (payload.notification?.title) {
          toast(payload.notification.title);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  if (isLoading || currentUser === undefined) {
    return <LoadingSpinner />;
  }

  const { isSupported, isGranted, isDenied } = checkNotificationStatus();
  const showNotificationButton = isSupported && !isGranted && !isDenied && currentUser;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
      
      {showNotificationButton && (
        <NotificationButton onClick={requestNotificationPermission} />
      )}
    </div>
  );
};

export default AppContent;