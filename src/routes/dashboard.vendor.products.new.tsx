import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createProduct, listCategories, listVendorStores } from "@/lib/api";
import {
  catalogInputCls,
  CatalogPageHeader,
  useVendorCatalogAction,
} from "@/components/catalog/catalog-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/vendor/products/new")({
  component: VendorNewProductPage,
  head: () => ({ meta: [{ title: "New product — GoMarket" }] }),
});

function VendorNewProductPage() {
  const navigate = useNavigate();
  const { runAction } = useVendorCatalogAction();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "each",
    stockQty: "10",
    storeId: "",
    categoryId: "",
    description: "",
  });

  const { data: stores = [] } = useQuery({ queryKey: ["vendor-stores"], queryFn: listVendorStores });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const storeId = form.storeId || stores[0]?.id || "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const stockQty = parseInt(form.stockQty, 10);
    if (!form.name.trim() || !storeId || !form.categoryId || Number.isNaN(price)) {
      toast.error("Fill name, store, category, and price");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await runAction("Product created", () =>
        createProduct({
          storeId,
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price,
          unit: form.unit,
          stockQty: Number.isNaN(stockQty) ? 10 : stockQty,
          status: "ACTIVE",
        }),
      );
      if (ok) {
        navigate({ to: "/dashboard/vendor/products" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/vendor/products"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My products
      </Link>

      <CatalogPageHeader
        title="Create product"
        description="Add a new product to one of your stores."
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
          <span className="mb-1.5 block text-sm font-medium">Store</span>
          <select
            className={catalogInputCls}
            value={storeId}
            onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Category</span>
          <select
            className={catalogInputCls}
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
          {submitting ? "Creating…" : "Create product"}
        </button>
      </form>
    </div>
  );
}
