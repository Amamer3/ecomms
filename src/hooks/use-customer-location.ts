import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { listAddresses } from "@/lib/api";
import {
  formatDeliveryLocationLabel,
  loadSelectedDeliveryAddressId,
  resolveActiveAddress,
  saveSelectedDeliveryAddressId,
} from "@/lib/delivery-address";
import { useAuth } from "@/context/auth";

function subscribeToSelectedAddress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("delivery-address-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("delivery-address-changed", callback);
  };
}

export function useCustomerDeliveryAddress() {
  const { session } = useAuth();
  const selectedId = useSyncExternalStore(
    subscribeToSelectedAddress,
    loadSelectedDeliveryAddressId,
    () => null,
  );

  const { data: addresses = [], isLoading, refetch } = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: listAddresses,
    enabled: Boolean(session),
  });

  const activeAddress = useMemo(
    () => resolveActiveAddress(addresses, selectedId),
    [addresses, selectedId],
  );

  const locationLabel = useMemo(
    () => formatDeliveryLocationLabel(activeAddress),
    [activeAddress],
  );

  const setSelectedAddress = useCallback((id: string) => {
    saveSelectedDeliveryAddressId(id);
  }, []);

  return {
    addresses,
    activeAddress,
    selectedId: activeAddress?.id ?? null,
    locationLabel,
    isLoading,
    setSelectedAddress,
    refetch,
  };
}

export function useCustomerLocationLabel(): string {
  return useCustomerDeliveryAddress().locationLabel;
}
