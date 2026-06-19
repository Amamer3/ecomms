import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { AsyncState } from "@/components/AsyncState";
import { PageHero } from "@/components/PageHero";
import { QueryErrorState } from "@/components/QueryErrorState";
import { ProductCard } from "@/components/ProductCard";
import { CustomerSectionHeader } from "@/components/customer/CustomerPageChrome";
import { CustomerShopFiltersSheet } from "@/components/customer/CustomerShopFiltersSheet";
import { StorefrontPage } from "@/components/customer/StorefrontPage";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";
import { useCustomerDeliveryAddress } from "@/hooks/use-customer-location";
import { categoryEmoji, storeLabel, toShopProduct } from "@/lib/catalog-display";
import { listCategories, listStoreProducts, listStores } from "@/lib/api";
import type { Product, StoreSummary } from "@/lib/api/types";
import { useClientReady } from "@/lib/use-client-ready";
import {
  applyShopFilters,
  hasActiveShopFilters,
  shopFiltersFromSearch,
  shopFiltersToSearch,
  type ShopFilters,
} from "@/lib/shop-filters";
import { cn } from "@/lib/utils";
import { z } from "zod";

const search = z.object({
  categoryId: z.string().optional(),
  storeId: z.string().optional(),
  q: z.string().optional(),
  view: z.enum(["search"]).optional(),
  sort: z
    .enum(["relevant", "closest", "cheapest_delivery", "fastest_delivery", "best_rating"])
    .optional(),
  offers: z.enum(["1"]).optional(),
  minRating: z.coerce.number().optional(),
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
  const isCustomerApp = useIsCustomerApp();
  const clientReady = useClientReady();
  const routeSearch = Route.useSearch();
  const { categoryId, storeId: filterStoreId, q: searchQ, view } = routeSearch;
  const filters = useMemo(() => shopFiltersFromSearch(routeSearch), [routeSearch]);
  const { activeAddress } = useCustomerDeliveryAddress();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(searchQ ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === "search" && isCustomerApp) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => window.clearTimeout(id);
    }
  }, [view, isCustomerApp]);

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

  const filteredProductRows = useMemo(
    () =>
      applyShopFilters(
        productRows,
        filters,
        activeAddress ? { lat: activeAddress.lat, lng: activeAddress.lng } : undefined,
      ),
    [productRows, filters, activeAddress],
  );

  const withSearch = (next: Record<string, unknown>) =>
    shopFiltersToSearch(filters, {
      ...routeSearch,
      ...next,
      view: undefined,
    });

  const setStoreFilter = (id: string | undefined) => {
    navigate({
      search: withSearch({
        storeId: id,
        categoryId: id ? undefined : categoryId,
        q: searchQ || undefined,
      }),
    });
  };

  const setCat = (id: string | undefined) =>
    navigate({
      search: withSearch({
        storeId: filterStoreId,
        categoryId: id,
        q: searchQ || undefined,
      }),
    });

  const runSearch = () =>
    navigate({
      search: withSearch({
        storeId: filterStoreId,
        categoryId,
        q: q || undefined,
      }),
    });

  const handleApplyFilters = (next: ShopFilters) => {
    navigate({
      search: shopFiltersToSearch(next, {
        ...routeSearch,
        storeId: filterStoreId,
        categoryId,
        q: searchQ || undefined,
        view: undefined,
      }),
    });
  };

  const title = filteredStore ? filteredStore.name : "Everything in store";
  const description =
    !clientReady || storesLoading
      ? "Loading stores…"
      : filteredStore
        ? `Shopping at ${storeLabel(filteredStore)}`
        : `Browse products from ${stores.length} open store${stores.length === 1 ? "" : "s"}`;

  const guestHero = (
    <PageHero innerClassName="sm:py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {stores.length > 0 && (
        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StorePill active={!filterStoreId} onClick={() => setStoreFilter(undefined)} label="All stores" />
          {stores.map((s) => (
            <StorePill
              key={s.id}
              active={filterStoreId === s.id}
              onClick={() => setStoreFilter(s.id)}
              label={storeLabel(s)}
              icon
            />
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
  );

  return (
    <StorefrontPage activeTab="stores" guestHero={guestHero} mainClassName={isCustomerApp ? "py-6" : undefined}>
      {storesError ? (
        <QueryErrorState
          error={storesQueryError}
          title="Couldn't load stores"
          onRetry={() => void refetchStores()}
          retrying={storesFetching && !storesLoading}
        />
      ) : (
        <>
          {isCustomerApp && (
            <>
              <CustomerSectionHeader title={title} description={description} />
              {stores.length > 0 && (
                <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <StorePill active={!filterStoreId} onClick={() => setStoreFilter(undefined)} label="All stores" customer />
                  {stores.map((s) => (
                    <StorePill
                      key={s.id}
                      active={filterStoreId === s.id}
                      onClick={() => setStoreFilter(s.id)}
                      label={storeLabel(s)}
                      icon
                      customer
                    />
                  ))}
                </div>
              )}
              <div className="mb-6 flex max-w-xl items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-secondary px-4 py-2.5">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runSearch();
                    }}
                    placeholder="Search products…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className={cn(
                    "relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground",
                    hasActiveShopFilters(filters) && "text-primary",
                  )}
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasActiveShopFilters(filters) && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              </div>
              <CustomerShopFiltersSheet
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                value={filters}
                onApply={handleApplyFilters}
              />
            </>
          )}

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Pill active={!categoryId} onClick={() => setCat(undefined)} label="All" customer={isCustomerApp} />
            {categories.map((c) => (
              <Pill
                key={c.id}
                active={categoryId === c.id}
                onClick={() => setCat(c.id)}
                label={`${categoryEmoji(c.type)} ${c.name}`}
                customer={isCustomerApp}
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
            className="mt-10 justify-center"
          >
            {filteredProductRows.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-lg font-medium">Nothing matched your search.</p>
                <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Reset filters
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {filteredProductRows.map(({ product, store }) => (
                  <ProductCard
                    key={product.id}
                    product={toShopProduct(
                      product,
                      store.name,
                      categoryNameById.get(product.categoryId) ?? "Groceries",
                    )}
                    store={store}
                  />
                ))}
              </div>
            )}
          </AsyncState>
        </>
      )}
    </StorefrontPage>
  );
}

function StorePill({
  active,
  onClick,
  label,
  icon,
  customer,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: boolean;
  customer?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        customer
          ? active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border/60 bg-card/50 hover:border-primary/40"
          : active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card hover:border-primary/40",
      )}
    >
      {icon && <Store className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function Pill({
  active,
  onClick,
  label,
  customer,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  customer?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        customer
          ? active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border/60 bg-card/50 text-foreground/70 hover:border-primary/40 hover:text-foreground"
          : active
            ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
            : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
