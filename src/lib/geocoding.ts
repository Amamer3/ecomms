export const ACCRA_CENTER = { lat: 5.6037, lng: -0.187 } as const;

export type GeocodedPlace = {
  line1: string;
  city: string;
  region?: string;
  country: string;
  displayName: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  country_code?: string;
};

type NominatimReverseResponse = {
  name?: string;
  display_name?: string;
  address?: NominatimAddress;
};

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fallbackPlace(lat: number, lng: number): GeocodedPlace {
  const line1 = `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  return {
    line1,
    city: "Accra",
    country: "GH",
    displayName: line1,
  };
}

function parseNominatimResult(data: NominatimReverseResponse, lat: number, lng: number): GeocodedPlace {
  const addr = data.address ?? {};
  const line1 =
    [addr.house_number, addr.road].filter(Boolean).join(" ") ||
    addr.pedestrian ||
    addr.neighbourhood ||
    addr.suburb ||
    data.name ||
    firstDisplaySegment(data.display_name);

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    "Accra";

  const region = addr.state || addr.region || undefined;
  const countryCode = (addr.country_code || "gh").toUpperCase();

  return {
    line1: line1 || fallbackPlace(lat, lng).line1,
    city,
    region,
    country: countryCode.length === 2 ? countryCode : "GH",
    displayName: data.display_name || `${line1}, ${city}`,
  };
}

function firstDisplaySegment(displayName?: string): string | undefined {
  if (!displayName) return undefined;
  return displayName.split(",")[0]?.trim() || undefined;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Reverse geocode failed");
    const data = (await response.json()) as NominatimReverseResponse;
    return parseNominatimResult(data, lat, lng);
  } catch {
    return fallbackPlace(lat, lng);
  }
}

export function readCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60_000,
    });
  });
}
