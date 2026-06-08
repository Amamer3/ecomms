import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getCustomerOrder } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { CustomerDetailGrid, CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: AccountOrderDetailPage,
});

function AccountOrderDetailPage() {
  const { orderId } = Route.useParams();

  const { data: order, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customer-order", orderId],
    queryFn: () => getCustomerOrder(orderId),
  });

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isRetrying={isFetching && !isLoading}
      loadingMessage="Loading order…"
      errorTitle="Couldn't load order"
    >
      {!order ? (
        <p className="text-sm text-destructive">Order not found.</p>
      ) : (
    <div>
      <Link
        to="/account/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <CustomerPageHeader
        title={order.orderNumber}
        description={`Order from ${order.store.name}`}
      />

      <CustomerDetailGrid
        rows={[
          { label: "Status", value: order.status },
          { label: "Store", value: order.store.name },
          { label: "Subtotal", value: formatGhs(parseMoney(order.subtotal)) },
          { label: "Delivery", value: formatGhs(parseMoney(order.deliveryFee)) },
          { label: "Total", value: formatGhs(parseMoney(order.total)) },
          { label: "Placed", value: order.placedAt ?? order.createdAt },
        ]}
      />

      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Items
      </h3>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between px-4 py-3">
            <span>
              {item.name} × {item.qty}
            </span>
            <span className="font-medium">{formatGhs(parseMoney(item.lineTotal))}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/account/orders/$orderId/tracking"
        params={{ orderId }}
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        View delivery tracking
      </Link>
    </div>
      )}
    </AsyncState>
  );
}
