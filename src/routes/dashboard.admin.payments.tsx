import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAdminPayments } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/payments")({
  component: AdminPaymentsPage,
  head: () => ({ meta: [{ title: "Platform payments — GoMarket" }] }),
});

function AdminPaymentsPage() {
  const { data: payments = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => listAdminPayments({ limit: 50 }),
  });

  return (
    <div>
      <AdminPageHeader
        title="Platform payments"
        description="Review payment records and statuses across customer checkouts."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading payments…"
        errorTitle="Couldn't load payments"
      >
        <AdminDataTable
          title={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}
          headers={["Payment ID", "Status", "Amount", "Order"]}
          rows={payments.map((p) => [
            p.id,
            p.status,
            formatGhs(parseMoney(p.amount)),
            p.orderId?.slice(0, 8) ?? "—",
          ])}
        />
      </AsyncState>
    </div>
  );
}
