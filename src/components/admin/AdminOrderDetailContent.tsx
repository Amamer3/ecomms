import { useQuery } from "@tanstack/react-query";
import { getAdminOrder } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { FulfilmentOrder } from "@/lib/api/types";
import {
  AdminDetailGrid,
  AdminMono,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export function formatOrderCustomer(order: FulfilmentOrder): string {
  const name = [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ");
  return name || order.customer?.phone || order.customerPhone || order.customerId || "—";
}

function formatAddress(order: FulfilmentOrder): string {
  const a = order.address;
  if (!a) return "—";
  return [a.line1, a.line2, a.city, a.region].filter(Boolean).join(", ");
}

function timelineRows(order: FulfilmentOrder): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (order.placedAt) rows.push({ label: "Placed", value: new Date(order.placedAt).toLocaleString() });
  if (order.acceptedAt) rows.push({ label: "Accepted", value: new Date(order.acceptedAt).toLocaleString() });
  if (order.readyAt) rows.push({ label: "Ready", value: new Date(order.readyAt).toLocaleString() });
  if (order.pickedUpAt) rows.push({ label: "Picked up", value: new Date(order.pickedUpAt).toLocaleString() });
  if (order.deliveredAt) rows.push({ label: "Delivered", value: new Date(order.deliveredAt).toLocaleString() });
  if (order.cancelledAt) rows.push({ label: "Cancelled", value: new Date(order.cancelledAt).toLocaleString() });
  if (rows.length === 0 && order.createdAt) {
    rows.push({ label: "Created", value: new Date(order.createdAt).toLocaleString() });
  }
  return rows;
}

export function AdminOrderDetailContent({
  orderId,
  preview,
}: {
  orderId: string;
  preview?: FulfilmentOrder | null;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getAdminOrder(orderId),
  });

  const order = data ?? preview;

  if (isLoading && !order) {
    return <p className="text-sm text-muted-foreground">Loading order details…</p>;
  }

  if (isError && !order) {
    return <p className="text-sm text-destructive">Couldn&apos;t load this order.</p>;
  }

  if (!order) {
    return <p className="text-sm text-muted-foreground">Order not found.</p>;
  }

  const items = order.items ?? [];

  return (
    <div className="space-y-6">
      <AdminDetailGrid
        rows={[
          { label: "Order", value: order.orderNumber },
          {
            label: "Status",
            value: <AdminStatusBadge status={order.status} />,
          },
          { label: "Customer", value: formatOrderCustomer(order) },
          {
            label: "Phone",
            value: order.customer?.phone ?? order.customerPhone ?? "—",
          },
          { label: "Store", value: order.storeName ?? order.store?.name ?? "—" },
          { label: "Delivery address", value: formatAddress(order) },
          { label: "Subtotal", value: formatGhs(parseMoney(order.subtotal)) },
          { label: "Delivery fee", value: formatGhs(parseMoney(order.deliveryFee)) },
          { label: "Service fee", value: formatGhs(parseMoney(order.serviceFee)) },
          {
            label: "Discount",
            value: formatGhs(parseMoney(order.discountTotal)),
          },
          {
            label: "Total",
            value: <span className="font-semibold">{formatGhs(parseMoney(order.total))}</span>,
          },
          ...(order.payment
            ? [
                {
                  label: "Payment",
                  value: (
                    <span className="inline-flex flex-wrap items-center justify-end gap-2">
                      <AdminStatusBadge status={order.payment.status} />
                      <span>{formatGhs(parseMoney(order.payment.amount))}</span>
                    </span>
                  ),
                },
              ]
            : []),
          ...(order.notes ? [{ label: "Notes", value: order.notes }] : []),
          { label: "Order ID", value: <AdminMono>{order.id}</AdminMono> },
        ]}
      />

      {timelineRows(order).length > 0 ? (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Timeline</h4>
          <AdminDetailGrid rows={timelineRows(order)} />
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
          <div className="border-b border-border/60 px-4 py-3">
            <h4 className="text-sm font-semibold text-foreground">
              {items.length} item{items.length === 1 ? "" : "s"}
            </h4>
          </div>
          <ul className="divide-y divide-border/40">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.qty} {item.unit} × {formatGhs(parseMoney(item.unitPrice))}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatGhs(parseMoney(item.lineTotal))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
