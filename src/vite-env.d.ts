/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css";

declare module "sonner" {
  import type { ComponentType } from "react";

  export const Toaster: ComponentType<Record<string, unknown>>;

  export const toast: {
    (message: string, data?: Record<string, unknown>): string | number;
    success(message: string, data?: Record<string, unknown>): string | number;
    error(message: string, data?: Record<string, unknown>): string | number;
  };
}
