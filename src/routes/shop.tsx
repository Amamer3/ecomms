import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, type Category } from "@/lib/products";
import { z } from "zod";

const search = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  component: Shop,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop fresh groceries & essentials — Randy's Commerce" },
      { name: "description", content: "Browse perishable, frozen, pantry, and household goods from local vendors." },
    ],
  }),
});

function Shop() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const active: Category | "All" = category ? (category as Category) : "All";

  const filtered = products.filter((p) => {
    const cMatch = active === "All" || p.category === active;
    const qMatch = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.vendor.toLowerCase().includes(q.toLowerCase());
    return cMatch && qMatch;
  });

  const setCat = (c: string | undefined) => navigate({ search: c ? { category: c } : {} });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {active === "All" ? "Everything in store" : active}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filtered.length} item{filtered.length === 1 ? "" : "s"} from trusted local vendors.
          </p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-[var(--shadow-soft)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products or vendors…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <Pill active={active === "All"} onClick={() => setCat(undefined)} label="All" />
          {categories.map((c) => (
            <Pill
              key={c.name}
              active={active === c.name}
              onClick={() => setCat(c.name)}
              label={`${c.emoji} ${c.name}`}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-lg font-medium">Nothing matched your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different category or keyword.</p>
            <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

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
