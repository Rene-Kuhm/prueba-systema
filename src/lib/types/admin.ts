export interface PendingUser {
    id: string;
    // Add other user properties
    email: string;
    fullName: string;
    displayName: string;
    role: string;
    createdAt: any;
}

export interface Claim {
    id: string;
    phone: string;
    name: string;
    address: string;
    reason: string;
    status: 'pending' | 'in_progress' | 'completed';
    technicianId: string;
    receivedBy: string;
    receivedAt?: string;
    title?: string;        // Agregado
    customer?: string;     // Agregado
    date?: string;        // Agregado
    resolution?: string;   // Agregado
    createdAt?: Date;
    notificationSent?: boolean;
}

export interface Technician {
    id: string;
    // Add other technician properties
    [key: string]: any;
}    

export interface AdminState {
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: Technician[];
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedClaim: Claim | null;
    newClaim: Omit<Claim, 'id'>;
}

export interface AdminService {
    fetchPendingUsers: () => Promise<PendingUser[]>;
    fetchClaims: () => Promise<Claim[]>;
    fetchTechnicians: () => Promise<Technician[]>;
    approveUser: (userId: string) => Promise<void>;
    addClaim: (claim: Omit<Claim, 'id'>) => Promise<void>;
    deleteClaim: (claimId: string) => Promise<void>;
    exportClaimsToExcel: (claims: Claim[]) => void;
}
export interface ClaimFormProps {
    claim: Partial<Claim>;
    technicians: Technician[];
    onSubmit: () => Promise<void>;
    onChange: (claim: Partial<Claim>) => void;
}

export interface ClaimsTableProps {
    claims: Claim[];
    onExport: () => void;
    onDelete: (claimId: string) => Promise<void>;
    onShowDetails: (claim: Claim) => void;
}
// src/lib/types/profile.ts
export interface UpdateProfileData {
    fullName?: string; // Optional properties
    email?: string;
    avatar?: File | string;
    // Add any other relevant fields
}