// src/components/Admin/Notifications/Notifications.tsx
import React, { useState } from 'react';
import { Bell, Check, User, FileText } from 'lucide-react';
import type { Notification } from '@/lib/types/notifications';
import './Notifications.css';

interface NotificationsProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
    onNotificationClick: (notification: Notification) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
    notifications,
    onMarkAsRead,
    onClearAll,
    onNotificationClick
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTimestamp = (date: Date) => {
        return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
            Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'day'
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'registration':
                return <User className="w-5 h-5 text-blue-500" />;
            case 'claim_resolved':
                return <Check className="w-5 h-5 text-green-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="notifications-container">
            <button 
                className="notifications-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="notifications-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-panel">
                    <div className="notifications-header">
                        <h3 className="notifications-title">Notificaciones</h3>
                        {notifications.length > 0 && (
                            <button 
                                onClick={onClearAll}
                                className="notifications-clear-all"
                            >
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="notifications-empty">
                                No hay notificaciones
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => {
                                        onNotificationClick(notification);
                                        onMarkAsRead(notification.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-title">{notification.title}</p>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">
                                            {formatTimestamp(notification.timestamp)}
                                        </span>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            className="mark-as-read"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMarkAsRead(notification.id);
                                            }}
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};