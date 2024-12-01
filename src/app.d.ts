// Import required types from Appwrite
import type { Client, Account, Models } from 'appwrite';

declare global {
  /**
   * Custom namespace to extend the application's types.
   */
  namespace App {
    /**
     * Locals interface: Defines properties available in `locals`.
     */
    interface Locals {
      appwrite: Client; // Instance of Appwrite Client
      account: Account; // Instance of Appwrite Account
      getSession(): Promise<Models.Session | null>; // Function to fetch the current session
    }

    /**
     * PageData interface: Defines the shape of data available on a page.
     */
    interface PageData {
      session: Models.Session | null; // The current session, if available
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