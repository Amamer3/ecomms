import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Banknote, BookOpen, LayoutGrid, RefreshCw, RotateCcw, Scale } from "lucide-react";
import { getAdminDashboard } from "@/lib/api";
import { AdminPageHeader, AdminStat, AdminTabNav } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/settlements")({
  component: SettlementsLayout,
});

const SETTLEMENTS_NAV = [
  { to: "/dashboard/admin/settlements", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/admin/settlements/refunds", label: "Refunds", icon: RotateCcw },
  { to: "/dashboard/admin/settlements/ledger", label: "Ledger", icon: BookOpen },
  { to: "/dashboard/admin/settlements/payouts", label: "Payouts", icon: Banknote },
] as const;

function SettlementsLayout() {
  const { data: stats, isFetching, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const pendingRefunds = stats?.pendingRefunds ?? 0;
  const pendingPayouts = stats?.pendingPayouts ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Settlements"
        description="End-to-end finance operations — scan refunds, generate ledger entries, and run vendor or courier payouts."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh metrics
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStat
          label="Pending refunds"
          value={String(pendingRefunds)}
          sub="Orders awaiting refund scan"
          icon={RotateCcw}
          accent={pendingRefunds > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Pending payouts"
          value={String(pendingPayouts)}
          sub="Ledger entries ready to pay out"
          icon={Banknote}
          accent={pendingPayouts > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Open disputes"
          value={String(stats?.openDisputes ?? 0)}
          sub="May affect settlement timing"
          icon={Scale}
          accent={(stats?.openDisputes ?? 0) > 0 ? "warning" : "default"}
        />
      </div>

      <AdminTabNav items={SETTLEMENTS_NAV} />
      <Outlet />
    </div>
  );
}
