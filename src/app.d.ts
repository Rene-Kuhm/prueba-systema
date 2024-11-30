// Import required types from Supabase
import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  /**
   * Custom namespace to extend the application's types.
   */
  namespace App {
    /**
     * Locals interface: Defines properties available in `locals`.
     */
    interface Locals {
      supabase: SupabaseClient; // Instance of SupabaseClient
      getSession(): Promise<Session | null>; // Function to fetch the current session
    }

    /**
     * PageData interface: Defines the shape of data available on a page.
     */
    interface PageData {
      session: Session | null; // The current session, if available
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
