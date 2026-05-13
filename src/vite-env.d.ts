/// <reference types="vite/client" />

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
