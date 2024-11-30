const VALID_ROLES = ['admin', 'technician'] as const;
const VALID_SERVICE_TYPES = [
  'telefono',
  'telefono_internet',
  'fibra_optica',
  'tv',
  'tv_fibra_optica',
] as const;

/**
 * Validates whether an email string is in a proper format.
 * @param email - The email to validate.
 * @returns True if the email is valid, otherwise false.
 */
export function validateEmail(email: string): boolean {
  // Regex explanation: Checks for valid email structure (e.g., local@domain.com).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates whether a password meets the minimum length requirement.
 * @param password - The password to validate.
 * @returns True if the password is at least 6 characters long, otherwise false.
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates whether a role is one of the valid roles.
 * @param role - The role to validate.
 * @returns True if the role is valid, otherwise false.
 */
export function validateRole(role: string): role is (typeof VALID_ROLES)[number] {
  return VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);
}

/**
 * Validates whether a service type is one of the valid service types.
 * @param type - The service type to validate.
 * @returns True if the service type is valid, otherwise false.
 */
export function validateServiceType(type: string): type is (typeof VALID_SERVICE_TYPES)[number] {
  return VALID_SERVICE_TYPES.includes(type as (typeof VALID_SERVICE_TYPES)[number]);
}

/**
 * Validates whether a phone number is exactly 10 digits.
 * @param phone - The phone number to validate.
 * @returns True if the phone number is valid, otherwise false.
 */
export function validatePhoneNumber(phone: string): boolean {
  // Regex explanation: Checks if the string contains exactly 10 numeric digits.
  return /^\d{10}$/.test(phone);
}
