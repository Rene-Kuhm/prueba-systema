// tipos de datos para el componente Admin



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
    status: 'pending' | 'assigned';
    resolution?: string;
    receivedBy?: string;
    receivedAt?: string;
    description?: string;
    technicianId?: string;
    scheduledDate?: string;
    // Añadimos los campos que faltan
    phone: string;
    name: string;
    address: string;
    reason: string;
}

export interface Technician {
    id: string;
    name: string;
}

export interface AdminState {
    pendingUsers: PendingUser[];
    claims: Claim[];
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedClaim: Claim | null;
    newClaim: Omit<Claim, 'id'>;
}

export interface ClaimFormProps {
    claim: Omit<Claim, 'id'>;
    technicians: string[];
    onSubmit: () => void;
    onChange: (claim: Omit<Claim, 'id'>) => void;
}

export interface ClaimsTableProps {
    claims: Claim[];
    onExport: () => void;
    onDelete: (claimid: string) => Promise<void>;
    onShowDetails: (claim: Claim) => void;
}

export interface AdminState {
    pendingUsers: PendingUser[];
    claims: Claim[];
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedClaim: Claim | null;
    newClaim: Omit<Claim, 'id'>;
}

export interface ClaimFormProps {
    claim: Omit<Claim, 'id'>;
    technicians: string[];
    onSubmit: () => void;
    onChange: (claim: Omit<Claim, 'id'>) => void;
}


// src/lib/types/user.ts
export interface UpdateProfileData {
    name?: string; // Define the properties you need
    email?: string;
    avatar?: string | File;
    // Agrega otras propiedades según sea necesario
}

