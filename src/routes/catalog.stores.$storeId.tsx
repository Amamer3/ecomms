import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { getStore, listCategories, listStoreProducts } from "@/lib/api";
import { categoryEmoji, storeLabel, toShopProduct } from "@/lib/catalog-display";
import { AsyncState } from "@/components/AsyncState";
import { CatalogPageHeader } from "@/components/catalog/catalog-ui";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/catalog/stores/$storeId")({
  component: CatalogStoreDetailPage,
});

function CatalogStoreDetailPage() {
  const { storeId } = Route.useParams();

  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
    error: storeQueryError,
    refetch: refetchStore,
    isFetching: storeFetching,
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => getStore(storeId),
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsQueryError,
    refetch: refetchProducts,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: ["store-products", storeId],
    queryFn: () => listStoreProducts(storeId, { status: "ACTIVE", limit: 100 }),
    enabled: !!storeId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  return (
    <AsyncState
      isLoading={storeLoading}
      isError={storeError}
      error={storeQueryError}
      onRetry={() => void refetchStore()}
      isRetrying={storeFetching && !storeLoading}
      loadingMessage="Loading store…"
      errorTitle="Couldn't load store"
    >
      {!store ? (
        <p className="text-sm text-destructive">Store not found.</p>
      ) : (
    <div>
      <Link
        to="/catalog/stores"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All stores
      </Link>

      <CatalogPageHeader
        title={storeLabel(store)}
        description={store.description ?? "Shop active products from this store."}
      />

      <dl className="mb-8 grid gap-3 rounded-2xl border border-border/60 bg-card p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Status</dt>
          <dd className="font-medium">{store.status}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Rating</dt>
          <dd className="inline-flex items-center gap-1 font-medium">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {store.rating.toFixed(1)} ({store.ratingCount})
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Prep time</dt>
          <dd className="font-medium">{store.prepTimeMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Delivery radius</dt>
          <dd className="font-medium">{store.deliveryRadiusKm} km</dd>
        </div>
      </dl>

      <h2 className="mb-4 text-lg font-semibold">Active products</h2>
      <AsyncState
        isLoading={productsLoading}
        isError={productsError}
        error={productsQueryError}
        onRetry={() => void refetchProducts()}
        isRetrying={productsFetching && !productsLoading}
        loadingMessage="Loading products…"
        errorTitle="Couldn't load products"
      >
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active products in this store.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {products.map((p) => {
              const shopProduct = toShopProduct(
                p,
                store.name,
                categoryNameById.get(p.categoryId) ?? "Groceries",
              );
              return <ProductCard key={p.id} product={shopProduct} store={store} />;
            })}
          </div>
        )}
      </AsyncState>
    </div>
      )}
    </AsyncState>
  );
}
