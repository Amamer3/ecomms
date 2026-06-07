import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { parseMoney } from "@/lib/api/client";
import { customerInputCls, CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/cart/items/$itemId")({
  component: CartItemPage,
});

function CartItemPage() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const { items, setQty, remove } = useCart();
  const line = items.find((l) => l.item.id === itemId);
  const [qty, setQtyInput] = useState(line?.item.qty ? String(line.item.qty) : "1");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!line) {
    return (
      <p className="text-sm text-muted-foreground">
        Item not in cart.{" "}
        <Link to="/cart" className="text-primary hover:underline">
          View cart
        </Link>
      </p>
    );
  }

  const { item } = line;

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(qty, 10);
    if (Number.isNaN(quantity) || quantity < 1) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSubmitting(true);
    try {
      await setQty(itemId, quantity);
      toast.success("Quantity updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async () => {
    setRemoving(true);
    try {
      await remove(itemId);
      toast.success("Item removed");
      navigate({ to: "/cart" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-md">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <CustomerPageHeader
        title={item.name}
        description="Update quantity or remove this line item."
      />

      <dl className="mb-6 space-y-2 rounded-xl border border-border/60 bg-card p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Unit price</dt>
          <dd>{formatGhs(parseMoney(item.unitPriceSnapshot))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Line total</dt>
          <dd className="font-semibold">{formatGhs(parseMoney(item.lineTotal))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Stock</dt>
          <dd>{item.stockQty}</dd>
        </div>
      </dl>

      <form onSubmit={(e) => void onUpdate(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Quantity</span>
          <input
            type="number"
            min={1}
            className={customerInputCls}
            value={qty}
            onChange={(e) => setQtyInput(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update quantity"}
        </button>
        <button
          type="button"
          disabled={removing}
          onClick={() => void onRemove()}
          className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
        >
          {removing ? "Removing…" : "Remove item"}
        </button>
      </form>
    </div>
  );
}
