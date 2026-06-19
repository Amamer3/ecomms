import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  KeyRound,
  MapPin,
  Package,
  Scale,
  Share2,
  User,
  Wallet,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { RequireCustomer } from "@/components/RequireCustomer";
import {
  CustomerSectionHeader,
  CustomerSideNav,
} from "@/components/customer/CustomerPageChrome";
import { StorefrontPage } from "@/components/customer/StorefrontPage";
import { formatTier } from "@/components/customer/customer-ui";
import { getCustomerProfile } from "@/lib/api";
import { customerProfileDisplayName } from "@/lib/auth-storage";
import { useAuth } from "@/context/auth";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";
import { selectPathname } from "@/lib/router-pathname";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const ACCOUNT_NAV = [
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/transactions", label: "Payments", icon: Wallet },
  { to: "/account/disputes", label: "Disputes", icon: Scale },
  { to: "/account/referral", label: "Referral", icon: Share2 },
  { to: "/account/security", label: "Security", icon: KeyRound },
] as const;

const SIDE_NAV_FOOTER = (
  <>
    <MapPin className="mb-1 inline h-3.5 w-3.5" aria-hidden /> Track deliveries from Orders.
  </>
);

function AccountLayout() {
  return (
    <RequireCustomer>
      <AccountLayoutInner />
    </RequireCustomer>
  );
}

function AccountLayoutInner() {
  const isCustomerApp = useIsCustomerApp();
  const pathname = useRouterState({ select: selectPathname });
  const isAccountHome = pathname === "/account" || pathname === "/account/";
  const { session } = useAuth();
  const { data: profile } = useQuery({ queryKey: ["customer-profile"], queryFn: getCustomerProfile });

  const displayName = profile ? customerProfileDisplayName(profile) : (session?.name ?? "Customer");
  const loyaltyLine = profile?.loyalty ? `${formatTier(profile.loyalty.tier)} member` : undefined;
  const description = [profile?.phone ?? session?.phone, loyaltyLine].filter(Boolean).join(" · ");

  const guestHero = (
    <PageHero maxWidth="5xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Customer</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.phone ?? session?.phone}</p>
          {loyaltyLine && <p className="mt-1 text-xs font-medium text-primary">{loyaltyLine}</p>}
        </div>
        <Link to="/account" className="shrink-0 text-sm font-medium text-primary hover:underline">
          Account home
        </Link>
      </div>
    </PageHero>
  );

  return (
    <StorefrontPage
      activeTab="account"
      guestHero={isCustomerApp ? undefined : guestHero}
      mainClassName="py-4 sm:py-6"
    >
      <div className="mx-auto w-full max-w-5xl min-w-0">
        {isAccountHome && (
          <CustomerSectionHeader
            eyebrow="Account"
            title={displayName}
            description={description}
          />
        )}

        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:gap-8">
          <CustomerSideNav items={ACCOUNT_NAV} footer={SIDE_NAV_FOOTER} />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </StorefrontPage>
  );
}
