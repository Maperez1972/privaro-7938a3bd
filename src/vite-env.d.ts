/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
