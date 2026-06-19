import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CustomerHomeHeader } from "@/components/customer/CustomerHomeHeader";
import { CustomerMobileBottomNav } from "@/components/customer/CustomerMobileBottomNav";
import { CustomerMobileScrollHeader } from "@/components/customer/CustomerMobileScrollHeader";
import { inferCustomerBottomTab, inferCustomerNavTab, type CustomerNavTab } from "@/components/customer/customer-shell";
import { useCustomerLocationLabel } from "@/hooks/use-customer-location";
import { selectPathname } from "@/lib/router-pathname";
import { cn } from "@/lib/utils";

type CustomerAppShellProps = {
  children: ReactNode;
  activeTab?: CustomerNavTab;
  mainClassName?: string;
  fullWidth?: boolean;
};

function readFallbackHeaderOffset(): number {
  if (typeof window === "undefined") return 56;
  const styles = getComputedStyle(document.documentElement);
  const fallback = styles.getPropertyValue("--customer-navbar-fallback").trim();

  if (fallback.endsWith("rem")) {
    const rem = parseFloat(fallback) * parseFloat(styles.fontSize || "16");
    if (Number.isFinite(rem) && rem > 0) return rem;
  }

  if (fallback.endsWith("px")) {
    const px = parseFloat(fallback);
    if (Number.isFinite(px) && px > 0) return px;
  }

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;height:var(--customer-navbar-fallback);pointer-events:none;";
  document.documentElement.appendChild(probe);
  const resolved = probe.offsetHeight;
  probe.remove();
  if (resolved > 0) return resolved;

  return window.matchMedia("(min-width: 768px)").matches ? 116 : 56;
}

function readBannerOffset(): number {
  if (typeof document === "undefined") return 0;
  const banner = document.querySelector<HTMLElement>("[data-api-config-banner]");
  return banner?.offsetHeight ?? 0;
}

export function CustomerAppShell({
  children,
  activeTab,
  mainClassName,
  fullWidth = false,
}: CustomerAppShellProps) {
  const pathname = useRouterState({ select: selectPathname });
  const search = useRouterState({ select: (state) => state.location.search });
  const locationLabel = useCustomerLocationLabel();
  const tab = activeTab ?? inferCustomerNavTab(pathname);
  const bottomTab = inferCustomerBottomTab(pathname, search as Record<string, unknown>);
  const mobileBarRef = useRef<HTMLElement>(null);
  const desktopHeaderRef = useRef<HTMLElement>(null);
  const [headerOffset, setHeaderOffset] = useState(readFallbackHeaderOffset);
  const [bannerOffset, setBannerOffset] = useState(readBannerOffset);

  useLayoutEffect(() => {
    const updateOffsets = () => {
      setBannerOffset(readBannerOffset());
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const node = isDesktop ? desktopHeaderRef.current : mobileBarRef.current;
      const measured = node?.offsetHeight ?? 0;
      const fallback = readFallbackHeaderOffset();
      setHeaderOffset(measured > 0 ? measured : fallback);
    };

    updateOffsets();

    const observer = new ResizeObserver(updateOffsets);
    if (mobileBarRef.current) observer.observe(mobileBarRef.current);
    if (desktopHeaderRef.current) observer.observe(desktopHeaderRef.current);

    const banner = document.querySelector<HTMLElement>("[data-api-config-banner]");
    if (banner) observer.observe(banner);

    window.addEventListener("resize", updateOffsets);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffsets);
    };
  }, [locationLabel, tab, pathname]);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <CustomerHomeHeader
        mobileBarRef={mobileBarRef}
        desktopHeaderRef={desktopHeaderRef}
        locationLabel={locationLabel}
        activeTab={tab}
        topOffset={bannerOffset}
      />
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: headerOffset }}
      />
      <main
        className={cn(
          fullWidth ? "w-full" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          "pb-[calc(var(--customer-bottom-nav-height)+max(0.5rem,env(safe-area-inset-bottom)))] pt-0 md:py-6 md:pb-6",
          mainClassName,
        )}
      >
        <CustomerMobileScrollHeader />
        {children}
      </main>
      <CustomerMobileBottomNav activeTab={bottomTab} />
    </div>
  );
}
