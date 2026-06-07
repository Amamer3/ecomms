import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { GeoPoint, MapTracking } from "@/lib/map-tracking";

type LatLngTuple = [number, number];
type OsrmRouteResponse = {
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

type DeliveryTrackingMapProps = {
  delivery: MapTracking;
  showDirections?: boolean;
  className?: string;
};

export function DeliveryTrackingMap({ delivery, showDirections = delivery.status === "en_route", className }: DeliveryTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [resetCount, setResetCount] = useState(0);
  const courierPosition = useMemo(() => toLatLng(delivery.courierPoint), [delivery.courierPoint.lat, delivery.courierPoint.lng]);
  const deliveryPosition = useMemo(() => toLatLng(delivery.dropoffPoint), [delivery.dropoffPoint.lat, delivery.dropoffPoint.lng]);
  const [roadRoute, setRoadRoute] = useState<LatLngTuple[] | null>(null);
  const visibleRoute = useMemo(
    () => roadRoute?.length ? roadRoute : [courierPosition, deliveryPosition],
    [courierPosition, deliveryPosition, roadRoute],
  );
  const visibleRouteKey = visibleRoute.map(([lat, lng]) => `${lat},${lng}`).join("|");

  useEffect(() => {
    let cancelled = false;

    if (!showDirections) {
      setRoadRoute(null);
      return;
    }

    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${delivery.courierPoint.lng},${delivery.courierPoint.lat};${delivery.dropoffPoint.lng},${delivery.dropoffPoint.lat}?overview=full&geometries=geojson`;

    fetch(routeUrl)
      .then((response) => response.json() as Promise<OsrmRouteResponse>)
      .then((data) => {
        const coordinates = data.routes?.[0]?.geometry?.coordinates;
        if (!cancelled && coordinates?.length) {
          setRoadRoute(coordinates.map(([lng, lat]) => [lat, lng]));
        }
      })
      .catch(() => {
        if (!cancelled) setRoadRoute([toLatLng(delivery.courierPoint), toLatLng(delivery.dropoffPoint)]);
      });

    return () => {
      cancelled = true;
    };
  }, [delivery.courierPoint.lat, delivery.courierPoint.lng, delivery.dropoffPoint.lat, delivery.dropoffPoint.lng, showDirections]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (cancelled || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: courierPosition,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.scale({ position: "bottomleft" }).addTo(map);
      map.fitBounds(visibleRoute, { padding: [56, 56], maxZoom: 14 });

      if (showDirections) {
        const pane = map.createPane("delivery-route");
        pane.style.zIndex = "410";

        L.polyline(visibleRoute, {
          pane: "delivery-route",
          color: "#ffffff",
          opacity: 0.7,
          weight: 6,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        L.polyline(visibleRoute, {
          pane: "delivery-route",
          color: "#111827",
          opacity: 0.75,
          weight: 3,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      }

      const courierIcon = L.divIcon({
        className: "",
        html: getPinHtml("Courier", "bg-primary", "bg-primary-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51],
      });
      const deliveryIcon = L.divIcon({
        className: "",
        html: getPinHtml("Delivery", "bg-accent", "bg-accent-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51],
      });

      L.marker(courierPosition, { icon: courierIcon })
        .bindPopup(`<strong>Courier is here</strong><br />${escapeHtml(delivery.courierLocation)}`)
        .addTo(map);
      L.marker(deliveryPosition, { icon: deliveryIcon })
        .bindPopup(`<strong>Delivery location</strong><br />${escapeHtml(delivery.dropoff)}`)
        .addTo(map);

      window.setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [
    className,
    courierPosition,
    delivery.courierLocation,
    delivery.dropoff,
    deliveryPosition,
    resetCount,
    showDirections,
    visibleRoute,
    visibleRouteKey,
  ]);

  return (
    <div className={`relative h-full min-h-[320px] w-full ${className ?? ""}`}>
      <LeafletStyleFix />
      <div ref={mapRef} className="h-full min-h-[320px] w-full" />
      <button
        type="button"
        onClick={() => setResetCount((count) => count + 1)}
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
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char] ?? char));
}

function LeafletStyleFix() {
  return (
    <style>
      {`
        .leaflet-container {
          font: inherit;
          z-index: 0;
        }

        .leaflet-control-attribution {
          border-radius: 9999px 0 0 0;
          font-size: 10px;
        }
      `}
    </style>
  );
}
