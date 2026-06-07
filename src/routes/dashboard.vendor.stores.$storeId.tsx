import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getStore, updateStore } from "@/lib/api";
import {
  catalogInputCls,
  CatalogPageHeader,
  useVendorCatalogAction,
} from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/dashboard/vendor/stores/$storeId")({
  component: VendorStoreEditPage,
});

function VendorStoreEditPage() {
  const { storeId } = Route.useParams();
  const { runAction } = useVendorCatalogAction();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    prepTimeMinutes: "25",
    deliveryRadiusKm: "8",
    status: "OPEN" as "OPEN" | "CLOSED" | "SUSPENDED",
  });

  const { data: store, isLoading } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => getStore(storeId),
  });

  useEffect(() => {
    if (!store) return;
    setForm({
      name: store.name,
      description: store.description ?? "",
      prepTimeMinutes: String(store.prepTimeMinutes),
      deliveryRadiusKm: String(store.deliveryRadiusKm),
      status: store.status,
    });
  }, [store]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await runAction("Store updated", () =>
        updateStore(storeId, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          prepTimeMinutes: parseInt(form.prepTimeMinutes, 10),
          deliveryRadiusKm: parseFloat(form.deliveryRadiusKm),
          status: form.status,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading store…</p>;
  }

  if (!store) {
    return <p className="text-sm text-destructive">Store not found.</p>;
  }

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/vendor/stores"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My stores
      </Link>

      <CatalogPageHeader
        title={`Edit ${store.name}`}
        description="Update store settings for an owned location."
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description</span>
          <textarea
            className={catalogInputCls}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Prep time (min)</span>
            <input
              type="number"
              className={catalogInputCls}
              value={form.prepTimeMinutes}
              onChange={(e) => setForm((f) => ({ ...f, prepTimeMinutes: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Delivery radius (km)</span>
            <input
              type="number"
              step="0.1"
              className={catalogInputCls}
              value={form.deliveryRadiusKm}
              onChange={(e) => setForm((f) => ({ ...f, deliveryRadiusKm: e.target.value }))}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Status</span>
          <select
            className={catalogInputCls}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))
            }
          >
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save store"}
        </button>
      </form>
    </div>
  );
}
