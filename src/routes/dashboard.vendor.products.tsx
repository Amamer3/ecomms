import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listVendorProducts } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { formatGhs } from "@/lib/format-money";
import { AsyncState } from "@/components/AsyncState";
import { CatalogDataTable, CatalogPageHeader } from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/dashboard/vendor/products")({
  component: VendorProductsPage,
  head: () => ({ meta: [{ title: "My products — GoMarket" }] }),
});

function VendorProductsPage() {
  const { data: products = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: () => listVendorProducts({ limit: 100 }),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <CatalogPageHeader
          title="My products"
          description="Products you own across all stores."
        />
        <Link
          to="/dashboard/vendor/products/new"
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          New product
        </Link>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading products…"
        errorTitle="Couldn't load products"
      >
        <CatalogDataTable
          title={`${products.length} product${products.length === 1 ? "" : "s"}`}
          headers={["Name", "Price", "Stock", "Status", ""]}
          rows={products.map((p) => [
            p.name,
            formatGhs(parseMoney(p.price)),
            String(p.stockQty),
            p.status,
            <Link
              key={p.id}
              to="/dashboard/vendor/products/$productId"
              params={{ productId: p.id }}
              className="font-medium text-primary hover:underline"
            >
              Edit
            </Link>,
          ])}
        />
      </AsyncState>
    </div>
  );
}
