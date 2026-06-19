import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Pill,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  Store,
  Stethoscope,
} from "lucide-react";
import { useMemo } from "react";
import { AsyncState } from "@/components/AsyncState";
import { CustomerAppShell } from "@/components/customer/CustomerAppShell";
import {
  CustomerCategoryRow,
  CustomerProductRow,
  CustomerStoreRow,
} from "@/components/customer/CustomerHomeHeader";
import { QueryErrorState } from "@/components/QueryErrorState";
import { listCategories, listStoreProducts, listStores } from "@/lib/api";
import type { HomeProductCard } from "@/lib/catalog-display";
import { categoryTypeIcon, toHomeProductFromApi } from "@/lib/catalog-display";
import type { StoreSummary } from "@/lib/api/types";
import { useClientReady } from "@/lib/use-client-ready";

const CATEGORY_COLORS = [
  "oklch(0.32 0.04 150)",
  "oklch(0.30 0.06 55)",
  "oklch(0.28 0.05 200)",
  "oklch(0.30 0.05 25)",
  "oklch(0.28 0.04 280)",
  "oklch(0.30 0.05 340)",
];

const STATIC_CATEGORIES = [
  { id: "favourites", label: "Favourites", icon: <Heart className="h-6 w-6 text-rose-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[0]! },
  { id: "all", label: "Stores", icon: <Store className="h-6 w-6 text-emerald-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[1]! },
  { id: "groceries", label: "Groceries", icon: <ShoppingBasket className="h-6 w-6 text-lime-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[2]! },
  { id: "pharmacy", label: "Pharmacy", icon: <Pill className="h-6 w-6 text-sky-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[3]! },
  { id: "health", label: "Health & beauty", icon: <Sparkles className="h-6 w-6 text-violet-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[4]! },
  { id: "essentials", label: "Essentials", icon: <Stethoscope className="h-6 w-6 text-amber-400" strokeWidth={2.25} />, color: CATEGORY_COLORS[5]! },
  { id: "frozen", label: "Frozen", icon: <Snowflake className="h-6 w-6 text-sky-300" strokeWidth={2.25} />, color: CATEGORY_COLORS[2]! },
];

const MOBILE_CATEGORY_LIMIT = 4;

function discountLabel(store: { id: string; rating: number }, index: number): string | undefined {
  if (store.rating >= 4.5) return "Up to -10%";
  if (index % 3 === 0) return "-15%";
  if (index % 5 === 1) return "2 for 1";
  return undefined;
}

function splitItems<T>(items: T[], parts: number): T[][] {
  const result: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => result[i % parts]!.push(item));
  return result;
}

async function fetchHomeProducts(
  stores: StoreSummary[],
  categoryNameById: Map<string, string>,
): Promise<HomeProductCard[]> {
  const targets = stores.filter((s) => s.status === "OPEN");
  const list = targets.length > 0 ? targets : stores;
  if (list.length === 0) return [];

  const batches = await Promise.all(
    list.slice(0, 12).map(async (store) => {
      try {
        const products = await listStoreProducts(store.id, { status: "ACTIVE", limit: 12 });
        return products.map((product) =>
          toHomeProductFromApi(
            product,
            store,
            categoryNameById.get(product.categoryId) ?? "Groceries",
          ),
        );
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const merged: HomeProductCard[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export function CustomerHome() {
  const clientReady = useClientReady();
  const navigate = useNavigate();

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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsQueryError,
    refetch: refetchProducts,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: ["home-products", stores.map((s) => s.id).join(","), categories.map((c) => c.id).join(",")],
    queryFn: () => fetchHomeProducts(stores, categoryNameById),
    enabled: stores.length > 0,
  });

  const apiCategories = useMemo(
    () =>
      categories.slice(0, 4).map((c, i) => ({
        id: c.id,
        label: c.name,
        icon: categoryTypeIcon(c.type),
        color: CATEGORY_COLORS[(i + 2) % CATEGORY_COLORS.length]!,
      })),
    [categories],
  );

  const categoryItems = useMemo(
    () => (apiCategories.length > 0 ? [...STATIC_CATEGORIES.slice(0, 2), ...apiCategories] : STATIC_CATEGORIES),
    [apiCategories],
  );

  const homeCategories = useMemo(
    () => categoryItems.slice(0, MOBILE_CATEGORY_LIMIT),
    [categoryItems],
  );

  const storeList = useMemo(() => {
    const open = stores.filter((s) => s.status === "OPEN");
    return open.length > 0 ? open : stores;
  }, [stores]);

  const storeCoverById = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      if (!product.imageUrl || map.has(product.storeId)) continue;
      map.set(product.storeId, product.imageUrl);
    }
    return map;
  }, [products]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        const aDeal = a.compareAtPrice != null && a.compareAtPrice > a.price ? 1 : 0;
        const bDeal = b.compareAtPrice != null && b.compareAtPrice > b.price ? 1 : 0;
        return bDeal - aDeal || (b.storeRating ?? 0) - (a.storeRating ?? 0);
      }),
    [products],
  );

  const [exploreProducts, forYouProducts, spotlightProducts] = useMemo(
    () => splitItems(sortedProducts, 3),
    [sortedProducts],
  );

  const [exploreStores, forYouStores, spotlightStores] = useMemo(() => {
    const sorted = [...storeList].sort((a, b) => b.rating - a.rating);
    return splitItems(sorted, 3);
  }, [storeList]);

  const goShop = (search?: { categoryId?: string; storeId?: string }) => {
    navigate({ to: "/shop", search });
  };

  const loading = !clientReady || storesLoading || (stores.length > 0 && productsLoading);
  const hasContent = storeList.length > 0 || products.length > 0;
  const loadError = storesError || productsError;

  return (
    <CustomerAppShell activeTab="home" mainClassName="md:py-6">
      <div className="md:hidden">
        <CustomerCategoryRow
          categories={homeCategories}
          onSelect={(categoryId) => goShop({ categoryId })}
          compact
          fillWidth
        />
      </div>
      <div className="hidden md:block">
        <CustomerCategoryRow categories={categoryItems} onSelect={(categoryId) => goShop({ categoryId })} />
      </div>

      <div className="mt-5 space-y-8 md:mt-8 md:space-y-10">
        {loadError ? (
          <QueryErrorState
            error={storesQueryError ?? productsQueryError}
            title="Couldn't load marketplace"
            onRetry={() => {
              void refetchStores();
              void refetchProducts();
            }}
            retrying={(storesFetching && !storesLoading) || (productsFetching && !productsLoading)}
          />
        ) : (
          <AsyncState
            isLoading={loading}
            isError={false}
            loadingMessage="Loading products near you…"
            className="min-h-[12rem] justify-center"
          >
            {!hasContent ? (
              <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <p className="text-lg font-medium">No products available yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Stores are still stocking up. Check back soon or browse the full catalog.
                </p>
                <Link
                  to="/shop"
                  className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Browse shop
                </Link>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-10">
                <CustomerProductRow
                  title="Explore offers"
                  products={exploreProducts}
                  onViewAll={() => goShop()}
                />
                <CustomerProductRow
                  title="Offers just for you"
                  products={forYouProducts}
                  onViewAll={() => goShop()}
                />
                <CustomerStoreRow
                  title="Top-rated"
                  stores={forYouStores}
                  discountForStore={(store, i) => discountLabel(store, i + 1)}
                  coverForStore={(store) => storeCoverById.get(store.id)}
                  onViewAll={() => goShop()}
                />
                <CustomerProductRow
                  title="In the spotlight"
                  subtitle="Sponsored"
                  products={spotlightProducts}
                  onViewAll={() => goShop()}
                />

                {storeList.length > 0 && (
                  <>
                    <CustomerStoreRow
                      title="Popular stores"
                      stores={exploreStores}
                      discountForStore={(store, i) => discountLabel(store, i)}
                      coverForStore={(store) => storeCoverById.get(store.id)}
                      onViewAll={() => goShop()}
                    />
                    <CustomerStoreRow
                      title="More stores"
                      subtitle="Sponsored"
                      stores={spotlightStores}
                      discountForStore={(store) => (store.rating >= 4 ? "Featured" : undefined)}
                      coverForStore={(store) => storeCoverById.get(store.id)}
                      onViewAll={() => goShop()}
                    />
                  </>
                )}
              </div>
            )}
          </AsyncState>
        )}
      </div>
    </CustomerAppShell>
  );
}
