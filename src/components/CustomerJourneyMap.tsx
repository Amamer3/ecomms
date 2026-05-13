import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { DeliveryTracking, GeoPoint } from "@/lib/delivery-tracking";

type LatLngTuple = [number, number];

type OsrmRouteResponse = {
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

type CustomerJourneyMapProps = {
  delivery: DeliveryTracking;
  /** When true, draw road route through vendor → courier → you (accepted). */
  showLiveRoute: boolean;
  className?: string;
};

export function CustomerJourneyMap({
  delivery,
  showLiveRoute,
  className,
}: CustomerJourneyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [resetCount, setResetCount] = useState(0);

  const courier = useMemo(
    () => toLatLng(delivery.courierPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.courierPoint.lat, delivery.courierPoint.lng],
  );
  const pickup = useMemo(
    () => toLatLng(delivery.pickupPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.pickupPoint.lat, delivery.pickupPoint.lng],
  );
  const dropoff = useMemo(
    () => toLatLng(delivery.dropoffPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.dropoffPoint.lat, delivery.dropoffPoint.lng],
  );

  const boundsPoints = useMemo(() => [courier, pickup, dropoff], [courier, pickup, dropoff]);

  const [roadRoute, setRoadRoute] = useState<LatLngTuple[] | null>(null);
  const routeFetchSig = useRef("");

  const visibleRoute = useMemo(() => {
    if (roadRoute?.length) return roadRoute;
    return [courier, pickup, dropoff];
  }, [courier, pickup, dropoff, roadRoute]);
  const visibleRouteKey = visibleRoute.map(([lat, lng]) => `${lat},${lng}`).join("|");

  useEffect(() => {
    let cancelled = false;
    if (!showLiveRoute) {
      setRoadRoute(null);
      routeFetchSig.current = "";
      return;
    }
    const sig = `${delivery.id}-${delivery.pickupPoint.lat}-${delivery.pickupPoint.lng}-${delivery.dropoffPoint.lat}-${delivery.dropoffPoint.lng}`;
    if (routeFetchSig.current === sig) return;
    routeFetchSig.current = sig;

    const { courierPoint, pickupPoint, dropoffPoint } = delivery;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${courierPoint.lng},${courierPoint.lat};${pickupPoint.lng},${pickupPoint.lat};${dropoffPoint.lng},${dropoffPoint.lat}?overview=full&geometries=geojson`;

    fetch(routeUrl)
      .then((response) => response.json() as Promise<OsrmRouteResponse>)
      .then((data) => {
        const coordinates = data.routes?.[0]?.geometry?.coordinates;
        if (!cancelled && coordinates?.length) {
          setRoadRoute(coordinates.map(([lng, lat]) => [lat, lng]));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoadRoute([
            toLatLng(delivery.courierPoint),
            toLatLng(delivery.pickupPoint),
            toLatLng(delivery.dropoffPoint),
          ]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showLiveRoute, delivery]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
      if (cancelled || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: courier,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.scale({ position: "bottomleft" }).addTo(map);
      map.fitBounds(boundsPoints, { padding: [48, 48], maxZoom: 14 });

      if (showLiveRoute && visibleRoute.length > 1) {
        const pane = map.createPane("customer-route");
        pane.style.zIndex = "410";
        L.polyline(visibleRoute, {
          pane: "customer-route",
          color: "#ffffff",
          opacity: 0.65,
          weight: 6,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        L.polyline(visibleRoute, {
          pane: "customer-route",
          color: "#0f766e",
          opacity: 0.85,
          weight: 3,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      }

      const vendorIcon = L.divIcon({
        className: "",
        html: getPinHtml("Vendor", "bg-amber-500", "bg-white"),
        iconSize: [104, 54],
        iconAnchor: [52, 51],
      });
      const courierIcon = L.divIcon({
        className: "",
        html: getPinHtml("Courier", "bg-primary", "bg-primary-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51],
      });
      const youIcon = L.divIcon({
        className: "",
        html: getPinHtml("You", "bg-accent", "bg-accent-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51],
      });

      L.marker(pickup, { icon: vendorIcon })
        .bindPopup(`<strong>Vendor pickup</strong><br />${escapeHtml(delivery.pickup)}`)
        .addTo(map);
      L.marker(courier, { icon: courierIcon })
        .bindPopup(
          `<strong>Courier</strong><br />${escapeHtml(delivery.courier.name)} · ${escapeHtml(delivery.courierLocation)}`,
        )
        .addTo(map);
      L.marker(dropoff, { icon: youIcon })
        .bindPopup(`<strong>Your address</strong><br />${escapeHtml(delivery.dropoff)}`)
        .addTo(map);

      window.setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [
    boundsPoints,
    courier,
    delivery.courier.name,
    delivery.courierLocation,
    delivery.courierPoint.lat,
    delivery.courierPoint.lng,
    delivery.dropoff,
    delivery.pickup,
    dropoff,
    pickup,
    resetCount,
    showLiveRoute,
    visibleRoute,
    visibleRouteKey,
  ]);

  return (
    <div className={`relative h-full min-h-[300px] w-full ${className ?? ""}`}>
      <LeafletStyleFix />
      <div
        ref={mapRef}
        className="h-full min-h-[300px] w-full rounded-2xl border border-border/60"
      />
      <button
        type="button"
        onClick={() => setResetCount((c) => c + 1)}
        className="absolute right-3 top-3 z-[1000] rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold shadow-sm"
      >
        Reset view
      </button>
    </div>
  );
}

function getPinHtml(label: string, pinClass: string, dotClass: string) {
  return `
    <div class="flex h-[54px] w-[104px] flex-col items-center">
      <div class="whitespace-nowrap rounded-full border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-semibold shadow-sm">${label}</div>
      <div class="relative mt-1 h-7 w-7">
        <div class="absolute inset-0 -rotate-45 rounded-[50%_50%_50%_0] ${pinClass} shadow-md ring-2 ring-background/80"></div>
        <div class="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass}"></div>
      </div>
    </div>
  `;
}

function toLatLng(point: GeoPoint): LatLngTuple {
  return [point.lat, point.lng];
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      (
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
          string,
          string
        >
      )[char] ?? char,
  );
}

function LeafletStyleFix() {
  return (
    <style>
      {`
        .leaflet-container { font: inherit; z-index: 0; }
        .leaflet-control-attribution { border-radius: 9999px 0 0 0; font-size: 10px; }
      `}
    </style>
  );
}
