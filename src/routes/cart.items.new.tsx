import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { customerInputCls, CustomerPageHeader } from "@/components/customer/customer-ui";
import { loadSelectedStoreId } from "@/lib/catalog-display";

export const Route = createFileRoute("/cart/items/new")({
  component: CartAddItemPage,
  head: () => ({ meta: [{ title: "Add to cart — GoMarket" }] }),
});

function CartAddItemPage() {
  const navigate = useNavigate();
  const { add, storeId } = useCart();
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const activeStoreId = storeId ?? loadSelectedStoreId();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(qty, 10);
    if (!productId.trim() || Number.isNaN(quantity) || quantity < 1) {
      toast.error("Enter a product ID and quantity");
      return;
    }
    setSubmitting(true);
    try {
      if (!activeStoreId) {
        toast.error("Enter a store ID or add items from the shop");
        return;
      }
      await add(productId.trim(), activeStoreId, quantity);
      toast.success("Item added");
      navigate({ to: "/cart" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add item");
    } finally {
      setSubmitting(false);
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
        title="Add cart item"
        description="Add or replace a product quantity in your active store cart."
      />

      {!activeStoreId ? (
        <p className="text-sm text-muted-foreground">
          Select a store on the{" "}
          <Link to="/shop" className="font-medium text-primary hover:underline">
            shop page
          </Link>{" "}
          first.
        </p>
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
        >
          <p className="text-xs text-muted-foreground">Store: {activeStoreId}</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Product ID</span>
            <input
              className={customerInputCls}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Product UUID"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Quantity</span>
            <input
              type="number"
              min={1}
              className={customerInputCls}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add to cart"}
          </button>
        </form>
      )}
    </div>
  );
}
