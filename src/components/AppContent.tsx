import React, { useEffect, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { 
  setupMessageListener, 
  getNotificationStatus, 
  requestNotificationPermission 
} from '@/services/notificationService';
import NotificationButton from '@/components/common/NotificationButton';
import AppRoutes from '@/routes/AppRoutes';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { isSupported, permissionStatus } = getNotificationStatus();
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(permissionStatus as NotificationPermission);

  useEffect(() => {
    if (isSupported && notificationStatus === 'granted') {
      const unsubscribe = setupMessageListener((payload) => {
        if (payload.notification?.title) {
          toast(payload.notification.title);
        }
      });

      return () => unsubscribe();
    }
  }, [isSupported, notificationStatus]);

  const handleNotificationRequest = useCallback(async (): Promise<string | null> => {
    const status = await requestNotificationPermission();
    if (status) {
      setNotificationStatus(status as NotificationPermission);
    }
    return status;
  }, []);

  const showNotificationButton = 
  isSupported && 
  notificationStatus !== 'granted' &&
  notificationStatus !== 'denied' && 
  !!currentUser;

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