import { useQueryClient } from "@tanstack/react-query";
import { listAdminUsers, listStoreProducts, listStores } from "@/lib/api";
import type { AdminUser, Product, StoreSummary } from "@/lib/api/types";
import { runAction as executeAction } from "@/lib/run-action";

export type AdminVendorCatalogProduct = {
  product: Product;
  store: StoreSummary;
  vendor: AdminUser | null;
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function storeMatchesVendor(store: StoreSummary, businessName: string): boolean {
  const biz = normalizeName(businessName);
  if (!biz) return false;
  const name = normalizeName(store.name);
  const slug = store.slug.replace(/-/g, " ").toLowerCase();
  return name.includes(biz) || biz.includes(name) || slug.includes(biz) || biz.includes(slug);
}

export function storesForVendor(stores: StoreSummary[], vendor: AdminUser): StoreSummary[] {
  const profile = vendor.vendorProfile;
  if (!profile) return [];

  const byProfileId = stores.filter(
    (store) => store.vendorProfileId && store.vendorProfileId === profile.id,
  );
  if (byProfileId.length > 0) return byProfileId;

  return stores.filter((store) => storeMatchesVendor(store, profile.businessName));
}

export function buildStoreVendorMap(
  stores: StoreSummary[],
  vendors: AdminUser[],
): Map<string, AdminUser> {
  const map = new Map<string, AdminUser>();
  for (const store of stores) {
    if (store.vendorProfileId) {
      const vendor = vendors.find((v) => v.vendorProfile?.id === store.vendorProfileId);
      if (vendor) {
        map.set(store.id, vendor);
        continue;
      }
    }
    for (const vendor of vendors) {
      if (!vendor.vendorProfile) continue;
      if (storeMatchesVendor(store, vendor.vendorProfile.businessName)) {
        map.set(store.id, vendor);
        break;
      }
    }
  }
  return map;
}

export async function fetchAdminVendorCatalog(): Promise<AdminVendorCatalogProduct[]> {
  const [stores, vendorList] = await Promise.all([
    listStores({ limit: 100 }),
    listAdminUsers({ role: "VENDOR", limit: 100 }),
  ]);

  const vendors = vendorList.items.filter((user) => user.vendorProfile);
  const storeVendorMap = buildStoreVendorMap(stores, vendors);

  const batches = await Promise.all(
    stores.map(async (store) => {
      try {
        const products = await listStoreProducts(store.id, { limit: 100 });
        const vendor = storeVendorMap.get(store.id) ?? null;
        return products.map((product) => ({ product, store, vendor }));
      } catch {
        return [] as AdminVendorCatalogProduct[];
      }
    }),
  );

  return batches.flat();
}

export function productsForVendor(
  catalog: AdminVendorCatalogProduct[],
  vendor: AdminUser,
  stores: StoreSummary[],
): AdminVendorCatalogProduct[] {
  const vendorStores = storesForVendor(stores, vendor);
  const storeIds = new Set(vendorStores.map((store) => store.id));
  return catalog.filter((row) => storeIds.has(row.product.storeId));
}

export function countProductsByVendor(
  catalog: AdminVendorCatalogProduct[],
  vendors: AdminUser[],
  stores: StoreSummary[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const vendor of vendors) {
    counts.set(vendor.id, productsForVendor(catalog, vendor, stores).length);
  }
  return counts;
}

export function useAdminCatalogAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-vendor-catalog"] });
    void qc.invalidateQueries({ queryKey: ["product"] });
    void qc.invalidateQueries({ queryKey: ["stores"] });
    void qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const runAction = (label: string, fn: () => Promise<unknown>) =>
    executeAction(label, fn, invalidate);

  return { runAction, invalidate };
}

export function matchesCatalogSearch(row: AdminVendorCatalogProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.product.name,
    row.product.slug,
    row.product.status,
    row.store.name,
    row.store.city,
    row.vendor?.vendorProfile?.businessName,
    row.vendor?.email,
    row.vendor?.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
