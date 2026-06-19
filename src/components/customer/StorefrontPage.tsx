import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { CustomerAppShell } from "@/components/customer/CustomerAppShell";
import type { CustomerNavTab } from "@/components/customer/customer-shell";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";
import { cn } from "@/lib/utils";

type StorefrontPageProps = {
  children: ReactNode;
  activeTab?: CustomerNavTab;
  guestHero?: ReactNode;
  className?: string;
  mainClassName?: string;
  fullWidth?: boolean;
  showGuestFooter?: boolean;
};

export function StorefrontPage({
  children,
  activeTab,
  guestHero,
  className,
  mainClassName,
  fullWidth = false,
  showGuestFooter = true,
}: StorefrontPageProps) {
  const isCustomerApp = useIsCustomerApp();

  if (isCustomerApp) {
    return (
      <CustomerAppShell activeTab={activeTab} mainClassName={mainClassName} fullWidth={fullWidth}>
        {children}
      </CustomerAppShell>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Navbar overlay />
      {guestHero}
      <div
        className={cn(
          fullWidth ? "w-full" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
          !guestHero && "pt-[var(--navbar-offset)]",
          mainClassName,
        )}
      >
        {children}
      </div>
      {showGuestFooter && <Footer />}
    </div>
  );
}
