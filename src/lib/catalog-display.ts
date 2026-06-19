import type { Product, StoreSummary } from "@/lib/api/types";
import { parseMoney } from "@/lib/api/client";

export { categoryEmoji, categoryTypeIcon, CategoryTypeIcon } from "@/lib/category-icons";

/** UI product card shape (no mock catalog). */
export type ShopProduct = {
  id: string;
  storeId: string;
  name: string;
  vendor: string;
  price: number;
  compareAtPrice?: number | null;
  unit: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  stockQty: number;
  status: Product["status"];
};

/** Bolt-style product card used across the storefront. */
export type HomeProductCard = {
  id: string;
  storeId: string;
  name: string;
  vendor: string;
  price: number;
  compareAtPrice?: number | null;
  unit: string;
  imageUrl?: string;
  stockQty: number;
  status: Product["status"];
  storeRating?: number;
  storeRatingCount?: number;
  prepTimeMinutes?: number;
};

type StoreCardMeta = Pick<StoreSummary, "rating" | "ratingCount" | "prepTimeMinutes">;

export function toShopProduct(product: Product, storeName: string, categoryName: string): ShopProduct {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    vendor: storeName,
    price: parseMoney(product.price),
    compareAtPrice: product.compareAtPrice ? parseMoney(product.compareAtPrice) : null,
    unit: product.unit,
    categoryId: product.categoryId,
    categoryName,
    imageUrl: product.images[0]?.url,
    stockQty: product.stockQty,
    status: product.status,
  };
}

export function toHomeProductCard(product: ShopProduct, store?: StoreCardMeta): HomeProductCard {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    vendor: product.vendor,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    unit: product.unit,
    imageUrl: product.imageUrl,
    stockQty: product.stockQty,
    status: product.status,
    storeRating: store?.rating,
    storeRatingCount: store?.ratingCount,
    prepTimeMinutes: store?.prepTimeMinutes,
  };
}

export function toHomeProductFromApi(
  product: Product,
  store: StoreSummary,
  categoryName: string,
): HomeProductCard {
  return toHomeProductCard(toShopProduct(product, store.name, categoryName), store);
}

export const SELECTED_STORE_KEY = "randys_selected_store_id";

export function loadSelectedStoreId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SELECTED_STORE_KEY);
}

export function saveSelectedStoreId(storeId: string): void {
  localStorage.setItem(SELECTED_STORE_KEY, storeId);
}

export function storeLabel(store: StoreSummary): string {
  return store.city ? `${store.name} · ${store.city}` : store.name;
}
