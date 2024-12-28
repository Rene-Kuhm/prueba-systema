/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite';
  const plugin: () => Plugin;
  export default plugin;
}


interface ImportMetaEnv {
  readonly VITE_ENABLE_SW: string
  readonly VITE_FIREBASE_PUSH_PUBLIC_KEY: string
  // Add other env variables here
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