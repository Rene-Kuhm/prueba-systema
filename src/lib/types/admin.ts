export interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    role: string;
    createdAt: string;
}

export interface Claim {
    id: string;
    title: string;
    customer: string;
    date: string;
    status: "pending" | "assigned" ;
    resolution?: string;
    receivedBy: string;
    receivedAt: string;
    description?: string;
    technicianId: string;
    scheduledDate?: string;
    phone: string;
    name: string;
    address: string;
    reason: string;
}

export interface Technician {
    id: string;
    name: string;
    phone: string;
}

export interface AdminState {
    pendingUsers: PendingUser[];
    claims: Claim[];
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedClaim: Claim | null;
    newClaim: Omit<Claim, "id">;
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