import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [
    nitro({
      preset: process.env.NITRO_PRESET ?? "vercel",
      compatibilityDate: "2026-05-13",
    }),
  ],
});
