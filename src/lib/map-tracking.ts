/** Map-friendly tracking shape used by CustomerJourneyMap and DeliveryTrackingMap */

export type GeoPoint = { lat: number; lng: number };

export type MapTracking = {
  id: string;
  orderId: string;
  vendorName: string;
  customerName: string;
  customerArea: string;
  pickup: string;
  dropoff: string;
  status: "awaiting" | "en_route" | "delivered";
  etaMinutes: number;
  distanceKm: number;
  courier: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
    rating: number;
  };
  /** Human-readable courier position label for map popups */
  courierLocation: string;
  courierPoint: GeoPoint;
  pickupPoint: GeoPoint;
  dropoffPoint: GeoPoint;
};

export function defaultAccraPoint(): GeoPoint {
  return { lat: 5.6037, lng: -0.187 };
}
