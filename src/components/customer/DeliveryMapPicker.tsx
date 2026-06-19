import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { ArrowLeft, Crosshair, Loader2, MapPin } from "lucide-react";
import { ACCRA_CENTER, readCurrentPosition, reverseGeocode, type GeocodedPlace } from "@/lib/geocoding";
import { cn } from "@/lib/utils";

type LatLng = { lat: number; lng: number };

type DeliveryMapPickerProps = {
  initialCenter?: LatLng;
  onBack: () => void;
  onConfirm: (place: GeocodedPlace & LatLng) => void | Promise<void>;
  confirming?: boolean;
};

export function DeliveryMapPicker({
  initialCenter,
  onBack,
  onConfirm,
  confirming = false,
}: DeliveryMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onPositionChangeRef = useRef<(lat: number, lng: number) => void>(() => {});
  const geocodeTimerRef = useRef<number | null>(null);

  const [position, setPosition] = useState<LatLng>(initialCenter ?? ACCRA_CENTER);
  const [place, setPlace] = useState<GeocodedPlace | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const runGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await reverseGeocode(lat, lng);
      setPlace(result);
    } catch {
      setGeocodeError("Could not resolve this location. You can still confirm the pin.");
      setPlace(null);
    } finally {
      setGeocoding(false);
    }
  }, []);

  onPositionChangeRef.current = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    if (geocodeTimerRef.current != null) {
      window.clearTimeout(geocodeTimerRef.current);
    }
    geocodeTimerRef.current = window.setTimeout(() => {
      void runGeocode(lat, lng);
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (geocodeTimerRef.current != null) {
        window.clearTimeout(geocodeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void runGeocode(position.lat, position.lng);
    // Only geocode on mount for the initial center.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
      if (cancelled || !mapRef.current) return;

      const start = initialCenter ?? ACCRA_CENTER;

      map = L.map(mapRef.current, {
        center: [start.lat, start.lng],
        zoom: 15,
        scrollWheelZoom: true,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: "",
        html: `
          <div class="relative flex h-10 w-10 -translate-x-1/2 -translate-y-full items-end justify-center">
            <div class="h-9 w-9 rounded-full bg-primary shadow-lg ring-4 ring-primary/25"></div>
            <div class="absolute bottom-1 h-2.5 w-2.5 rounded-full bg-primary-foreground"></div>
            <div class="absolute -bottom-1 h-3 w-3 rotate-45 bg-primary"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([start.lat, start.lng], {
        draggable: true,
        icon: markerIcon,
        autoPan: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const next = marker.getLatLng();
        onPositionChangeRef.current(next.lat, next.lng);
      });

      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        onPositionChangeRef.current(event.latlng.lat, event.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      window.setTimeout(() => map?.invalidateSize(), 0);
      window.setTimeout(() => map?.invalidateSize(), 200);
    });

    return () => {
      cancelled = true;
      mapInstanceRef.current = null;
      markerRef.current = null;
      map?.remove();
      setMapReady(false);
    };
  }, [initialCenter?.lat, initialCenter?.lng]);

  const moveMapTo = (lat: number, lng: number) => {
    markerRef.current?.setLatLng([lat, lng]);
    mapInstanceRef.current?.panTo([lat, lng]);
    onPositionChangeRef.current(lat, lng);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const current = await readCurrentPosition();
      moveMapTo(current.coords.latitude, current.coords.longitude);
    } catch {
      setGeocodeError("Could not access your location. Check browser permissions.");
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = () => {
    const resolved =
      place ??
      ({
        line1: `Pinned location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`,
        city: "Accra",
        country: "GH",
        displayName: `Pinned location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`,
      } satisfies GeocodedPlace);

    void onConfirm({
      ...resolved,
      lat: position.lat,
      lng: position.lng,
    });
  };

  return (
    <div className="flex min-h-[min(78vh,640px)] flex-col">
      <div className="relative border-b border-border/60 px-4 pb-3 pt-4 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-center text-base font-semibold text-foreground">Choose on map</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Tap the map or drag the pin to set your delivery point
        </p>
      </div>

      <div className="relative min-h-[min(46vh,360px)] flex-1">
        <LeafletStyleFix />
        <div ref={mapRef} className="absolute inset-0 bg-secondary/30" />
        {!mapReady && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading map…
          </div>
        )}
        <button
          type="button"
          onClick={() => void handleUseCurrentLocation()}
          disabled={locating || !mapReady}
          className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          My location
        </button>
      </div>

      <div className="border-t border-border/60 bg-background px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            {geocoding ? (
              <p className="text-sm text-muted-foreground">Finding address…</p>
            ) : place ? (
              <>
                <p className="truncate text-sm font-semibold text-foreground">{place.line1}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{place.displayName}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {geocodeError ?? "Move the pin to choose a delivery location."}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirming || geocoding || !mapReady}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity",
            (confirming || geocoding || !mapReady) && "opacity-60",
          )}
        >
          {confirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving address…
            </>
          ) : (
            "Confirm this location"
          )}
        </button>
      </div>
    </div>
  );
}

function LeafletStyleFix() {
  return (
    <style>
      {`
        .leaflet-container { font: inherit; z-index: 0; }
        .leaflet-control-attribution { border-radius: 9999px 0 0 0; font-size: 10px; }
        .leaflet-control-zoom { border: none !important; overflow: hidden; border-radius: 9999px; }
        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border) / 0.6) !important;
        }
      `}
    </style>
  );
}
