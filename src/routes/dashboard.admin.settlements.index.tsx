import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, BookOpen, RotateCcw } from "lucide-react";
import { getAdminDashboard } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/settlements/")({
  component: SettlementsHubPage,
});

const LINKS = [
  {
    to: "/dashboard/admin/settlements/refunds",
    label: "Refunds",
    icon: RotateCcw,
    description: "List refunds and scan cancelled orders to create them.",
  },
  {
    to: "/dashboard/admin/settlements/ledger",
    label: "Ledger",
    icon: BookOpen,
    description: "Settlement ledger entries for completed paid orders.",
  },
  {
    to: "/dashboard/admin/settlements/payouts",
    label: "Payouts",
    icon: Banknote,
    description: "Vendor and courier payout runs from pending ledger entries.",
  },
] as const;

function SettlementsHubPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  return (
    <div>
      <AdminPageHeader
        title="Settlement operations"
        description="Manage refunds, ledger generation, and payout runs."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending refunds</p>
          <p className="text-2xl font-semibold">{stats?.pendingRefunds ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending payouts</p>
          <p className="text-2xl font-semibold">{stats?.pendingPayouts ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ to, label, icon: Icon, description }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
