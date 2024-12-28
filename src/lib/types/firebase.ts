// Tipos de datos para Firebase

import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// Extendemos el tipo User de Firebase para incluir campos personalizados
export interface User extends FirebaseUser {
    role: 'admin' | 'technician';
    approved: boolean;
    name: string;
    avatar?: string;
}

export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    role: 'admin' | 'technician';
    approved: boolean;
    createdAt: string;
    avatar?: string;
}

// Definición de un documento de usuario en Firestore
export interface UserDocument {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'technician';
    approved: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    avatar?: string;
}

// Tipo para la sesión de autenticación
export interface AuthSession {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    avatar?: string;
}

// Tipo para las preferencias del usuario (si las necesitas)
export interface UserPreferences {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    // ... otras preferencias
}

/**
 * Updates user preferences - Currently a placeholder for future implementation
 * @param userId - The user ID to update preferences for
 * @param prefs - The preferences to update
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function updateUserPreferences(
    _userId: string,
    _prefs: Partial<UserPreferences>
): Promise<void> {
    console.log('Actualización de preferencias no implementada');
}
/* eslint-enable @typescript-eslint/no-unused-vars */