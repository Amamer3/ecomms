import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCustomerOrders } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/orders/")({
  component: AccountOrdersPage,
  head: () => ({ meta: [{ title: "My orders — GoMarket" }] }),
});

function AccountOrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => listCustomerOrders({ limit: 50 }),
  });

  const active = orders.filter(
    (o) => !["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(o.status),
  );
  const past = orders.filter((o) =>
    ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(o.status),
  );

  return (
    <div>
      <CustomerPageHeader
        title="Your orders"
        description="Orders placed on your account."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading orders…"
        errorTitle="Couldn't load your orders"
      >
        <div className="space-y-8">
          <OrderSection title="Active orders" orders={active} showTracking />
          <OrderSection title="Past orders" orders={past} />
        </div>
      </AsyncState>
    </div>
  );
}

function OrderSection({
  title,
  orders,
  showTracking = false,
}: {
  title: string;
  orders: Awaited<ReturnType<typeof listCustomerOrders>>;
  showTracking?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <section>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">None</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {orders.map((o) => (
          <li
            key={o.id}
            className="flex flex-col gap-2 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
          >
            <div className="min-w-0">
              <Link
                to="/account/orders/$orderId"
                params={{ orderId: o.id }}
                className="font-semibold text-primary hover:underline"
              >
                {o.orderNumber}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground break-words">
                {o.store.name} · {o.status}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="font-medium">{formatGhs(parseMoney(o.total))}</span>
              {showTracking && (
                <Link
                  to="/account/orders/$orderId/tracking"
                  params={{ orderId: o.id }}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Track
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
