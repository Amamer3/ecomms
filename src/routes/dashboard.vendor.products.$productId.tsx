import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { deleteProduct, getProduct, updateProduct } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import {
  catalogInputCls,
  CatalogPageHeader,
  useVendorCatalogAction,
} from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/dashboard/vendor/products/$productId")({
  component: VendorEditProductPage,
});

function VendorEditProductPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { runAction } = useVendorCatalogAction();
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "each",
    stockQty: "0",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED",
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      price: String(parseMoney(product.price)),
      unit: product.unit,
      stockQty: String(product.stockQty),
      description: product.description ?? "",
      status: product.status,
    });
  }, [product]);

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
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onArchive = async () => {
    setArchiving(true);
    try {
      const ok = await runAction("Product archived", () => deleteProduct(productId));
      if (ok) navigate({ to: "/dashboard/vendor/products" });
    } finally {
      setArchiving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading product…</p>;
  }

  if (!product) {
    return <p className="text-sm text-destructive">Product not found.</p>;
  }

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/vendor/products"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My products
      </Link>

      <CatalogPageHeader
        title={`Edit ${product.name}`}
        description="Update product details or archive it from your catalog."
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Name</span>
          <input
            className={catalogInputCls}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Price (GHS)</span>
            <input
              type="number"
              step="0.01"
              className={catalogInputCls}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Stock qty</span>
            <input
              type="number"
              className={catalogInputCls}
              value={form.stockQty}
              onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Unit</span>
          <input
            className={catalogInputCls}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Status</span>
          <select
            className={catalogInputCls}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))
            }
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description</span>
          <textarea
            className={catalogInputCls}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save product"}
        </button>
        <button
          type="button"
          disabled={archiving}
          onClick={() => void onArchive()}
          className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
        >
          {archiving ? "Archiving…" : "Archive product"}
        </button>
      </form>
    </div>
  );
}
