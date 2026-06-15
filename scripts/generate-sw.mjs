import { build } from "esbuild";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { injectManifest } from "workbox-build";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDirs = [
  resolve(root, ".output/public"),
  resolve(root, ".vercel/output/static"),
].filter((dir) => existsSync(dir));

if (publicDirs.length === 0) {
  console.error("Error: no build output directory found. Run `npm run build` first.");
  process.exit(1);
}

const srcSw = resolve(root, "src/sw.ts");
const apiHost = (() => {
  const raw = process.env.VITE_API_URL?.trim();
  if (!raw) return "";

  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(normalized).origin;
  } catch {
    return "";
  }
})();

console.log("Transpiling service worker...");
const result = await build({
  entryPoints: [srcSw],
  write: false,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  define: {
    __API_ORIGIN__: JSON.stringify(apiHost),
  },
});

const swSource = result.outputFiles[0].text;

for (const publicDir of publicDirs) {
  const tempSwPath = resolve(publicDir, "sw-src.js");
  writeFileSync(tempSwPath, swSource);

  console.log(`Generating service worker in ${publicDir}...`);

  try {
    const { count, size, warnings } = await injectManifest({
      swSrc: tempSwPath,
      swDest: resolve(publicDir, "sw.js"),
      globDirectory: publicDir,
      globPatterns: ["**/*.{js,css,ico,png,svg,webp,woff2,webmanifest}"],
      globIgnores: ["sw-src.js", "sw.js"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    });

    unlinkSync(tempSwPath);

    if (warnings.length > 0) {
      console.warn(warnings.join("\n"));
    }

    console.log(
      `Service worker ready with ${count} precached files (${(size / 1024).toFixed(1)} KB)`,
    );
  } catch (error) {
    console.error(`Error generating service worker in ${publicDir}:`, error);
    process.exit(1);
  }
}
