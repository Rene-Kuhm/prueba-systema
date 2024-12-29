import React, { memo } from 'react';
import PropTypes from 'prop-types';

interface NotificationButtonProps {
    onClick: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = memo(({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed z-50 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg bottom-4 right-4 hover:bg-blue-600"
        type="button"
    >
        Activar Notificaciones
    </button>
));

NotificationButton.displayName = 'NotificationButton';
NotificationButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default NotificationButton;