import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart";
import { parseMoney } from "@/lib/api/client";
import { formatGhs } from "@/lib/format-money";
import { QueryErrorState } from "@/components/QueryErrorState";
import { CustomerPageHeader } from "@/components/customer/customer-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/cart/")({
  component: CartViewPage,
  head: () => ({ meta: [{ title: "Your cart — GoMarket" }] }),
});

function CartViewPage() {
  const { items, setQty, remove, subtotal, count, loading, error, storeId, clear, cart, refresh } =
    useCart();

  const onClear = async () => {
    await clear();
    toast.success("Cart cleared");
  };

  if (!storeId) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Add items from the shop to start your basket.</p>
        <Link
          to="/shop"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse stores
        </Link>
      </div>
    );
  }

  return (
    <div>
      <CustomerPageHeader
        title="Active cart"
        description={`Store cart ${cart?.id?.slice(0, 8) ?? ""} · status ${cart?.status ?? "—"}`}
      />

      {error ? (
        <QueryErrorState
          error={error}
          title="Couldn't load your cart"
          onRetry={refresh}
          retrying={loading}
          className="mb-6"
        />
      ) : null}

      <p className="mb-6 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${count} item${count === 1 ? "" : "s"}`}
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => void onClear()}
            className="ml-4 text-xs font-medium text-destructive hover:underline"
          >
            Clear cart
          </button>
        )}
      </p>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-medium">Your basket is empty.</p>
          <Link
            to="/shop"
            search={{ storeId }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-3">
            {items.map(({ item }) => (
              <li
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card p-3 shadow-[var(--shadow-soft)] sm:p-4"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-2xl sm:h-20 sm:w-20 sm:text-3xl">
                    🛒
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/cart/items/$itemId"
                      params={{ itemId: item.id }}
                      className="line-clamp-2 font-semibold text-primary hover:underline sm:truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatGhs(parseMoney(item.unitPriceSnapshot))} {item.unit}
                    </p>
                    <p className="mt-1 font-semibold sm:hidden">
                      {formatGhs(parseMoney(item.lineTotal))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/50 pt-3 sm:mt-0 sm:border-0 sm:pt-0">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => void setQty(item.id, item.qty - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                      aria-label="Decrease"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => void setQty(item.id, item.qty + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                      aria-label="Increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="hidden font-semibold sm:block">
                    {formatGhs(parseMoney(item.lineTotal))}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatGhs(subtotal)}</dd>
              </div>
              <p className="text-xs text-muted-foreground">Delivery & fees calculated at checkout.</p>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
