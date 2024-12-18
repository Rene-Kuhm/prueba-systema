import React from 'react';
import { Bell, Check, User, FileText, X, Loader2 } from 'lucide-react';
import type { Notification } from '@/lib/types/notifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTimestamp = (date: Date) => {
        return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
            Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'day'
        );
    };

    const getNotificationIcon = (type: string) => {
        const iconProps = { className: "h-4 w-4" };
        switch (type) {
            case 'registration':
                return <User {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
            case 'claim_resolved':
                return <Check {...iconProps} className={cn(iconProps.className, "text-green-500")} />;
            default:
                return <FileText {...iconProps} className={cn(iconProps.className, "text-gray-500")} />;
        }
    };

    const NotificationItem = ({ notification }: { notification: Notification }) => (
        <button
            className={cn(
                "w-full px-4 py-3 text-left transition-colors",
                "hover:bg-muted/50 relative group",
                !notification.read && "bg-muted/20"
            )}
            onClick={() => {
                onNotificationClick(notification);
                onMarkAsRead(notification.id);
            }}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "rounded-full p-2",
                    !notification.read && "bg-background"
                )}>
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                    <p className={cn(
                        "text-sm font-medium leading-none",
                        !notification.read && "text-primary"
                    )}>
                        {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                    </p>
                </div>
                {!notification.read && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </button>
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                align="end" 
                className="w-80 p-0"
            >
                <Card className="border-0">
                    <CardHeader className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base">Notificaciones</CardTitle>
                                <CardDescription className="text-xs">
                                    {unreadCount} sin leer
                                </CardDescription>
                            </div>
                            {notifications.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={onClearAll}
                                    className="h-8 text-xs"
                                >
                                    Marcar todo como leído
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                    <Bell className="h-8 w-8 mb-2 stroke-1" />
                                    <p className="text-sm">No hay notificaciones</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <React.Fragment key={notification.id}>
                                        <NotificationItem notification={notification} />
                                        <Separator />
                                    </React.Fragment>
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
};

export default Notifications;