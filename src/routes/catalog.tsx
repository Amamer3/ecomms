import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { FolderTree, Package, Store } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  component: CatalogLayout,
});

const NAV = [
  { to: "/catalog/categories", label: "Categories", icon: FolderTree },
  { to: "/catalog/stores", label: "Stores", icon: Store },
] as const;

function CatalogLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar overlay />
      <PageHero innerClassName="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Catalog</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Browse the marketplace</h1>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Catalog sections">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                "border-border bg-card hover:border-primary/40",
              )}
              activeProps={{
                className: "border-primary bg-primary text-primary-foreground",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </PageHero>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
