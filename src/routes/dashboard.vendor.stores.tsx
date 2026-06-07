import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listVendorStores } from "@/lib/api";
import { storeLabel } from "@/lib/catalog-display";
import { CatalogDataTable, CatalogPageHeader } from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/dashboard/vendor/stores")({
  component: VendorStoresPage,
  head: () => ({ meta: [{ title: "My stores — GoMarket" }] }),
});

function VendorStoresPage() {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["vendor-stores"],
    queryFn: listVendorStores,
  });

  return (
    <div>
      <CatalogPageHeader
        title="My stores"
        description="Stores owned by your vendor account."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading stores…</p>
      ) : (
        <CatalogDataTable
          title={`${stores.length} store${stores.length === 1 ? "" : "s"}`}
          headers={["Store", "City", "Status", "Products", ""]}
          rows={stores.map((s) => [
            storeLabel(s),
            s.city ?? "—",
            s.status,
            String(s.productCount ?? 0),
            <Link
              key={s.id}
              to="/dashboard/vendor/stores/$storeId"
              params={{ storeId: s.id }}
              className="font-medium text-primary hover:underline"
            >
              Edit
            </Link>,
          ])}
        />
      )}
    </div>
  );
}
