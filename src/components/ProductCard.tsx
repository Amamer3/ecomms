import { Plus } from "lucide-react";
import { formatGhs } from "@/lib/format-money";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/cart";

const tagStyles: Record<NonNullable<Product["tag"]>, string> = {
  Fresh: "bg-primary/10 text-primary",
  Organic: "bg-primary/15 text-primary",
  Frozen: "bg-sky-500/10 text-sky-700",
  Bestseller: "bg-accent/20 text-accent-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)]">
        <div className="absolute inset-0 grid place-items-center text-7xl transition-transform duration-500 group-hover:scale-110">
          <span aria-hidden>{product.emoji}</span>
        </div>
        {product.tag && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagStyles[product.tag]}`}>
            {product.tag}
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
            onClick={() => add(product)}
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
