import { Link } from "@tanstack/react-router";
import { Bike, Heart, Star } from "lucide-react";
import type { StoreSummary } from "@/lib/api/types";
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

type CustomerStoreCardProps = {
  store: StoreSummary;
  discountLabel?: string;
  deliveryFee?: number;
  coverUrl?: string;
  className?: string;
};

function estimateDeliveryFee(store: StoreSummary): number {
  return Math.round((8 + store.prepTimeMinutes * 0.15) * 100) / 100;
}

function deliveryTimeLabel(prepMinutes: number): string {
  const low = Math.max(15, prepMinutes);
  const high = low + 20;
  return `${low}–${high} min`;
}

function storeImageGradient(id: string): string {
  const hues = [145, 55, 25, 200, 280, 340];
  const hue = hues[id.charCodeAt(0) % hues.length];
  return `linear-gradient(135deg, oklch(0.45 0.12 ${hue}) 0%, oklch(0.32 0.08 ${hue + 30}) 100%)`;
}

export function CustomerStoreCard({
  store,
  discountLabel,
  deliveryFee,
  coverUrl,
  className,
}: CustomerStoreCardProps) {
  const fee = deliveryFee ?? estimateDeliveryFee(store);
  const ratingLabel =
    store.ratingCount > 0
      ? `${store.rating.toFixed(1)} (${store.ratingCount > 500 ? "500+" : store.ratingCount})`
      : store.rating.toFixed(1);

  return (
    <Link
      to="/shop"
      search={{ storeId: store.id }}
      className={cn("group block w-[14.5rem] shrink-0 sm:w-[13rem]", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {coverUrl || store.logoUrl ? (
          <img
            src={coverUrl ?? store.logoUrl!}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-4xl font-bold text-white/90"
            style={{ background: storeImageGradient(store.id) }}
          >
            {store.name.charAt(0)}
          </div>
        )}

        {discountLabel && (
          <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
            {discountLabel}
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

        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {ratingLabel}
        </span>
      </div>

      <h3 className="mt-2.5 truncate text-sm font-semibold text-foreground">{store.name}</h3>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Bike className="h-3.5 w-3.5 shrink-0" />
        <span>
          {formatGhs(fee)} · {deliveryTimeLabel(store.prepTimeMinutes)}
        </span>
      </p>
    </Link>
  );
}
