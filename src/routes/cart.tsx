import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { cn } from "@/lib/utils";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cart</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">Your basket</h1>
            <nav className="mt-4 flex flex-wrap gap-2" aria-label="Cart actions">
              {CART_NAV.map(({ to, label, icon: Icon, ...rest }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    "border-border bg-card hover:border-primary/40",
                  )}
                  activeOptions={"exact" in rest && rest.exact ? { exact: true } : undefined}
                  activeProps={{
                    className: "border-primary bg-primary text-primary-foreground",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Outlet />
        </section>
        <Footer />
      </div>
    </RequireCustomer>
  );
}
