import React, { memo } from 'react';
import PropTypes from 'prop-types';

interface NotificationButtonProps {
  onClick: () => Promise<string | null>;
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = memo(({ 
  onClick,
  className = "fixed z-50 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg bottom-4 right-4 hover:bg-blue-600"
}) => (
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    Activar Notificaciones
  </button>
));

NotificationButton.displayName = 'NotificationButton';

NotificationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default NotificationButton;