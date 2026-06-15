import { useCallback, useEffect, useState } from "react";
import { Download, PlusSquare, Share2, Smartphone } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { useClientReady } from "@/lib/use-client-ready";
import {
  type BeforeInstallPromptEvent,
  type PwaInstallPlatform,
  isAndroidDevice,
  isInstallSnoozed,
  isIosDevice,
  isPwaInstalled,
  SHOW_DELAY_MS,
  snoozeInstallPrompt,
} from "@/lib/pwa-install";

export function PwaInstallPrompt() {
  const ready = useClientReady();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<PwaInstallPlatform | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!ready || isPwaInstalled() || isInstallSnoozed()) {
      return;
    }

    let showTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleShow = (nextPlatform: PwaInstallPlatform) => {
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        setPlatform(nextPlatform);
        setOpen(true);
      }, SHOW_DELAY_MS);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      scheduleShow("android");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIosDevice()) {
      scheduleShow("ios");
    } else if (isAndroidDevice()) {
      // Chromium on Android may fire beforeinstallprompt later; wait for that event.
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, [ready]);

  const dismiss = useCallback(() => {
    snoozeInstallPrompt();
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      snoozeInstallPrompt();
    }
    setOpen(nextOpen);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setOpen(false);
        setDeferredPrompt(null);
        return;
      }
      snoozeInstallPrompt();
    } catch {
      snoozeInstallPrompt();
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  if (!platform) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/50 px-6 pb-5 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
            <img src="/apple-touch-icon.png" alt="" className="h-12 w-12 rounded-xl" />
          </div>
          <DialogHeader className="mt-5 space-y-2 text-center">
            <DialogTitle className="font-display text-xl">Install {APP_NAME}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {platform === "android"
                ? `Add ${APP_NAME} to your home screen for faster checkout, order tracking, and offline browsing.`
                : `Install ${APP_NAME} on your home screen for quick access to ${APP_TAGLINE.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          {platform === "android" ? (
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tap install below. {APP_NAME} will open like a native app from your home screen.
              </p>
            </div>
          ) : (
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  1
                </span>
                <span className="pt-0.5">
                  Tap the <Share2 className="mx-0.5 inline h-4 w-4 align-text-bottom" />{" "}
                  <strong>Share</strong> button in Safari&apos;s toolbar.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  2
                </span>
                <span className="pt-0.5">
                  Scroll down and choose{" "}
                  <PlusSquare className="mx-0.5 inline h-4 w-4 align-text-bottom" />{" "}
                  <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  3
                </span>
                <span className="pt-0.5">
                  Tap <strong>Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>
          )}

          <div className="flex justify-center">
            <BrandLogo size="lg" className="opacity-80" />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/70 bg-muted/20 px-6 py-4 sm:justify-stretch">
          <Button variant="outline" className="w-full sm:w-auto" onClick={dismiss}>
            Not now
          </Button>
          {platform === "android" ? (
            <Button className="w-full sm:w-auto" onClick={handleInstall} disabled={installing}>
              <Download className="h-4 w-4" />
              {installing ? "Installing..." : "Install app"}
            </Button>
          ) : (
            <Button className="w-full sm:w-auto" onClick={dismiss}>
              Got it
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
