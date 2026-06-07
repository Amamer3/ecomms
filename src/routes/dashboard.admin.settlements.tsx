import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Banknote, BookOpen, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/settlements")({
  component: SettlementsLayout,
});

const SETTLEMENTS_NAV = [
  { to: "/dashboard/admin/settlements/refunds", label: "Refunds", icon: RotateCcw },
  { to: "/dashboard/admin/settlements/ledger", label: "Ledger", icon: BookOpen },
  { to: "/dashboard/admin/settlements/payouts", label: "Payouts", icon: Banknote },
] as const;

function SettlementsLayout() {
  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Settlements</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Refunds, settlement ledger entries, and vendor or courier payout runs.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Settlement sections">
        {SETTLEMENTS_NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              "border-border bg-card hover:border-primary/40",
            )}
            activeProps={{
              className: "border-primary bg-primary text-primary-foreground",
            }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
