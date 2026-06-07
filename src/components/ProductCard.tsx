import { Plus } from "lucide-react";
import { formatGhs } from "@/lib/format-money";
import type { ShopProduct } from "@/lib/catalog-display";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ShopProduct }) {
  const { session } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const onAdd = async () => {
    if (!session || session.role !== "customer") {
      toast("Sign in to add items");
      navigate({ to: "/login", search: { redirect: "/shop" } });
      return;
    }
    if (product.status !== "ACTIVE" || product.stockQty <= 0) {
      toast.error("This item is out of stock");
      return;
    }
    try {
      await add(product.id);
      toast.success("Added to basket");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add to cart");
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-5xl text-muted-foreground/40">🛒</div>
        )}
        {product.status === "OUT_OF_STOCK" && (
          <span className="absolute left-3 top-3 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs text-muted-foreground">{product.vendor}</p>
        <h3 className="mt-0.5 text-base font-semibold leading-tight text-foreground">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-foreground">{formatGhs(product.price)}</p>
            <p className="text-xs text-muted-foreground">{product.unit}</p>
          </div>
          <button
            onClick={() => void onAdd()}
            aria-label={`Add ${product.name} to cart`}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-105 hover:shadow-[var(--shadow-glow)] active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
