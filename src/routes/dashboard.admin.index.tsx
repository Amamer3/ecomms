import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CreditCard,
  Package,
  Scale,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { getAdminDashboard } from "@/lib/api";
import { AdminPageHeader, AdminQuickLink, AdminStat } from "@/components/admin/admin-ui";
import { AsyncState } from "@/components/AsyncState";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminOverviewPage,
  head: () => ({ meta: [{ title: "Admin overview — GoMarket" }] }),
});

function AdminOverviewPage() {
  const { data: stats, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const openDisputes = stats?.openDisputes ?? 0;
  const pendingRefunds = stats?.pendingRefunds ?? 0;
  const pendingPayouts = stats?.pendingPayouts ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Operational overview"
        description="Live counts for orders, deliveries, refunds, payouts, disputes, and the notification outbox."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading metrics…"
        errorTitle="Couldn't load dashboard metrics"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStat
            label="Orders"
            value={String(stats?.orders ?? "—")}
            sub={`${stats?.pendingOrders ?? 0} pending`}
            icon={ShoppingBag}
          />
          <AdminStat
            label="Active deliveries"
            value={String(stats?.activeDeliveries ?? "—")}
            sub="In progress"
            icon={Truck}
          />
          <AdminStat
            label="Open disputes"
            value={String(openDisputes)}
            sub="Needs review"
            icon={Scale}
            accent={openDisputes > 0 ? "warning" : "default"}
          />
          <AdminStat
            label="Notification outbox"
            value={String(stats?.pendingOutbox ?? "—")}
            sub="Pending delivery"
            icon={Package}
          />
          <AdminStat
            label="Pending refunds"
            value={String(pendingRefunds)}
            sub="Awaiting processing"
            icon={CreditCard}
            accent={pendingRefunds > 0 ? "warning" : "default"}
          />
          <AdminStat
            label="Pending payouts"
            value={String(pendingPayouts)}
            sub="Settlement queue"
            icon={Wallet}
            accent={pendingPayouts > 0 ? "warning" : "default"}
          />
        </div>

        {(openDisputes > 0 || pendingRefunds > 0 || pendingPayouts > 0) && (
          <div className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">Items need attention</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {openDisputes > 0 && (
                    <li>
                      <Link to="/dashboard/admin/disputes" className="font-medium text-primary hover:underline">
                        {openDisputes} open dispute{openDisputes === 1 ? "" : "s"}
                      </Link>
                    </li>
                  )}
                  {pendingRefunds > 0 && (
                    <li>
                      <Link
                        to="/dashboard/admin/settlements/refunds"
                        className="font-medium text-primary hover:underline"
                      >
                        {pendingRefunds} pending refund{pendingRefunds === 1 ? "" : "s"}
                      </Link>
                    </li>
                  )}
                  {pendingPayouts > 0 && (
                    <li>
                      <Link
                        to="/dashboard/admin/settlements/payouts"
                        className="font-medium text-primary hover:underline"
                      >
                        {pendingPayouts} pending payout{pendingPayouts === 1 ? "" : "s"}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick access
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminQuickLink
              to="/dashboard/admin/orders"
              label="Orders"
              description="Browse platform fulfilment orders"
              icon={ShoppingBag}
            />
            <AdminQuickLink
              to="/dashboard/admin/users"
              label="Users"
              description="Search and manage accounts"
              icon={Users}
            />
            <AdminQuickLink
              to="/dashboard/admin/disputes"
              label="Disputes"
              description="Review customer disputes"
              icon={Scale}
            />
            <AdminQuickLink
              to="/dashboard/admin/vendors/products"
              label="Vendor products"
              description="Browse marketplace listings by vendor"
              icon={Package}
            />
            <AdminQuickLink
              to="/dashboard/admin/settlements"
              label="Settlements"
              description="Refunds, ledger, and payouts"
              icon={Wallet}
            />
          </div>
        </div>
      </AsyncState>
    </div>
  );
}
