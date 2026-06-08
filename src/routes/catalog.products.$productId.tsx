import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getProduct, listCategories, getStore } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { categoryEmoji } from "@/lib/catalog-display";
import { AsyncState } from "@/components/AsyncState";
import { CatalogPageHeader } from "@/components/catalog/catalog-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/catalog/products/$productId")({
  component: CatalogProductDetailPage,
});

function CatalogProductDetailPage() {
  const { productId } = Route.useParams();

  const { data: product, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const { data: store } = useQuery({
    queryKey: ["store", product?.storeId],
    queryFn: () => getStore(product!.storeId),
    enabled: !!product?.storeId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const category = categories.find((c) => c.id === product?.categoryId);

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isRetrying={isFetching && !isLoading}
      loadingMessage="Loading product…"
      errorTitle="Couldn't load product"
    >
      {!product ? (
        <p className="text-sm text-destructive">Product not found.</p>
      ) : (
    <div className="max-w-3xl">
      <Link
        to="/catalog/stores/$storeId"
        params={{ storeId: product.storeId }}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {store?.name ?? "store"}
      </Link>

      <CatalogPageHeader
        title={product.name}
        description={product.description ?? "Active marketplace product."}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl border border-border/60 bg-[image:var(--gradient-hero)]">
          {product.images[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-6xl text-muted-foreground/40">🛒</div>
          )}
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Price</dt>
            <dd className="text-2xl font-semibold">{formatGhs(parseMoney(product.price))}</dd>
            <dd className="text-muted-foreground">per {product.unit}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Status</dt>
            <dd className="font-medium">{product.status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Stock</dt>
            <dd className="font-medium">{product.stockQty}</dd>
          </div>
          {category && (
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Category</dt>
              <dd className="font-medium">
                {categoryEmoji(category.type)} {category.name}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Store</dt>
            <dd>
              <Link
                to="/catalog/stores/$storeId"
                params={{ storeId: product.storeId }}
                className="font-medium text-primary hover:underline"
              >
                {store?.name ?? product.storeId}
              </Link>
            </dd>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/shop"
              search={{ storeId: product.storeId }}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Shop this store
            </Link>
          </div>
        </dl>
      </div>
    </div>
      )}
    </AsyncState>
  );
}
