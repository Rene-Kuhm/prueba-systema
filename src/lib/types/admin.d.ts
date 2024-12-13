export interface Technician {
    id: string;
    name: string;
    phone: string;
}

export interface PendingUser {
    id: string;
    email: string;
    displayName: string;
    role: string;
}

export interface Claim {
    id: string;
    title: string;
    customer: string;
    date: string;
    phone: string;
    name: string;
    address: string;
    reason: string;
    technicianId: string;
    status: 'pending' | 'in_progress' | 'completed';
    resolution: string;
    receivedBy: string;
    receivedAt: string;
}

export interface AdminState {
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: string[];  // Make sure this is included
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedClaim: Claim | null;
    newClaim: Omit<Claim, 'id'>;
}

export interface AdminService {
    fetchPendingUsers(): Promise<PendingUser[]>;
    fetchClaims(): Promise<Claim[]>;
    fetchTechnicians(): Promise<Technician[]>; // Añadir esta línea
    approveUser(userId: string): Promise<void>;
    addClaim(claim: Omit<Claim, 'id'>): Promise<void>;
    deleteClaim(claimId: string): Promise<void>;
    exportClaimsToExcel(claims: Claim[]): void;
}
