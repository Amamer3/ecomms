import type { Address } from "@/lib/api/types";

export const SELECTED_DELIVERY_ADDRESS_KEY = "randys_selected_delivery_address_id";

export function loadSelectedDeliveryAddressId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(SELECTED_DELIVERY_ADDRESS_KEY);
}

export function saveSelectedDeliveryAddressId(id: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SELECTED_DELIVERY_ADDRESS_KEY, id);
  window.dispatchEvent(new Event("delivery-address-changed"));
}

export function resolveActiveAddress(
  addresses: Address[],
  selectedId: string | null,
): Address | undefined {
  if (selectedId) {
    const found = addresses.find((a) => a.id === selectedId);
    if (found) return found;
  }
  return addresses.find((a) => a.isDefault) ?? addresses[0];
}

export function formatDeliveryLocationLabel(address: Address | undefined): string {
  if (!address?.line1) return "Set your delivery address";
  const city = address.city ? `, ${address.city}` : "";
  return `${address.line1}${city}`;
}

export function formatDeliveryLocationParts(address: Address | undefined): {
  primary: string;
  secondary?: string;
} {
  if (!address?.line1) {
    return { primary: "Set your delivery address" };
  }
  return {
    primary: formatAddressPrimary(address),
    secondary: address.city || undefined,
  };
}

export function formatAddressPrimary(address: Address): string {
  return address.label?.trim() || address.line1;
}

export function formatAddressSecondary(address: Address): string {
  const parts: string[] = [];
  if (address.label?.trim()) parts.push(address.line1);
  if (address.city) parts.push(address.city);
  if (address.region) parts.push(address.region);
  if (address.landmark) parts.push(address.landmark);
  return parts.join(", ") || address.country;
}

export function addressMatchesQuery(address: Address, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    address.label,
    address.line1,
    address.line2,
    address.city,
    address.region,
    address.landmark,
    address.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
