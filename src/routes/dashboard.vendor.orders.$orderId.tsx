import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  acceptVendorOrder,
  getVendorOrder,
  preparingVendorOrder,
  readyVendorOrder,
  rejectVendorOrder,
} from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import {
  useVendorAction,
  vendorInputCls,
  VendorDetailGrid,
  VendorPageHeader,
} from "@/components/vendor/vendor-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/vendor/orders/$orderId")({
  component: VendorOrderDetailPage,
});

function VendorOrderDetailPage() {
  const { orderId } = Route.useParams();
  const { runAction } = useVendorAction();
  const [rejectReason, setRejectReason] = useState("Unavailable");

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["vendor-order", orderId],
    queryFn: () => getVendorOrder(orderId),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading order…</p>;
  }

  if (!order) {
    return <p className="text-sm text-destructive">Order not found.</p>;
  }

  const customerName =
    [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || order.customer.phone;

  const act = (label: string, fn: () => Promise<unknown>) => {
    void runAction(label, fn).then((ok) => {
      if (ok) void refetch();
    });
  };

  const canAccept = order.status === "PAID" || order.status === "PLACED";
  const canPrepare = order.status === "ACCEPTED";
  const canReady = order.status === "PREPARING";

  return (
    <div>
      <Link
        to="/dashboard/vendor"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <VendorPageHeader
        title={order.orderNumber}
        description={`${customerName} · ${order.storeName}`}
      />

      <VendorDetailGrid
        rows={[
          { label: "Status", value: order.status },
          { label: "Customer", value: customerName },
          { label: "Phone", value: order.customer.phone },
          { label: "Subtotal", value: formatGhs(parseMoney(order.subtotal)) },
          { label: "Delivery", value: formatGhs(parseMoney(order.deliveryFee)) },
          { label: "Total", value: formatGhs(parseMoney(order.total)) },
          { label: "Payment", value: order.payment?.status ?? "—" },
        ]}
      />

      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
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

      <div className="mt-8 space-y-4">
        {canAccept && (
          <div className="flex flex-wrap gap-2">
            <ActionBtn label="Accept order" onClick={() => act("Order accepted", () => acceptVendorOrder(orderId))} />
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <label className="min-w-[12rem] flex-1">
                <span className="mb-1 block text-xs font-medium">Reject reason</span>
                <input
                  className={vendorInputCls}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </label>
              <ActionBtn
                label="Reject order"
                variant="destructive"
                onClick={() =>
                  act("Order rejected", () => rejectVendorOrder(orderId, rejectReason.trim() || undefined))
                }
              />
            </div>
          </div>
        )}
        {canPrepare && (
          <ActionBtn
            label="Mark preparing"
            onClick={() => act("Preparing", () => preparingVendorOrder(orderId))}
          />
        )}
        {canReady && (
          <ActionBtn label="Mark ready for pickup" onClick={() => act("Ready", () => readyVendorOrder(orderId))} />
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "destructive"
          ? "rounded-full border border-destructive/50 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
          : "rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
      }
    >
      {label}
    </button>
  );
}
