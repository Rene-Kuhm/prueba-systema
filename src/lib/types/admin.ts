export interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    role: string;
    createdAt: string;  // Changed from 'any' to 'string'
}

export interface Claim {
    id: string;
    name: string;
    phone: string;
    address: string;
    reason: string;
    technicianId: string;
    receivedBy: string;
    receivedAt: string;
    status: 'pending' | 'in_progress' | 'completed';  // Definir estados específicos
    resolution?: string;
    completedBy?: string;
    completedAt?: string;
    date: string;
    notificationSent: boolean;
    title: string;
    customer: string;
    technicalDetails?: string;
    notes?: string;
    // otros campos
    isArchived?: boolean;
    archivedAt?: string;
    createdAt: string;  // Add this line
    technicianName?: string;
    lastUpdate?: string;
    description: string;
    claimType: string;
    claimAmount: number;
    updatedAt: string;
}

export interface Technician {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    phone: string;
    email: string;
    active: boolean;
    availableForAssignment: boolean;
    currentAssignments: number;
    completedAssignments: number;
    totalAssignments: number;
    avatarUrl?: string;
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
  claim?: NewClaim;
  technicians?: Technician[];  // Add technicians property
  onSubmit: (claim: NewClaim) => Promise<{ success: boolean; id: string; message?: string }>;
  onChange: (claim: NewClaim) => void;
}

export interface ClaimsTableProps {
  claims: ExtendedClaim[];
  showArchived: boolean;
  showDeleteDialog: boolean;
  isDeleting: boolean;
  onShowDetails: (claim: ExtendedClaim) => void;
  onEdit?: (claim: ExtendedClaim) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onToggleArchived: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
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

export interface NewClaim {
    id?: string; // Make id optional
    name: string;
    phone: string;
    address: string;
    reason: string;
    technicianId: string;
    receivedBy: string;
    receivedAt: string;
    status: 'pending' | 'in_progress' | 'completed';
    title: string;
    description: string;
    claimType: string;
    claimAmount: number;
    date: string;
    notificationSent: boolean;
    customer: string;
    resolution?: string;
    completedBy?: string;
    completedAt?: string;
    technicalDetails?: string;
    notes?: string;
    updatedAt: string;
    createdAt: string;  // Make this required
    lastUpdate?: string;
}

export interface ExtendedClaim extends Claim {
  id: string  // explicitly non-optional
  description: string
  claimType: string
  claimAmount: number
  updatedAt: string
  technicianName?: string
  isArchived?: boolean
  archivedAt?: string
  createdAt: string
  lastUpdate?: string
}