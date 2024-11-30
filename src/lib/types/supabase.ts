// Common reusable types
export type Role = 'admin' | 'technician';

export type ServiceType =
  | 'telefono'
  | 'telefono_internet'
  | 'fibra_optica'
  | 'tv'
  | 'tv_fibra_optica';

export type ComplaintStatus = 'pendiente' | 'en_proceso' | 'resuelto';

export interface EmailObject {
  email: string;
}

// Base profile interface
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  approved: boolean;
  created_at?: string;
  updated_at?: string;
  phone_number?: string;
  department?: string;
}

// Complaint interface
export interface Complaint {
  id: string;
  service_type: ServiceType;
  phone_number: string;
  internet_number?: string;
  customer_name: string;
  address: string;
  reason: string;
  received_by: string;
  technician_id?: string;
  status: ComplaintStatus;
  technician_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// User registration data interface
export interface UserRegistrationData {
  email: string;
  password: string;
  full_name: string;
  role?: Role;
  phone_number?: string;
  department?: string;
}

// Auth response interface
export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

// Database error interface
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}