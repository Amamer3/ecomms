import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";

import { APP_NAME, APP_TAGLINE } from "./src/lib/brand";
import { PWA_BACKGROUND_COLOR, PWA_THEME_COLOR } from "./src/lib/pwa";

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
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_TAGLINE,
        theme_color: PWA_THEME_COLOR,
        background_color: PWA_BACKGROUND_COLOR,
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["shopping", "food"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [],
      },
      selfDestroying: false,
      devOptions: {
        enabled: false,
        type: "module",
        suppressWarnings: true,
      },
    }),
  ],
});
