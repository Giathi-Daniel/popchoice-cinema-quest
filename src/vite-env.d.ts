/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GROQ_API_KEY?: string;
  readonly GROQ_MODEL?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
