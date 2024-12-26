// src/lib/types/notifications.ts
export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    data?: {
        registration?: {
            userId: string;
            email: string;
        };
        claim_resolved?: {
            claimId: string;
            resolution: string;
        };
        claim_updated?: {
            claimId: string;
            status: string;
            changes: Record<string, unknown>;
        };
    }[keyof {
        registration: unknown;
        claim_resolved: unknown;
        claim_updated: unknown;
    }];
}