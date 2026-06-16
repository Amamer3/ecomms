import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";
import { createProduct, listCategories } from "@/lib/api";
import type { AdminUser, StoreSummary } from "@/lib/api/types";
import { storesForVendor, useAdminCatalogAction } from "@/lib/admin-vendor-catalog";
import { productImagesForApi, type ProductImageFormValue } from "@/lib/product-images";
import { ProductImageField } from "@/components/catalog/ProductImageField";
import {
  adminInputCls,
  adminLabelCls,
  AdminPrimaryButton,
} from "@/components/admin/admin-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function defaultForm(storeId = "", categoryId = "") {
  return {
    name: "",
    price: "",
    unit: "each",
    stockQty: "10",
    storeId,
    categoryId,
    description: "",
    images: [] as ProductImageFormValue[],
  };
}

export function CreateAdminProductDialog({
  open,
  onOpenChange,
  stores,
  vendor,
  onCreated,
  onViewProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: StoreSummary[];
  vendor?: AdminUser | null;
  onCreated?: () => void;
  onViewProduct?: (productId: string) => void;
}) {
  const { runAction } = useAdminCatalogAction();
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState("");

  const availableStores = useMemo(() => {
    if (!vendor) return stores;
    const vendorStores = storesForVendor(stores, vendor);
    return vendorStores.length > 0 ? vendorStores : stores;
  }, [stores, vendor]);

  const defaultStoreId = availableStores[0]?.id ?? "";

  const [form, setForm] = useState(() => defaultForm(defaultStoreId));

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setForm(defaultForm(defaultStoreId));
      setCreatedId(null);
      setCreatedName("");
    }
  }, [open, defaultStoreId]);

  useEffect(() => {
    if (!open || form.storeId) return;
    if (defaultStoreId) setForm((f) => ({ ...f, storeId: defaultStoreId }));
  }, [open, defaultStoreId, form.storeId]);

  const storeId = form.storeId || defaultStoreId;

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
      const ok = await runAction("Product created", async () => {
        const result = await createProduct({
          storeId,
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price,
          unit: form.unit,
          stockQty: Number.isNaN(stockQty) ? 10 : stockQty,
          status: "ACTIVE",
          images: productImagesForApi(form.images),
        });
        setCreatedId(result.id);
        setCreatedName(result.name);
      });
      if (ok) onCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {createdId ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product created
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">{createdName}</span> is now listed on
                the marketplace.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
              >
                Close
              </button>
              {onViewProduct ? (
                <AdminPrimaryButton
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onViewProduct(createdId);
                  }}
                >
                  View product
                </AdminPrimaryButton>
              ) : null}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create product</DialogTitle>
              <DialogDescription>
                {vendor
                  ? `Add a product to ${vendor.vendorProfile?.businessName ?? "this vendor"}'s catalog.`
                  : "Add a new product to any marketplace store."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
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
                <span className={adminLabelCls}>Store</span>
                <select
                  className={adminInputCls}
                  value={storeId}
                  onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
                  required
                >
                  {availableStores.length === 0 ? (
                    <option value="">No stores available</option>
                  ) : (
                    availableStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block">
                <span className={adminLabelCls}>Category</span>
                <select
                  className={adminInputCls}
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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
                disabled={submitting}
              />

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
                >
                  Cancel
                </button>
                <AdminPrimaryButton type="submit" disabled={submitting || !storeId}>
                  {submitting ? "Creating…" : "Create product"}
                </AdminPrimaryButton>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
