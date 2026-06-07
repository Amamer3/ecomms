import type { Category, Product, StoreSummary } from "@/lib/api/types";
import { parseMoney } from "@/lib/api/client";

const CATEGORY_EMOJI: Record<string, string> = {
  PERISHABLE: "🥬",
  FROZEN: "❄️",
  PANTRY: "🫙",
  BEVERAGES: "🥤",
  HOUSEHOLD: "🧴",
  PERSONAL_CARE: "🧼",
  ELECTRONICS: "📱",
  OTHER: "🛒",
};

export function categoryEmoji(type: Category["type"]): string {
  return CATEGORY_EMOJI[type] ?? "🛒";
}

/** UI product card shape (no mock catalog). */
export type ShopProduct = {
  id: string;
  name: string;
  vendor: string;
  price: number;
  unit: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  stockQty: number;
  status: Product["status"];
};

export function toShopProduct(product: Product, storeName: string, categoryName: string): ShopProduct {
  return {
    id: product.id,
    name: product.name,
    vendor: storeName,
    price: parseMoney(product.price),
    unit: product.unit,
    categoryId: product.categoryId,
    categoryName,
    imageUrl: product.images[0]?.url,
    stockQty: product.stockQty,
    status: product.status,
  };
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
