// src/lib/types/notifications.ts
export interface Notification {
    id: string;
    type: 'registration' | 'claim_resolved' | 'claim_updated';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    data?: any;
}