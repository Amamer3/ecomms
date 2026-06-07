import type { CustomerTracking, Delivery } from "@/lib/api/types";
import type { MapTracking } from "@/lib/map-tracking";
import { defaultAccraPoint } from "@/lib/map-tracking";

function point(lat?: number | null, lng?: number | null) {
  if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
  return defaultAccraPoint();
}

export function customerTrackingToMap(t: CustomerTracking): MapTracking | null {
  const d = t.delivery;
  if (!d?.pickup || !d.dropoff) return null;

  const rider = t.rider;
  const enRoute =
    d.status === "EN_ROUTE_TO_CUSTOMER" ||
    d.status === "PICKED_UP" ||
    d.status === "ACCEPTED" ||
    d.status === "AT_STORE";

  return {
    id: d.id,
    orderId: t.orderNumber,
    vendorName: d.pickup.addressLine ?? d.pickup.city ?? "Store",
    customerName: rider?.fullName ?? "Courier",
    customerArea: d.dropoff.city,
    pickup: [d.pickup.addressLine, d.pickup.city].filter(Boolean).join(" · ") || "Pickup",
    dropoff: [d.dropoff.line1, d.dropoff.city].filter(Boolean).join(", "),
    status: d.status === "DELIVERED" ? "delivered" : enRoute ? "en_route" : "awaiting",
    etaMinutes: Math.max(8, Math.round((d.distanceKm ?? 4) * 4)),
    distanceKm: d.distanceKm ?? 4,
    courier: {
      name: rider?.fullName ?? "Assigned courier",
      phone: "",
      vehicle: rider?.vehicleType ?? "Vehicle",
      plateNumber: rider?.plateNumber ?? "—",
      rating: rider?.rating ?? 4.5,
    },
    courierLocation: rider?.fullName ? `${rider.fullName} en route` : "Courier assigned",
    courierPoint: point(rider?.currentLat, rider?.currentLng),
    pickupPoint: point(d.pickup.lat, d.pickup.lng),
    dropoffPoint: point(d.dropoff.lat, d.dropoff.lng),
  };
}

export function deliveryToMap(d: Delivery): MapTracking {
  const order = d.order;
  return {
    id: d.id,
    orderId: order?.orderNumber ?? d.orderId,
    vendorName: order?.storeName ?? "Store",
    customerName: order?.customerName ?? order?.customerPhone ?? "Customer",
    customerArea: d.dropoff?.city ?? "Drop-off",
    pickup: [d.pickup?.addressLine, d.pickup?.city].filter(Boolean).join(" · ") || "Pickup",
    dropoff: [d.dropoff?.line1, d.dropoff?.city].filter(Boolean).join(", "),
    status:
      d.status === "DELIVERED"
        ? "delivered"
        : d.status === "UNASSIGNED" || d.status === "ASSIGNED"
          ? "awaiting"
          : "en_route",
    etaMinutes: Math.max(8, Math.round((d.distanceKm ?? 4) * 4)),
    distanceKm: d.distanceKm ?? 4,
    courier: {
      name: order?.customerName ?? "You",
      phone: order?.customerPhone ?? "",
      vehicle: "Courier",
      plateNumber: "—",
      rating: 4.5,
    },
    courierLocation: d.status.replaceAll("_", " ").toLowerCase(),
    courierPoint: point(d.pickupLat, d.pickupLng),
    pickupPoint: point(d.pickup?.lat ?? d.pickupLat, d.pickup?.lng ?? d.pickupLng),
    dropoffPoint: point(d.dropoff?.lat ?? d.dropoffLat, d.dropoff?.lng ?? d.dropoffLng),
  };
}
