import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

interface NotificationButtonProps {
  onClick: () => Promise<string | null>;
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = memo(({ 
  onClick,
  className = "fixed z-50 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg bottom-4 right-4 hover:bg-blue-600"
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);

  // Verificar la compatibilidad de la API y el estado inicial del permiso
  useEffect(() => {
    if ('Notification' in window) {
      setIsNotificationSupported(true); // La API de notificaciones está disponible
      if (Notification.permission === 'granted') {
        setIsHidden(true); // Oculta el botón si ya está habilitado
      }
    } else {
      console.warn('La API de notificaciones no está soportada en este navegador.');
      setIsNotificationSupported(false); // La API no está disponible
    }
  }, []);

  const handleClick = async () => {
    if (!isNotificationSupported) {
      alert('Tu navegador no soporta notificaciones.');
      return;
    }

    try {
      const result = await onClick();
      if (result === 'granted') {
        setIsHidden(true); // Oculta el botón después de otorgar el permiso
      }
    } catch (error) {
      console.error('Error al manejar las notificaciones:', error);
    }
  };

  if (isHidden || !isNotificationSupported) {
    return null; // No renderiza el botón si está oculto o la API no es compatible
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
    >
      Activar Notificaciones
    </button>
  );
});

NotificationButton.displayName = 'NotificationButton';

NotificationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default NotificationButton;
