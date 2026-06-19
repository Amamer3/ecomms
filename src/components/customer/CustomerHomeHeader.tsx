import type { ReactNode, Ref } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CustomerStoreCard } from "@/components/customer/CustomerStoreCard";
import { CustomerProductCard } from "@/components/customer/CustomerProductCard";
import type { HomeProductCard } from "@/lib/catalog-display";
import type { StoreSummary } from "@/lib/api/types";
import {
  ChevronRight,
  Globe,
  MapPin,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState } from "react";
import { DeliveryAddressPicker } from "@/components/customer/DeliveryAddressPicker";
import { CustomerMobileMenu } from "@/components/customer/CustomerMobileMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";
import type { CustomerNavTab } from "@/components/customer/customer-shell";

type CustomerHomeHeaderProps = {
  locationLabel: string;
  activeTab?: CustomerNavTab;
  mobileBarRef?: Ref<HTMLElement>;
  desktopHeaderRef?: Ref<HTMLElement>;
  topOffset?: number;
};

export function CustomerHomeHeader({
  locationLabel,
  activeTab = "home",
  mobileBarRef,
  desktopHeaderRef,
  topOffset = 0,
}: CustomerHomeHeaderProps) {
  const { session } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  const runSearch = () => {
    navigate({ to: "/shop", search: { q: searchQ.trim() || undefined } });
  };

  return (
    <>
      {/* Mobile: fixed logo bar only */}
      <header
        ref={mobileBarRef}
        style={{ top: topOffset }}
        className="fixed inset-x-0 z-50 border-b border-border/60 bg-background/95 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden"
      >
        <div className="relative flex items-center justify-center py-1.5">
          <CustomerMobileMenu className="absolute left-0 top-1/2 -translate-y-1/2" />
          <Link to="/" className="py-0.5">
            <BrandLogo size="lg" className="mx-auto h-8 object-center" />
          </Link>
        </div>
      </header>

      {/* Desktop: full fixed header */}
      <header
        ref={desktopHeaderRef}
        style={{ top: topOffset }}
        className="fixed inset-x-0 z-50 hidden border-b border-border/60 bg-background/95 pt-[max(1rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:block sm:px-4 lg:px-6"
      >
        <div className="border-b border-border/40">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 text-sm font-medium text-muted-foreground lg:px-6">
            <button
              type="button"
              onClick={() => setAddressPickerOpen(true)}
              className="inline-flex max-w-[50%] min-h-9 items-center gap-2 truncate rounded-md px-1 py-1.5 text-left font-semibold text-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate leading-normal">{locationLabel}</span>
            </button>
            <div className="flex items-center gap-5">
              <Link to="/delivery" className="font-semibold transition-colors hover:text-foreground">
                Become a Courier
              </Link>
              <Link to="/vendors" className="font-semibold transition-colors hover:text-foreground">
                Become a Partner
              </Link>
              <span className="rounded-full bg-secondary px-3.5 py-1.5 text-sm font-semibold text-foreground/90">
                Get the app
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                English
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link to="/" className="shrink-0 py-0.5">
              <BrandLogo size="lg" className="h-9 sm:h-10" />
            </Link>

            <nav className="flex items-center gap-1.5" aria-label="Customer">
              <Link
                to="/"
                className={cn(
                  "rounded-full px-5 py-2.5 text-base font-semibold transition-colors",
                  activeTab === "home"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={cn(
                  "rounded-full px-5 py-2.5 text-base font-semibold transition-colors",
                  activeTab === "stores"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Stores
              </Link>
            </nav>

            <div className="mx-auto min-w-0 max-w-xl flex-1">
              <div className="flex w-full items-center gap-2.5 rounded-full bg-secondary px-5 py-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder="Food, restaurants, stores…"
                  className="w-full bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <Link
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-base font-semibold transition-colors hover:bg-secondary hover:text-foreground",
                  activeTab === "account"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                </span>
                <span className="hidden max-w-[140px] truncate lg:inline">{session?.name ?? "Account"}</span>
              </Link>
            </div>
          </div>
        </div>

      <DeliveryAddressPicker open={addressPickerOpen} onOpenChange={setAddressPickerOpen} />
    </header>
    </>
  );
}

const CAROUSEL_SCROLL_CLS =
  "-mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 touch-pan-x [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden";

export function CustomerCategoryRow({
  categories,
  onSelect,
  compact = false,
  fillWidth = false,
}: {
  categories: { id: string; label: string; icon: ReactNode; color: string }[];
  onSelect: (categoryId?: string) => void;
  compact?: boolean;
  fillWidth?: boolean;
}) {
  const spread = fillWidth && categories.length > 0;

  return (
    <div className="relative">
      <div
        className={cn(
          spread
            ? "grid gap-2 pb-2"
            : cn(CAROUSEL_SCROLL_CLS, compact ? "gap-5" : "gap-4"),
        )}
        style={
          spread
            ? { gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id === "all" ? undefined : cat.id)}
            className={cn(
              "flex flex-col items-center gap-2",
              spread ? "min-w-0 w-full px-1" : cn("shrink-0", compact ? "w-[4.75rem]" : "w-[4.5rem] sm:w-[5rem]"),
            )}
          >
            <span
              className={cn(
                "grid place-items-center rounded-full text-xl",
                spread
                  ? "aspect-square w-full max-w-[4.75rem]"
                  : compact
                    ? "h-16 w-16"
                    : "h-14 w-14 sm:h-16 sm:w-16",
              )}
              style={{ backgroundColor: cat.color }}
            >
              {cat.icon}
            </span>
            <span
              className={cn(
                "w-full text-center text-[11px] font-semibold leading-tight text-foreground",
                spread ? "text-xs sm:text-[11px]" : compact ? "" : "text-muted-foreground sm:text-xs",
              )}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CustomerStoreRow({
  title,
  subtitle,
  stores,
  discountForStore,
  coverForStore,
  onViewAll,
}: {
  title: string;
  subtitle?: string;
  stores: StoreSummary[];
  discountForStore?: (store: StoreSummary, index: number) => string | undefined;
  coverForStore?: (store: StoreSummary) => string | undefined;
  onViewAll?: () => void;
}) {
  if (stores.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className={CAROUSEL_SCROLL_CLS}>
        {stores.map((store, i) => (
          <CustomerStoreCard
            key={store.id}
            store={store}
            discountLabel={discountForStore?.(store, i)}
            coverUrl={coverForStore?.(store)}
          />
        ))}
      </div>
    </section>
  );
}

export function CustomerProductRow({
  title,
  subtitle,
  products,
  onViewAll,
}: {
  title: string;
  subtitle?: string;
  products: HomeProductCard[];
  onViewAll?: () => void;
}) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className={CAROUSEL_SCROLL_CLS}>
        {products.map((product) => (
          <CustomerProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
