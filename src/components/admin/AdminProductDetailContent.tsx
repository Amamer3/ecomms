import { useQuery } from "@tanstack/react-query";
import { getProduct, listCategories } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { AdminVendorCatalogProduct } from "@/lib/admin-vendor-catalog";
import { categoryEmoji } from "@/lib/catalog-display";
import {
  adminUserDisplayName,
  AdminDetailGrid,
  AdminMono,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export function AdminProductDetailContent({
  productId,
  preview,
}: {
  productId: string;
  preview?: AdminVendorCatalogProduct | null;
}) {
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const resolved = product ?? preview?.product;
  const store = preview?.store;
  const vendor = preview?.vendor;
  const category = categories.find((c) => c.id === resolved?.categoryId);

  if (isLoading && !resolved) {
    return <p className="text-sm text-muted-foreground">Loading product details…</p>;
  }

  if (isError && !resolved) {
    return <p className="text-sm text-destructive">Couldn&apos;t load this product.</p>;
  }

  if (!resolved) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>;
  }

  const compareAt = resolved.compareAtPrice ? parseMoney(resolved.compareAtPrice) : null;
  const price = parseMoney(resolved.price);

  return (
    <div className="space-y-6">
      <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
        {resolved.images[0]?.url ? (
          <img
            src={resolved.images[0].url}
            alt={resolved.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full min-h-48 place-items-center text-5xl text-muted-foreground/40">
            🛒
          </div>
        )}
      </div>

      {resolved.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{resolved.description}</p>
      ) : null}

      <AdminDetailGrid
        rows={[
          { label: "Product ID", value: <AdminMono>{resolved.id}</AdminMono> },
          {
            label: "Status",
            value: <AdminStatusBadge status={resolved.status} />,
          },
          {
            label: "Price",
            value: (
              <span>
                {formatGhs(price)}
                {compareAt && compareAt > price ? (
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    {formatGhs(compareAt)}
                  </span>
                ) : null}
              </span>
            ),
          },
          { label: "Unit", value: resolved.unit },
          { label: "Stock", value: String(resolved.stockQty) },
          {
            label: "Low stock threshold",
            value:
              resolved.lowStockThreshold != null ? String(resolved.lowStockThreshold) : "—",
          },
          {
            label: "Category",
            value: category ? `${categoryEmoji(category.type)} ${category.name}` : "—",
          },
          { label: "Store", value: store?.name ?? resolved.storeId },
          {
            label: "Vendor",
            value: vendor
              ? vendor.vendorProfile?.businessName ?? adminUserDisplayName(vendor)
              : "Unassigned",
          },
          { label: "Perishable", value: resolved.perishable ? "Yes" : "No" },
          { label: "Cold chain", value: resolved.requiresColdChain ? "Required" : "No" },
          { label: "Currency", value: resolved.currency },
          { label: "Slug", value: <AdminMono>{resolved.slug}</AdminMono> },
        ]}
      />
    </div>
  );
}
