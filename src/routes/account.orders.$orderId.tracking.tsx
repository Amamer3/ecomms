import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { getOrderTracking } from "@/lib/api";
import { AsyncState } from "@/components/AsyncState";
import { CustomerDetailGrid, CustomerPageHeader } from "@/components/customer/customer-ui";
import { CustomerJourneyMap } from "@/components/CustomerJourneyMap";
import { customerTrackingToMap } from "@/lib/tracking-mappers";

export const Route = createFileRoute("/account/orders/$orderId/tracking")({
  component: AccountOrderTrackingPage,
});

function AccountOrderTrackingPage() {
  const { orderId } = Route.useParams();

  const { data: tracking, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["tracking", orderId],
    queryFn: () => getOrderTracking(orderId),
    refetchInterval: 15_000,
  });

  const mapTracking = useMemo(
    () => (tracking ? customerTrackingToMap(tracking) : null),
    [tracking],
  );

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isRetrying={isFetching && !isLoading}
      loadingMessage="Loading tracking…"
      errorTitle="Couldn't load tracking"
    >
      {!tracking ? (
        <p className="text-sm text-destructive">Tracking not available.</p>
      ) : (
    <div>
      <Link
        to="/account/orders/$orderId"
        params={{ orderId }}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Order {tracking.orderNumber}
      </Link>

      <CustomerPageHeader
        title={`Tracking ${tracking.orderNumber}`}
        description="Live delivery status and courier details."
      />

      {mapTracking ? (
        <div className="mb-6 h-[min(52vh,420px)] min-h-[220px] overflow-hidden rounded-2xl border border-border/60 sm:rounded-3xl">
          <CustomerJourneyMap
            delivery={mapTracking}
            showLiveRoute={mapTracking.status === "en_route"}
          />
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          Map will appear once pickup and dropoff locations are available.
        </p>
      )}

      <CustomerDetailGrid
        rows={[
          { label: "Order status", value: tracking.orderStatus },
          { label: "Delivery status", value: tracking.delivery?.status ?? "—" },
          {
            label: "Courier",
            value: tracking.rider
              ? `${tracking.rider.fullName} (${tracking.rider.vehicleType})`
              : "Not assigned",
          },
          {
            label: "Courier rating",
            value: tracking.rider
              ? `${tracking.rider.rating.toFixed(1)} (${tracking.rider.ratingCount})`
              : "—",
          },
          { label: "Plate", value: tracking.rider?.plateNumber ?? "—" },
        ]}
      />
    </div>
      )}
    </AsyncState>
  );
}
