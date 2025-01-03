/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite';
  const plugin: () => Plugin;
  export default plugin;
}


/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_VAPID_KEY: string
  readonly VITE_FIREBASE_PUSH_PUBLIC_KEY: string
  // ... otras variables de entorno
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';

  interface VitePWAOptions {
    manifest?: {
      icons?: Array<{
        src: string;
        sizes: string;
        type: string;
      }>;
      [key: string]: unknown;
    };
    includeAssets?: string[];
    [key: string]: unknown;
  }

  export const VitePWA: (options?: VitePWAOptions) => Plugin;
}