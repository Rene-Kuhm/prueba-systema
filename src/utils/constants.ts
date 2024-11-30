/**
 * Enum-like object representing the types of services.
 */
export const SERVICE_TYPES = {
  PHONE: 'telefono',
  PHONE_INTERNET: 'telefono_internet',
  FIBER: 'fibra_optica',
  TV: 'tv',
  TV_FIBER: 'tv_fibra_optica',
} as const;

/**
 * Enum-like object representing the statuses of complaints.
 */
export const COMPLAINT_STATUS = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_proceso',
  RESOLVED: 'resuelto',
} as const;

/**
 * Type representing a service type.
 * This is derived from the SERVICE_TYPES object.
 */
export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

/**
 * Type representing a complaint status.
 * This is derived from the COMPLAINT_STATUS object.
 */
export type ComplaintStatus = (typeof COMPLAINT_STATUS)[keyof typeof COMPLAINT_STATUS];
