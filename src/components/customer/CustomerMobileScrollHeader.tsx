import { useNavigate, useRouterState } from "@tanstack/react-router";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { DeliveryAddressPicker } from "@/components/customer/DeliveryAddressPicker";
import { CustomerShopFiltersSheet } from "@/components/customer/CustomerShopFiltersSheet";
import { useCustomerDeliveryAddress } from "@/hooks/use-customer-location";
import { formatDeliveryLocationParts } from "@/lib/delivery-address";
import { selectPathname } from "@/lib/router-pathname";
import {
  hasActiveShopFilters,
  shopFiltersFromSearch,
  shopFiltersToSearch,
  type ShopFilters,
} from "@/lib/shop-filters";
import { cn } from "@/lib/utils";

/** Location + search block that scrolls with page content on mobile. */
export function CustomerMobileScrollHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: selectPathname });
  const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
  const { activeAddress } = useCustomerDeliveryAddress();
  const locationParts = useMemo(
    () => formatDeliveryLocationParts(activeAddress),
    [activeAddress],
  );
  const activeFilters = useMemo(() => shopFiltersFromSearch(search), [search]);
  const filtersActive = hasActiveShopFilters(activeFilters);

  const [searchQ, setSearchQ] = useState(() =>
    typeof search.q === "string" ? search.q : "",
  );
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const runSearch = () => {
    navigate({
      to: "/shop",
      search: {
        ...search,
        q: searchQ.trim() || undefined,
        view: undefined,
      },
    });
  };

  const handleApplyFilters = (filters: ShopFilters) => {
    navigate({
      to: "/shop",
      search: shopFiltersToSearch(filters, {
        ...search,
        q: searchQ.trim() || undefined,
        view: undefined,
      }),
    });
  };

  return (
    <div className="border-b border-border/40 pb-3 md:hidden">
      <button
        type="button"
        onClick={() => setAddressPickerOpen(true)}
        className="flex w-full items-start gap-2.5 px-0.5 py-2 text-left"
      >
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
        <span className="min-w-0">
            <span className="block truncate text-base font-semibold leading-tight text-foreground">
              {locationParts.primary}
            </span>
            {locationParts.secondary && (
              <span className="mt-0.5 block truncate text-sm font-medium text-muted-foreground">
              {locationParts.secondary}
            </span>
          )}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-secondary px-3.5 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:text-foreground",
            filtersActive && "text-primary",
          )}
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtersActive && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      <DeliveryAddressPicker open={addressPickerOpen} onOpenChange={setAddressPickerOpen} />
      <CustomerShopFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={pathname === "/shop" ? activeFilters : shopFiltersFromSearch({})}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
