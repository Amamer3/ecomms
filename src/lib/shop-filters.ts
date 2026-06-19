import type { Product, StoreSummary } from "@/lib/api/types";
import { parseMoney } from "@/lib/api/client";
import { distanceMeters } from "@/lib/geocoding";

export type ShopSort =
  | "relevant"
  | "closest"
  | "cheapest_delivery"
  | "fastest_delivery"
  | "best_rating";

export type ShopFilters = {
  sort: ShopSort;
  offersOnly: boolean;
  minRating: number | null;
};

export const DEFAULT_SHOP_FILTERS: ShopFilters = {
  sort: "relevant",
  offersOnly: false,
  minRating: null,
};

export const SHOP_SORT_OPTIONS: { value: ShopSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "closest", label: "Closest" },
  { value: "cheapest_delivery", label: "Cheapest delivery" },
  { value: "fastest_delivery", label: "Fastest delivery" },
  { value: "best_rating", label: "Best Rating" },
];

export const SHOP_RATING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Any rating" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
];

export function shopFiltersFromSearch(search: Record<string, unknown>): ShopFilters {
  const sort = search.sort;
  const validSort = SHOP_SORT_OPTIONS.some((o) => o.value === sort) ? (sort as ShopSort) : "relevant";

  return {
    sort: validSort,
    offersOnly: search.offers === "1" || search.offers === true,
    minRating:
      typeof search.minRating === "number" && !Number.isNaN(search.minRating)
        ? search.minRating
        : typeof search.minRating === "string" && search.minRating
          ? Number(search.minRating)
          : null,
  };
}

export function shopFiltersToSearch(
  filters: ShopFilters,
  base: Record<string, unknown> = {},
): Record<string, unknown> {
  const next = { ...base };

  if (filters.sort === "relevant") delete next.sort;
  else next.sort = filters.sort;

  if (filters.offersOnly) next.offers = "1";
  else delete next.offers;

  if (filters.minRating != null) next.minRating = filters.minRating;
  else delete next.minRating;

  return next;
}

function estimateDeliveryFee(prepMinutes: number): number {
  return Math.round((8 + prepMinutes * 0.15) * 100) / 100;
}

export type ProductWithStore = { product: Product; store: StoreSummary };

export function applyShopFilters(
  rows: ProductWithStore[],
  filters: ShopFilters,
  origin?: { lat: number; lng: number },
): ProductWithStore[] {
  let result = [...rows];

  if (filters.offersOnly) {
    result = result.filter(({ product }) => {
      const compare = product.compareAtPrice ? parseMoney(product.compareAtPrice) : null;
      const price = parseMoney(product.price);
      return compare != null && compare > price;
    });
  }

  if (filters.minRating != null) {
    result = result.filter(({ store }) => store.rating >= filters.minRating!);
  }

  switch (filters.sort) {
    case "closest":
      if (origin) {
        result.sort(
          (a, b) =>
            distanceMeters(origin.lat, origin.lng, a.store.lat, a.store.lng) -
            distanceMeters(origin.lat, origin.lng, b.store.lat, b.store.lng),
        );
      }
      break;
    case "cheapest_delivery":
      result.sort(
        (a, b) =>
          estimateDeliveryFee(a.store.prepTimeMinutes) - estimateDeliveryFee(b.store.prepTimeMinutes),
      );
      break;
    case "fastest_delivery":
      result.sort((a, b) => a.store.prepTimeMinutes - b.store.prepTimeMinutes);
      break;
    case "best_rating":
      result.sort((a, b) => b.store.rating - a.store.rating || b.store.ratingCount - a.store.ratingCount);
      break;
    default:
      break;
  }

  return result;
}

export function hasActiveShopFilters(filters: ShopFilters): boolean {
  return (
    filters.sort !== DEFAULT_SHOP_FILTERS.sort ||
    filters.offersOnly !== DEFAULT_SHOP_FILTERS.offersOnly ||
    filters.minRating !== DEFAULT_SHOP_FILTERS.minRating
  );
}
