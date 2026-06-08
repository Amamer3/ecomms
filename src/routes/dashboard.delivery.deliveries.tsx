import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRiderDeliveries } from "@/lib/api";
import { AsyncState } from "@/components/AsyncState";
import { RiderPageHeader } from "@/components/rider/rider-ui";

export const Route = createFileRoute("/dashboard/delivery/deliveries")({
  component: RiderDeliveriesPage,
  head: () => ({ meta: [{ title: "Deliveries — GoMarket" }] }),
});

function RiderDeliveriesPage() {
  const { data: deliveries = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["rider-deliveries"],
    queryFn: () => listRiderDeliveries({ limit: 50 }),
    refetchInterval: 20_000,
  });

  return (
    <div>
      <RiderPageHeader
        title="Assigned deliveries"
        description="Deliveries offered or assigned to you."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading deliveries…"
        errorTitle="Couldn't load deliveries"
      >
        <ul className="space-y-3">
          {deliveries.map((d) => (
            <li key={d.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <Link
                to="/dashboard/delivery/deliveries/$deliveryId"
                params={{ deliveryId: d.id }}
                className="font-semibold text-primary hover:underline"
              >
                {d.order?.orderNumber ?? d.orderId}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.order?.storeName} → {d.dropoff?.city ?? "Dropoff"} · {d.status}
              </p>
            </li>
          ))}
          {deliveries.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No deliveries assigned. Go online to receive offers.
            </li>
          )}
        </ul>
      </AsyncState>
    </div>
  );
}
