import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Store } from "lucide-react";
import { AsyncState } from "@/components/AsyncState";
import { Navbar } from "@/components/Navbar";
import { QueryErrorState } from "@/components/QueryErrorState";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  categoryEmoji,
  loadSelectedStoreId,
  saveSelectedStoreId,
  storeLabel,
  toShopProduct,
  type ShopProduct,
} from "@/lib/catalog-display";
import { listCategories, listStoreProducts, listStores } from "@/lib/api";
import { z } from "zod";

const search = z.object({
  categoryId: z.string().optional(),
  storeId: z.string().optional(),
  q: z.string().optional(),
});

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
  const { categoryId, storeId: searchStoreId, q: searchQ } = Route.useSearch();
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

  const selectedStoreId = searchStoreId ?? loadSelectedStoreId() ?? stores[0]?.id ?? null;
  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? stores[0];

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsQueryError,
    refetch: refetchProducts,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: ["products", selectedStore?.id, categoryId, q],
    queryFn: () =>
      listStoreProducts(selectedStore!.id, {
        categoryId: categoryId || undefined,
        q: q || undefined,
        status: "ACTIVE",
        limit: 100,
      }),
    enabled: !!selectedStore?.id,
  });

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const shopProducts: ShopProduct[] = useMemo(
    () =>
      products.map((p) =>
        toShopProduct(p, selectedStore?.name ?? "Store", categoryNameById.get(p.categoryId) ?? "Groceries"),
      ),
    [products, selectedStore?.name, categoryNameById],
  );

  const setStore = (id: string) => {
    saveSelectedStoreId(id);
    navigate({ search: { storeId: id, categoryId: undefined } });
  };

  const setCat = (id: string | undefined) => navigate({ search: { storeId: selectedStore?.id, categoryId: id } });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {storesError ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <QueryErrorState
            error={storesQueryError}
            title="Couldn't load stores"
            onRetry={() => void refetchStores()}
            retrying={storesFetching && !storesLoading}
          />
        </section>
      ) : (
      <>
      <section className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Everything in store</h1>
          <p className="mt-2 text-muted-foreground">
            {storesLoading ? "Loading stores…" : `${stores.length} open store${stores.length === 1 ? "" : "s"}`}
          </p>

          {stores.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStore(s.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selectedStore?.id === s.id
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
                if (e.key === "Enter") {
                  navigate({ search: { storeId: selectedStore?.id, categoryId, q: q || undefined } });
                }
              }}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
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
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
          : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
