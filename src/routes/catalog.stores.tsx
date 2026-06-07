import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Star } from "lucide-react";
import { listStores } from "@/lib/api";
import { storeLabel } from "@/lib/catalog-display";
import { CatalogPageHeader } from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/catalog/stores")({
  component: CatalogStoresPage,
  head: () => ({ meta: [{ title: "Stores — GoMarket" }] }),
});

function CatalogStoresPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", q, city],
    queryFn: () =>
      listStores({
        q: q || undefined,
        city: city || undefined,
        limit: 50,
      }),
  });

  return (
    <div>
      <CatalogPageHeader
        title="Open stores"
        description="Browse vendors currently accepting orders in your area."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stores…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City filter"
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm sm:w-48"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading stores…</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open stores found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              to="/catalog/stores/$storeId"
              params={{ storeId: store.id }}
              className="rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
            >
              <h2 className="font-semibold">{storeLabel(store)}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {store.description ?? store.addressLine ?? "Local marketplace store"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  {store.rating.toFixed(1)} ({store.ratingCount})
                </span>
                <span>{store.productCount ?? 0} products</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
