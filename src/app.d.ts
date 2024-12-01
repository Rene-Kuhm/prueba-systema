import { FirebaseApp } from 'firebase/app';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

declare global {
  /**
   * Custom namespace to extend the application's types.
   */
  namespace App {
    /**
     * Locals interface: Defines properties available in `locals`.
     */
    interface Locals {
      firebase: FirebaseApp; // Instance of Firebase App
      auth: Auth; // Instance of Firebase Auth
      db: Firestore; // Instance of Firestore
      getUser(): Promise<User | null>; // Function to fetch the current user
    }

    /**
     * PageData interface: Defines the shape of data available on a page.
     */
    interface PageData {
      user: User | null; // The current user, if available
    }

    /**
     * Error interface: Defines the shape of custom errors.
     */
    interface Error {
      message: string; // Error message
      code?: string; // Optional error code for more context
    }

    /**
     * Platform interface: Reserved for platform-specific extensions.
     */
    interface Platform {}
  }
}

export {};