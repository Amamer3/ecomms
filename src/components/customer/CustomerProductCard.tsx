import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import type { HomeProductCard } from "@/lib/catalog-display";
import { formatGhs } from "@/lib/format-money";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

function productImageGradient(id: string): string {
  const hues = [145, 55, 25, 200, 280, 340];
  const hue = hues[id.charCodeAt(0) % hues.length];
  return `linear-gradient(135deg, oklch(0.45 0.12 ${hue}) 0%, oklch(0.32 0.08 ${hue + 30}) 100%)`;
}

function estimateDeliveryFee(prepMinutes = 30): number {
  return Math.round((8 + prepMinutes * 0.15) * 100) / 100;
}

function deliveryTimeLabel(prepMinutes = 30): string {
  const low = Math.max(15, prepMinutes);
  return `${low}–${low + 20} min`;
}

function discountLabel(price: number, compareAtPrice?: number | null): string | undefined {
  if (!compareAtPrice || compareAtPrice <= price) return undefined;
  const pct = Math.round((1 - price / compareAtPrice) * 100);
  return pct > 0 ? `-${pct}%` : undefined;
}

export function CustomerProductCard({
  product,
  layout = "carousel",
  className,
}: {
  product: HomeProductCard;
  layout?: "carousel" | "grid";
  className?: string;
}) {
  const { session } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const fee = estimateDeliveryFee(product.prepTimeMinutes);
  const badge = discountLabel(product.price, product.compareAtPrice);
  const outOfStock = product.status !== "ACTIVE" || product.stockQty <= 0;

  const ratingLabel =
    product.storeRating != null && product.storeRatingCount != null && product.storeRatingCount > 0
      ? `${product.storeRating.toFixed(1)} (${product.storeRatingCount > 500 ? "500+" : product.storeRatingCount})`
      : product.storeRating?.toFixed(1);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || session.role !== "customer") {
      toast("Sign in to add items");
      navigate({ to: "/login", search: { redirect: "/shop" } });
      return;
    }
    if (outOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    try {
      await add(product.id, product.storeId);
      toast.success("Added to basket");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add to cart"));
    }
  };

  return (
    <Link
      to="/catalog/products/$productId"
      params={{ productId: product.id }}
      className={cn(
        "group block",
        layout === "carousel" ? "w-[14.5rem] shrink-0 sm:w-[13rem]" : "w-full",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-3 text-center text-sm font-semibold text-white/90"
            style={{ background: productImageGradient(product.id) }}
          >
            {product.name}
          </div>
        )}

        {badge && !outOfStock && (
          <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
            {badge}
          </span>
        )}

        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            Sold out
          </span>
        )}

        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Add to favourites"
        >
          <Heart className="h-4 w-4" />
        </button>

        {ratingLabel && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {ratingLabel}
          </span>
        )}

        {!outOfStock && (
          <button
            type="button"
            onClick={(e) => void onAdd(e)}
            className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {formatGhs(fee)} · {deliveryTimeLabel(product.prepTimeMinutes)}
        </span>
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm font-bold text-foreground">{formatGhs(product.price)}</span>
        {product.compareAtPrice != null && product.compareAtPrice > product.price && (
          <span className="text-xs text-muted-foreground line-through">
            {formatGhs(product.compareAtPrice)}
          </span>
        )}
      </div>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{product.vendor}</p>
    </Link>
  );
}
