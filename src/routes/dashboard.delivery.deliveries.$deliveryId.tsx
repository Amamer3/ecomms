import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  acceptDelivery,
  atStore,
  completeDelivery,
  enRouteToStore,
  getRiderDelivery,
  inTransitDelivery,
  pickupDelivery,
} from "@/lib/api";
import { deliveryToMap } from "@/lib/tracking-mappers";
import { DeliveryTrackingMap } from "@/components/DeliveryTrackingMap";
import { riderInputCls, RiderDetailGrid, RiderPageHeader, useRiderAction } from "@/components/rider/rider-ui";

export const Route = createFileRoute("/dashboard/delivery/deliveries/$deliveryId")({
  component: RiderDeliveryDetailPage,
});

function RiderDeliveryDetailPage() {
  const { deliveryId } = Route.useParams();
  const { runAction } = useRiderAction();
  const [handoverCode, setHandoverCode] = useState("");

  const { data: delivery, isLoading, refetch } = useQuery({
    queryKey: ["rider-delivery", deliveryId],
    queryFn: () => getRiderDelivery(deliveryId),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading delivery…</p>;
  }

  if (!delivery) {
    return <p className="text-sm text-destructive">Delivery not found.</p>;
  }

  const mapData = deliveryToMap(delivery);
  const status = delivery.status;

  const act = (label: string, fn: () => Promise<unknown>) => {
    void runAction(label, fn).then((ok) => {
      if (ok) void refetch();
    });
  };

  return (
    <div>
      <Link
        to="/dashboard/delivery/deliveries"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All deliveries
      </Link>

      <RiderPageHeader
        title={delivery.order?.orderNumber ?? delivery.orderId}
        description={`${delivery.order?.storeName ?? "Store"} → ${delivery.dropoff?.line1 ?? delivery.dropoff?.city ?? "Customer"}`}
      />

      <RiderDetailGrid
        rows={[
          { label: "Status", value: status },
          { label: "Store", value: delivery.order?.storeName ?? "—" },
          { label: "Customer", value: delivery.order?.customerName ?? delivery.order?.customerPhone ?? "—" },
          { label: "Dropoff", value: delivery.dropoff?.line1 ?? "—" },
          { label: "Distance", value: delivery.distanceKm != null ? `${delivery.distanceKm} km` : "—" },
        ]}
      />

      {mapData && (
        <div className="my-6 h-[360px] overflow-hidden rounded-3xl border border-border/60">
          <DeliveryTrackingMap delivery={mapData} showDirections={mapData.status === "en_route"} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status === "ASSIGNED" && (
          <ActionBtn label="Accept" onClick={() => act("Accepted", () => acceptDelivery(deliveryId))} />
        )}
        {status === "ACCEPTED" && (
          <ActionBtn
            label="En route to store"
            onClick={() => act("En route to store", () => enRouteToStore(deliveryId))}
          />
        )}
        {status === "EN_ROUTE_TO_STORE" && (
          <ActionBtn label="At store" onClick={() => act("At store", () => atStore(deliveryId))} />
        )}
        {status === "AT_STORE" && (
          <ActionBtn label="Confirm pickup" onClick={() => act("Picked up", () => pickupDelivery(deliveryId))} />
        )}
        {status === "PICKED_UP" && (
          <ActionBtn
            label="En route to customer"
            onClick={() => act("In transit", () => inTransitDelivery(deliveryId))}
          />
        )}
        {status === "EN_ROUTE_TO_CUSTOMER" && (
          <div className="flex w-full flex-wrap items-end gap-2">
            <label className="min-w-[12rem] flex-1">
              <span className="mb-1 block text-xs font-medium">Handover code</span>
              <input
                className={riderInputCls}
                value={handoverCode}
                onChange={(e) => setHandoverCode(e.target.value)}
                placeholder="Code from customer"
              />
            </label>
            <ActionBtn
              label="Complete delivery"
              onClick={() =>
                handoverCode.trim() &&
                act("Delivered", () => completeDelivery(deliveryId, handoverCode.trim()))
              }
            />
          </div>
        )}
      </div>

    </div>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
    >
      {label}
    </button>
  );
}
