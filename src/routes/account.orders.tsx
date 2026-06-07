import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCustomerOrders } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrdersPage,
  head: () => ({ meta: [{ title: "My orders — GoMarket" }] }),
});

function AccountOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
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

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : (
        <div className="space-y-8">
          <OrderSection title="Active orders" orders={active} showTracking />
          <OrderSection title="Past orders" orders={past} />
        </div>
      )}
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
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <Link
                to="/account/orders/$orderId"
                params={{ orderId: o.id }}
                className="font-semibold text-primary hover:underline"
              >
                {o.orderNumber}
              </Link>
              <p className="text-xs text-muted-foreground">
                {o.store.name} · {o.status}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatGhs(parseMoney(o.total))}</span>
              {showTracking && (
                <Link
                  to="/account/orders/$orderId/tracking"
                  params={{ orderId: o.id }}
                  className="text-xs font-medium text-primary hover:underline"
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
