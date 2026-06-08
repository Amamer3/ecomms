import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Store } from "lucide-react";
import { AsyncState } from "@/components/AsyncState";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { QueryErrorState } from "@/components/QueryErrorState";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categoryEmoji, storeLabel, toShopProduct, type ShopProduct } from "@/lib/catalog-display";
import { listCategories, listStoreProducts, listStores } from "@/lib/api";
import type { Product, StoreSummary } from "@/lib/api/types";
import { useClientReady } from "@/lib/use-client-ready";
import { z } from "zod";

const search = z.object({
  categoryId: z.string().optional(),
  storeId: z.string().optional(),
  q: z.string().optional(),
});

type ProductWithStore = { product: Product; store: StoreSummary };

async function fetchStoreProducts(
  store: StoreSummary,
  filters: { categoryId?: string; q?: string },
): Promise<ProductWithStore[]> {
  const products = await listStoreProducts(store.id, {
    categoryId: filters.categoryId || undefined,
    q: filters.q || undefined,
    status: "ACTIVE",
    limit: 100,
  });
  return products.map((product) => ({ product, store }));
}

export const Route = createFileRoute("/shop")({
  component: Shop,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop fresh groceries & essentials — GoMarket" },
      { name: "description", content: "Browse perishable, frozen, pantry, and household goods from local vendors." },
    ],
  }),
});

function Shop() {
  const clientReady = useClientReady();
  const { categoryId, storeId: filterStoreId, q: searchQ } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(searchQ ?? "");

  const {
    data: stores = [],
    isLoading: storesLoading,
    isError: storesError,
    error: storesQueryError,
    refetch: refetchStores,
    isFetching: storesFetching,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: () => listStores({ limit: 50 }),
  });

  const filteredStore = filterStoreId ? stores.find((s) => s.id === filterStoreId) : undefined;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const productFilters = { categoryId, q: searchQ };

  const {
    data: singleStoreProducts = [],
    isLoading: singleLoading,
    isError: singleError,
    error: singleQueryError,
    refetch: refetchSingle,
    isFetching: singleFetching,
  } = useQuery({
    queryKey: ["products", filterStoreId, categoryId, searchQ],
    queryFn: () => fetchStoreProducts(filteredStore!, productFilters),
    enabled: !!filterStoreId && !!filteredStore,
  });

  const {
    data: mixedProducts = [],
    isLoading: mixedLoading,
    isError: mixedError,
    error: mixedQueryError,
    refetch: refetchMixed,
    isFetching: mixedFetching,
  } = useQuery({
    queryKey: ["products", "mixed", stores.map((s) => s.id), categoryId, searchQ],
    queryFn: async () => {
      const batches = await Promise.all(stores.map((store) => fetchStoreProducts(store, productFilters)));
      return batches.flat();
    },
    enabled: !filterStoreId && stores.length > 0,
  });

  const productsLoading = filterStoreId ? singleLoading : mixedLoading;
  const productsError = filterStoreId ? singleError : mixedError;
  const productsQueryError = filterStoreId ? singleQueryError : mixedQueryError;
  const refetchProducts = filterStoreId ? refetchSingle : refetchMixed;
  const productsFetching = filterStoreId ? singleFetching : mixedFetching;
  const productRows = filterStoreId ? singleStoreProducts : mixedProducts;

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const shopProducts: ShopProduct[] = useMemo(
    () =>
      productRows.map(({ product, store }) =>
        toShopProduct(product, store.name, categoryNameById.get(product.categoryId) ?? "Groceries"),
      ),
    [productRows, categoryNameById],
  );

  const setStoreFilter = (id: string | undefined) => {
    navigate({ search: { storeId: id, categoryId: id ? undefined : categoryId, q: searchQ || undefined } });
  };

  const setCat = (id: string | undefined) =>
    navigate({ search: { storeId: filterStoreId, categoryId: id, q: searchQ || undefined } });

  const runSearch = () => navigate({ search: { storeId: filterStoreId, categoryId, q: q || undefined } });

  return (
    <div className="min-h-screen bg-background">
      <Navbar overlay />

      {storesError ? (
        <section className="mx-auto max-w-7xl px-4 py-12 pt-[var(--navbar-offset)] sm:px-6 lg:px-8">
          <QueryErrorState
            error={storesQueryError}
            title="Couldn't load stores"
            onRetry={() => void refetchStores()}
            retrying={storesFetching && !storesLoading}
          />
        </section>
      ) : (
        <>
          <PageHero innerClassName="sm:py-12">
              <h1 className="font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
                {filteredStore ? filteredStore.name : "Everything in store"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {!clientReady || storesLoading
                  ? "Loading stores…"
                  : filteredStore
                    ? `Shopping at ${storeLabel(filteredStore)}`
                    : `Browse products from ${stores.length} open store${stores.length === 1 ? "" : "s"}`}
              </p>

              {stores.length > 0 && (
                <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => setStoreFilter(undefined)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      !filterStoreId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    All stores
                  </button>
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStoreFilter(s.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        filterStoreId === s.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <Store className="h-3.5 w-3.5" />
                      {storeLabel(s)}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-[var(--shadow-soft)]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder="Search products…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
          </PageHero>

          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Pill active={!categoryId} onClick={() => setCat(undefined)} label="All" />
              {categories.map((c) => (
                <Pill
                  key={c.id}
                  active={categoryId === c.id}
                  onClick={() => setCat(c.id)}
                  label={`${categoryEmoji(c.type)} ${c.name}`}
                />
              ))}
            </div>

            <AsyncState
              isLoading={productsLoading}
              isError={productsError}
              error={productsQueryError}
              onRetry={() => void refetchProducts()}
              isRetrying={productsFetching && !productsLoading}
              loadingMessage="Loading products…"
              errorTitle="Couldn't load products"
              className="mt-16 justify-center"
            >
              {shopProducts.length === 0 ? (
                <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center">
                  <p className="text-lg font-medium">Nothing matched your search.</p>
                  <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                    Reset filters
                  </Link>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {shopProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </AsyncState>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
          : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
