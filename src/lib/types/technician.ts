import type { User } from './firebase'

export interface Claim {
    id?: string;
    phone: string;
    name: string;
    address: string;
    reason: string;
    technician?: string;
    status: 'pending' | 'assigned';
}

export interface TechnicianContextType {
    user: User | null;
    claims: Claim[];
}