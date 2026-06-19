import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { FolderTree, Package, Store } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CustomerPillNav, CustomerSectionHeader } from "@/components/customer/CustomerPageChrome";
import { StorefrontPage } from "@/components/customer/StorefrontPage";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";

export const Route = createFileRoute("/catalog")({
  component: CatalogLayout,
});

const NAV = [
  { to: "/catalog/categories", label: "Categories", icon: FolderTree },
  { to: "/catalog/stores", label: "Stores", icon: Store },
] as const;

function CatalogLayout() {
  const isCustomerApp = useIsCustomerApp();

  const guestHero = (
    <PageHero innerClassName="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Catalog</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Browse the marketplace</h1>
      </div>
      <CustomerPillNav items={NAV} />
    </PageHero>
  );

  return (
    <StorefrontPage activeTab="stores" guestHero={guestHero} mainClassName={isCustomerApp ? "py-6" : undefined}>
      {isCustomerApp && (
        <>
          <CustomerSectionHeader
            eyebrow="Catalog"
            title="Browse the marketplace"
            description="Explore categories and stores near you."
          />
          <CustomerPillNav items={NAV} />
        </>
      )}
      <Outlet />
    </StorefrontPage>
  );
}
