import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/cart";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your cart — Randy's Commerce" }] }),
});

const DELIVERY = 3.5;
const FREE_DELIVERY_OVER_GHS = 200;

function CartPage() {
  const { items, setQty, remove, subtotal, count } = useCart();
  const total = subtotal + (items.length ? DELIVERY : 0);

  return (
    <RequireCustomer>
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold">Your basket</h1>
          <p className="mt-1 text-muted-foreground">
            {count} item{count === 1 ? "" : "s"} ready to go.
          </p>

          {items.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <p className="mt-4 text-lg font-medium">Your basket is empty.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover fresh picks and weekly essentials.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Start shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
              <ul className="space-y-3">
                {items.map(({ product, qty }) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-4xl">
                      {product.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{product.vendor}</p>
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatGhs(product.price)} {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{qty}</span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="hidden w-20 text-right font-semibold sm:block">
                      {formatGhs(product.price * qty)}
                    </p>
                    <button
                      onClick={() => remove(product.id)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
                <h2 className="font-display text-xl font-semibold">Order summary</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Subtotal" value={formatGhs(subtotal)} />
                  <Row label="Delivery" value={formatGhs(DELIVERY)} />
                  <div className="border-t border-border pt-3">
                    <Row
                      label={<span className="text-base font-semibold">Total</span>}
                      value={<span className="text-base font-semibold">{formatGhs(total)}</span>}
                    />
                  </div>
                </dl>
                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Free delivery on orders over {formatGhs(FREE_DELIVERY_OVER_GHS)}.
                </p>
              </aside>
            </div>
          )}
        </section>
        <Footer />
      </div>
    </RequireCustomer>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
