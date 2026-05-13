import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/cart";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Randy's Commerce" }] }),
});

const DELIVERY = 3.5;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const total = subtotal + (items.length ? DELIVERY : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => clear(), 600);
  };

  if (done) {
    return (
      <RequireCustomer>
        <div className="min-h-screen bg-background">
          <Navbar />
          <section className="mx-auto grid max-w-2xl place-items-center px-4 py-24 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold">Order placed!</h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Thanks for shopping with Randy's. Your order is being prepared and will arrive in
              about 45 minutes.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                to="/shop"
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
              >
                Keep shopping
              </Link>
              <button
                onClick={() => navigate({ to: "/" })}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Back to home
              </button>
            </div>
          </section>
          <Footer />
        </div>
      </RequireCustomer>
    );
  }

  return (
    <RequireCustomer>
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold">Checkout</h1>
          <p className="mt-1 text-muted-foreground">Almost there — just a few details.</p>

          <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <Section title="Delivery details">
                <Field label="Full name" required placeholder="Jane Doe" />
                <Field label="Phone" required placeholder="+233 ..." />
                <Field label="Address" required placeholder="123 Independence Ave" full />
                <Field label="City" required placeholder="Accra" />
                <Field label="Notes (optional)" placeholder="Gate code, leave at door…" full />
              </Section>

              <Section title="Payment">
                <Field label="Card number" required placeholder="4242 4242 4242 4242" full />
                <Field label="Expiry" required placeholder="MM / YY" />
                <Field label="CVC" required placeholder="123" />
                <p className="col-span-full inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Demo checkout — no real charges.
                </p>
              </Section>
            </div>

            <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold">Order</h2>
              <ul className="mt-4 max-h-72 space-y-3 overflow-auto pr-1 text-sm">
                {items.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{product.emoji}</span>
                      <span>
                        <span className="block font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">× {qty}</span>
                      </span>
                    </span>
                    <span className="font-medium">{formatGhs(product.price * qty)}</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <p className="text-muted-foreground">Your basket is empty.</p>
                )}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatGhs(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{formatGhs(DELIVERY)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatGhs(total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={items.length === 0}
                className="mt-6 w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                Place order
              </button>
            </aside>
          </form>
        </section>
        <Footer />
      </div>
    </RequireCustomer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  full,
  ...rest
}: { label: string; full?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <input
        {...rest}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
