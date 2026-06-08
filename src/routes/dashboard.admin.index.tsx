import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/api";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
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
          <AdminStat label="Orders" value={String(stats?.orders ?? "—")} sub={`${stats?.pendingOrders ?? 0} pending`} />
          <AdminStat
            label="Active deliveries"
            value={String(stats?.activeDeliveries ?? "—")}
            sub="In progress"
          />
          <AdminStat
            label="Open disputes"
            value={String(stats?.openDisputes ?? "—")}
            sub="Needs review"
          />
          <AdminStat
            label="Notification outbox"
            value={String(stats?.pendingOutbox ?? "—")}
            sub="Pending delivery"
          />
          <AdminStat
            label="Pending refunds"
            value={String(stats?.pendingRefunds ?? "—")}
            sub="Awaiting processing"
          />
          <AdminStat
            label="Pending payouts"
            value={String(stats?.pendingPayouts ?? "—")}
            sub="Settlement queue"
          />
        </div>
      </AsyncState>
    </div>
  );
}
