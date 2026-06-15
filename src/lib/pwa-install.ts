const SNOOZE_KEY = "gomarket-pwa-install-snooze-until";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 3000;

export type PwaInstallPlatform = "android" | "ios";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const classicIos = /iphone|ipod|ipad/i.test(ua);
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return classicIos || ipadOs;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isInstallSnoozed(): boolean {
  if (typeof localStorage === "undefined") return false;

  const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
  return Number.isFinite(until) && Date.now() < until;
}

export function snoozeInstallPrompt(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
}

export function clearInstallSnooze(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SNOOZE_KEY);
}

export { SHOW_DELAY_MS };
