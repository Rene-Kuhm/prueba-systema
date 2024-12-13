export interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    role: string;
    createdAt: any;
}

export interface Claim {
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
    phone: string;
    name: string;
    address: string;
    technicianId: string;
    reason: string;
    receivedBy: string;
    receivedAt: string;
    technicalDetails: string;
    resolution: string;
    notes: string;
    title: string;
    customer: string;
    date: string;
    notificationSent: boolean;
}

export interface Technician {
    id: string;
    name: string;
    phone: string;
    email: string;
    active: boolean;
    availableForAssignment: boolean;
    currentAssignments: number;
    completedAssignments: number;
    totalAssignments: number;
}

export interface ClaimFormTechnician {
    id: string;
    name: string;
    phone: string;
    email: string;
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

export type AdminClaim = {
    status: "pending" | "assigned" | "in_progress" | "completed";
    // other properties
};


export interface SearchResult {
    id: string;
    title: string;           // Título para mostrar en la búsqueda
    type: 'user' | 'claim' | 'technician';  // Tipo de resultado
    section: string;         // Sección a la que pertenece ('users', 'claims', etc.)
    data: PendingUser | Claim | { id: string; name: string }; // Datos completos del resultado
}