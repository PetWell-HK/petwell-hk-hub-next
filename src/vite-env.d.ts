/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLACE_SEARCH_BACKEND?: 'opensearch' | 'dynamo';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: unknown[];
}
