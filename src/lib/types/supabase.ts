// Common reusable types
export type Role = 'admin' | 'technician';
export type ServiceType =
  | 'telefono'
  | 'telefono_internet'
  | 'fibra_optica'
  | 'tv'
  | 'tv_fibra_optica';
export type ComplaintStatus = 'pendiente' | 'en_proceso' | 'resuelto';

export interface Profile {
  id: string;
  full_name: string; // Full name of the user
  role: Role; // User role (admin or technician)
  approved: boolean; // Approval status of the user
  created_at?: string; // When the profile was created
  updated_at?: string; // When the profile was last updated
  email?: { email: string }; // Nested email field (optional)
}

export interface Complaint {
  id: string;
  service_type: ServiceType; // Type of service for the complaint
  phone_number: string; // Customer's phone number
  internet_number?: string; // Customer's internet account number (optional)
  customer_name: string; // Customer's name
  address: string; // Customer's address
  reason: string; // Reason for the complaint
  received_by: string; // Name of the person who received the complaint
  technician_id?: string; // ID of the technician assigned (optional)
  status: ComplaintStatus; // Current status of the complaint
  technician_notes?: string; // Notes from the technician (optional)
  created_at: string; // When the complaint was created
  updated_at: string; // When the complaint was last updated
  resolved_at?: string; // When the complaint was resolved (optional)
}
