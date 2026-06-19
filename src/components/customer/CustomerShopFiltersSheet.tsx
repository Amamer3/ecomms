import { useEffect, useState } from "react";
import { ArrowUpDown, Star, Tag, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DEFAULT_SHOP_FILTERS,
  SHOP_RATING_OPTIONS,
  SHOP_SORT_OPTIONS,
  type ShopFilters,
} from "@/lib/shop-filters";
import { cn } from "@/lib/utils";

type CustomerShopFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ShopFilters;
  onApply: (filters: ShopFilters) => void;
};

export function CustomerShopFiltersSheet({
  open,
  onOpenChange,
  value,
  onApply,
}: CustomerShopFiltersSheetProps) {
  const [draft, setDraft] = useState<ShopFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const handleReset = () => {
    setDraft(DEFAULT_SHOP_FILTERS);
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "flex h-[100dvh] max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0",
          "[&>button.absolute]:hidden",
        )}
      >
        <div className="relative border-b border-border/60 px-4 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary"
          >
            Reset
          </button>
          <SheetTitle className="text-center text-base font-semibold">Filters</SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </div>
            <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
              {SHOP_SORT_OPTIONS.map((option) => {
                const selected = draft.sort === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, sort: option.value }))}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-foreground"
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-primary" : "border-muted-foreground/50",
                        )}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </span>
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Tag className="h-4 w-4" />
              Offers
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Only show places with discounts or other offers
              </span>
              <Checkbox
                checked={draft.offersOnly}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, offersOnly: checked === true }))
                }
                className="mt-0.5"
              />
            </label>
          </section>

          <section className="mt-5 rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4" />
              Rating
            </div>
            <ul className="space-y-1">
              {SHOP_RATING_OPTIONS.map((option) => {
                const selected = draft.minRating === option.value;
                return (
                  <li key={option.label}>
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, minRating: option.value }))}
                      className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left text-sm text-foreground"
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-primary" : "border-muted-foreground/50",
                        )}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </span>
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="border-t border-border/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
