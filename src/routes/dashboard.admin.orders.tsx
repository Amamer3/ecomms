import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAdminOrders } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({ meta: [{ title: "Platform orders — GoMarket" }] }),
});

function AdminOrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listAdminOrders({ limit: 50 }),
  });

  return (
    <div>
      <AdminPageHeader
        title="Platform orders"
        description="Browse fulfilment orders across the marketplace for operations and support."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading orders…"
        errorTitle="Couldn't load orders"
      >
        <AdminDataTable
          title={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
          headers={["Order", "Store", "Status", "Customer", "Total"]}
          rows={orders.map((o) => [
            o.orderNumber,
            o.storeName,
            o.status,
            o.customer.phone,
            formatGhs(parseMoney(o.total)),
          ])}
        />
      </AsyncState>
    </div>
  );
}
