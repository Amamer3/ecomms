import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { deleteProduct, getProduct, listCategories, updateProduct } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { useAdminCatalogAction, type AdminVendorCatalogProduct } from "@/lib/admin-vendor-catalog";
import { categoryEmoji } from "@/lib/catalog-display";
import { productImagesForApi, type ProductImageFormValue } from "@/lib/product-images";
import { ProductImageField } from "@/components/catalog/ProductImageField";
import {
  adminInputCls,
  adminLabelCls,
  adminUserDisplayName,
  AdminDetailGrid,
  AdminFormCard,
  AdminMono,
  AdminPrimaryButton,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

const PRODUCT_STATUSES = ["ACTIVE", "OUT_OF_STOCK", "ARCHIVED"] as const;

export function AdminProductDetailContent({
  productId,
  preview,
  onUpdated,
  onArchived,
}: {
  productId: string;
  preview?: AdminVendorCatalogProduct | null;
  onUpdated?: () => void;
  onArchived?: () => void;
}) {
  const { runAction } = useAdminCatalogAction();
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "each",
    stockQty: "0",
    description: "",
    status: "ACTIVE" as (typeof PRODUCT_STATUSES)[number],
    images: [] as ProductImageFormValue[],
  });

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

  useEffect(() => {
    if (!resolved) return;
    setForm({
      name: resolved.name,
      price: String(parseMoney(resolved.price)),
      unit: resolved.unit,
      stockQty: String(resolved.stockQty),
      description: resolved.description ?? "",
      status: resolved.status,
      images: resolved.images.map((image, position) => ({
        url: image.url,
        position,
      })),
    });
  }, [resolved]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const stockQty = parseInt(form.stockQty, 10);
    if (!form.name.trim() || Number.isNaN(price)) return;
    setSubmitting(true);
    try {
      await runAction("Product updated", () =>
        updateProduct(productId, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price,
          unit: form.unit,
          stockQty: Number.isNaN(stockQty) ? 0 : stockQty,
          status: form.status,
          images: productImagesForApi(form.images),
        }),
      );
      onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  };

  const onArchive = async () => {
    setArchiving(true);
    try {
      const ok = await runAction("Product archived", () => deleteProduct(productId));
      if (ok) onArchived?.();
    } finally {
      setArchiving(false);
    }
  };

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
        {(form.images[0]?.url || resolved.images[0]?.url) ? (
          <img
            src={form.images[0]?.url || resolved.images[0]?.url}
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

      <form onSubmit={(e) => void onSubmit(e)}>
        <AdminFormCard title="Edit product" description="Update listing details or archive this product.">
          <label className="block">
            <span className={adminLabelCls}>Name</span>
            <input
              className={adminInputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelCls}>Price (GHS)</span>
              <input
                type="number"
                step="0.01"
                className={adminInputCls}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className={adminLabelCls}>Stock qty</span>
              <input
                type="number"
                className={adminInputCls}
                value={form.stockQty}
                onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
              />
            </label>
          </div>
          <label className="block">
            <span className={adminLabelCls}>Unit</span>
            <input
              className={adminInputCls}
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className={adminLabelCls}>Status</span>
            <select
              className={adminInputCls}
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))
              }
            >
              {PRODUCT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={adminLabelCls}>Description</span>
            <textarea
              className={adminInputCls}
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <ProductImageField
            images={form.images}
            onChange={(images) => setForm((f) => ({ ...f, images }))}
            inputClassName={adminInputCls}
            labelClassName={adminLabelCls}
            disabled={submitting || archiving}
          />
          <AdminPrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Save product"}
          </AdminPrimaryButton>
          <button
            type="button"
            disabled={archiving}
            onClick={() => void onArchive()}
            className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
          >
            {archiving ? "Archiving…" : "Archive product"}
          </button>
        </AdminFormCard>
      </form>
    </div>
  );
}
