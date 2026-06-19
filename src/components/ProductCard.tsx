import type { HomeProductCard, ShopProduct } from "@/lib/catalog-display";
import { toHomeProductCard } from "@/lib/catalog-display";
import type { StoreSummary } from "@/lib/api/types";
import { CustomerProductCard } from "@/components/customer/CustomerProductCard";

type StoreCardMeta = Pick<StoreSummary, "rating" | "ratingCount" | "prepTimeMinutes">;

export function ProductCard({
  product,
  store,
  layout = "grid",
}: {
  product: ShopProduct;
  store?: StoreCardMeta;
  layout?: "carousel" | "grid";
}) {
  const cardProduct: HomeProductCard = toHomeProductCard(product, store);
  return <CustomerProductCard product={cardProduct} layout={layout} />;
}

// Re-export for carousel sections
export { CustomerProductCard } from "@/components/customer/CustomerProductCard";
export type { HomeProductCard } from "@/lib/catalog-display";
