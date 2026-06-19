import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, MapPin, Search, X } from "lucide-react";
import { toast } from "sonner";
import { DeliveryMapPicker } from "@/components/customer/DeliveryMapPicker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomerDeliveryAddress } from "@/hooks/use-customer-location";
import { createAddress } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import {
  addressMatchesQuery,
  formatAddressPrimary,
  formatAddressSecondary,
} from "@/lib/delivery-address";
import { ACCRA_CENTER, distanceMeters, type GeocodedPlace } from "@/lib/geocoding";
import { cn } from "@/lib/utils";

type DeliveryAddressPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PickerView = "list" | "map";

export function DeliveryAddressPicker({ open, onOpenChange }: DeliveryAddressPickerProps) {
  const queryClient = useQueryClient();
  const { addresses, activeAddress, selectedId, isLoading, setSelectedAddress } =
    useCustomerDeliveryAddress();
  const [view, setView] = useState<PickerView>("list");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [savingMapAddress, setSavingMapAddress] = useState(false);

  const filteredAddresses = useMemo(
    () => addresses.filter((address) => addressMatchesQuery(address, search)),
    [addresses, search],
  );

  const mapInitialCenter = useMemo(() => {
    if (activeAddress) {
      return { lat: activeAddress.lat, lng: activeAddress.lng };
    }
    return ACCRA_CENTER;
  }, [activeAddress]);

  const showSearchActions = searchFocused || search.length > 0;

  const resetPicker = () => {
    setSearch("");
    setSearchFocused(false);
    setView("list");
    setSavingMapAddress(false);
  };

  const handleSelect = (id: string) => {
    setSelectedAddress(id);
    onOpenChange(false);
    resetPicker();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetPicker();
    onOpenChange(next);
  };

  const handleMapConfirm = async (place: GeocodedPlace & { lat: number; lng: number }) => {
    const nearby = addresses.find(
      (address) => distanceMeters(address.lat, address.lng, place.lat, place.lng) < 50,
    );
    if (nearby) {
      setSelectedAddress(nearby.id);
      toast.success("Delivery address updated");
      handleOpenChange(false);
      return;
    }

    setSavingMapAddress(true);
    try {
      const created = await createAddress({
        line1: place.line1,
        city: place.city,
        region: place.region,
        country: place.country,
        lat: place.lat,
        lng: place.lng,
        isDefault: addresses.length === 0,
      });
      await queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
      setSelectedAddress(created.id);
      toast.success("Delivery address saved");
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not save this address");
    } finally {
      setSavingMapAddress(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border-border/80 bg-background p-0 shadow-2xl",
          view === "map"
            ? "max-h-[min(92vh,760px)] max-w-lg"
            : "max-h-[min(90vh,720px)] max-w-md",
          "[&>button.absolute]:hidden",
        )}
      >
        {view === "map" ? (
          <DeliveryMapPicker
            initialCenter={mapInitialCenter}
            onBack={() => setView("list")}
            onConfirm={handleMapConfirm}
            confirming={savingMapAddress}
          />
        ) : (
          <>
            <div className="relative border-b border-border/60 px-4 pb-4 pt-5 sm:px-5">
              <DialogTitle className="text-center text-base font-semibold text-foreground">
                Delivery address
              </DialogTitle>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mt-4 flex items-center gap-2">
                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-secondary/60 px-3 py-2.5 transition-colors",
                    searchFocused ? "border-primary" : "border-border/60",
                  )}
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Enter a new address"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {showSearchActions && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchFocused(false);
                    }}
                    className="shrink-0 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setView("map")}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md border border-border/60 bg-secondary/50">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                Choose on map
              </button>
            </div>

            <div className="max-h-[min(52vh,420px)] overflow-y-auto">
              {isLoading ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading addresses…
                </p>
              ) : filteredAddresses.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {search.trim()
                      ? "No addresses match your search."
                      : "You have no saved delivery addresses yet."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("map")}
                    className="mt-3 inline-flex text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Pick a location on the map
                  </button>
                  <span className="mx-2 text-muted-foreground">or</span>
                  <Link
                    to="/account/addresses"
                    onClick={() => handleOpenChange(false)}
                    className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
                  >
                    add an address manually
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {filteredAddresses.map((address) => {
                    const isSelected = address.id === selectedId;
                    return (
                      <li key={address.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(address.id)}
                          className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/40 sm:px-5"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {formatAddressPrimary(address)}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {formatAddressSecondary(address)}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
