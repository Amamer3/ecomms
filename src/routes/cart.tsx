import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { RequireCustomer } from "@/components/RequireCustomer";
import { CustomerPillNav, CustomerSectionHeader } from "@/components/customer/CustomerPageChrome";
import { StorefrontPage } from "@/components/customer/StorefrontPage";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";

export const Route = createFileRoute("/cart")({
  component: CartLayout,
});

const CART_NAV = [
  { to: "/cart", label: "View cart", icon: ShoppingBag, exact: true },
  { to: "/cart/items/new", label: "Add item", icon: Plus },
] as const;

function CartLayout() {
  return (
    <RequireCustomer>
      <CartLayoutInner />
    </RequireCustomer>
  );
}

function CartLayoutInner() {
  const isCustomerApp = useIsCustomerApp();

  const guestHero = (
    <PageHero>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cart</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your basket</h1>
      <CustomerPillNav items={CART_NAV} />
    </PageHero>
  );

  return (
    <StorefrontPage activeTab="stores" guestHero={guestHero} mainClassName={isCustomerApp ? "py-6" : undefined}>
      {isCustomerApp && (
        <>
          <CustomerSectionHeader eyebrow="Cart" title="Your basket" />
          <CustomerPillNav items={CART_NAV} />
        </>
      )}
      <Outlet />
    </StorefrontPage>
  );
}
