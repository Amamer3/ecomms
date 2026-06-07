import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FolderTree, Package, Store } from "lucide-react";

export const Route = createFileRoute("/catalog/")({
  component: CatalogHome,
  head: () => ({ meta: [{ title: "Catalog — GoMarket" }] }),
});

function CatalogHome() {
  const links = [
    {
      to: "/catalog/categories",
      label: "Categories",
      icon: FolderTree,
      description: "Marketplace product categories and types.",
    },
    {
      to: "/catalog/stores",
      label: "Stores",
      icon: Store,
      description: "Open stores you can shop from.",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {links.map(({ to, label, icon: Icon, description }) => (
        <Link
          key={to}
          to={to}
          className="group rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
      <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-6 sm:col-span-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-5 w-5" />
          <p className="text-sm">Open any product from a store page to view full details.</p>
        </div>
      </div>
    </div>
  );
}
