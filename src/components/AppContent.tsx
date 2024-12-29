import React, { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { 
  setupMessageListener, 
  getNotificationStatus, 
  requestNotificationPermission 
} from '@/services/notificationService';
import NotificationButton from '@/components/common/NotificationButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AppRoutes from '@/routes/AppRoutes';

const AppContent: React.FC = () => {
  const { isLoading, currentUser } = useAuth();

  useEffect(() => {
    const { isSupported, permissionStatus } = getNotificationStatus();
    
    if (isSupported && permissionStatus === 'granted') {
      const unsubscribe = setupMessageListener((payload) => {
        if (payload.notification?.title) {
          toast(payload.notification.title);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const handleNotificationRequest = useCallback(async () => {
    return await requestNotificationPermission();
  }, []);

  if (isLoading || currentUser === undefined) {
    return <LoadingSpinner />;
  }

  const { isSupported, permissionStatus } = getNotificationStatus();
  const showNotificationButton = 
    isSupported && 
    permissionStatus !== 'granted' && 
    permissionStatus !== 'denied' && 
    currentUser;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
      
      {showNotificationButton && (
        <NotificationButton 
          onClick={handleNotificationRequest}
        />
      )}
    </div>
  );
};

export default AppContent;