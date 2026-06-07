import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
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
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { getCustomerProfile } from "@/lib/api";
import { customerProfileDisplayName } from "@/lib/auth-storage";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import { formatTier } from "@/components/customer/customer-ui";

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

function AccountLayout() {
  return (
    <RequireCustomer>
      <AccountLayoutInner />
    </RequireCustomer>
  );
}

function AccountLayoutInner() {
  const { session } = useAuth();
  const { data: profile } = useQuery({ queryKey: ["customer-profile"], queryFn: getCustomerProfile });

  const displayName = profile ? customerProfileDisplayName(profile) : (session?.name ?? "Customer");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Customer</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold">{displayName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{profile?.phone ?? session?.phone}</p>
              {profile?.loyalty && (
                <p className="mt-1 text-xs font-medium text-primary">
                  {formatTier(profile.loyalty.tier)} member
                </p>
              )}
            </div>
            <Link
              to="/account"
              className="text-sm font-medium text-primary hover:underline"
            >
              Account home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="shrink-0 lg:w-52">
          <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Account">
            {ACCOUNT_NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                activeProps={{
                  className: "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 hidden text-xs text-muted-foreground lg:block">
            <MapPin className="mb-1 inline h-3.5 w-3.5" /> Track deliveries from Orders.
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
