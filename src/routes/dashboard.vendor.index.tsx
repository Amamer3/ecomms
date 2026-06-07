import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptVendorOrder,
  listVendorOrders,
  preparingVendorOrder,
  readyVendorOrder,
  rejectVendorOrder,
} from "@/lib/api";
import { ApiError, parseMoney } from "@/lib/api/client";
import { VendorPageHeader } from "@/components/vendor/vendor-ui";
import { formatGhs } from "@/lib/format-money";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/vendor/")({
  component: VendorOrdersPage,
  head: () => ({ meta: [{ title: "Vendor orders — GoMarket" }] }),
});

function VendorOrdersPage() {
  const qc = useQueryClient();

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: () => listVendorOrders({ limit: 30 }),
  });

  const act = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
      void refetchOrders();
      void qc.invalidateQueries({ queryKey: ["vendor-earnings"] });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  };

  return (
    <div>
      <VendorPageHeader
        title="Fulfilment orders"
        description="Accept, prepare, and mark orders ready for pickup."
      />

      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to="/dashboard/vendor/orders/$orderId"
                  params={{ orderId: o.id }}
                  className="font-semibold text-primary hover:underline"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {o.customer.firstName ?? o.customer.phone} · {formatGhs(parseMoney(o.total))}
                </p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(o.status === "PLACED" || o.status === "PAID") && (
                <>
                  <Action label="Accept" onClick={() => act("Accepted", () => acceptVendorOrder(o.id))} />
                  <Action
                    label="Reject"
                    onClick={() => act("Rejected", () => rejectVendorOrder(o.id, "Unavailable"))}
                  />
                </>
              )}
              {o.status === "ACCEPTED" && (
                <Action label="Preparing" onClick={() => act("Preparing", () => preparingVendorOrder(o.id))} />
              )}
              {o.status === "PREPARING" && (
                <Action label="Ready" onClick={() => act("Ready", () => readyVendorOrder(o.id))} />
              )}
            </div>
          </li>
        ))}
        {orders.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No orders yet
          </li>
        )}
      </ul>
    </div>
  );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
    >
      {label}
    </button>
  );
}
