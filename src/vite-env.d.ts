/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_ULTRAMSG_TOKEN: string;
  readonly VITE_ULTRAMSG_INSTANCE: string;
  readonly VITE_FIREBASE_PUSH_PUBLIC_KEY: string
  readonly VITE_ENABLE_SW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
