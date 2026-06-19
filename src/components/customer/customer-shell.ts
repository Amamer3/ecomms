export type CustomerNavTab = "home" | "stores" | "account";

export type CustomerBottomTab = "home" | "stores" | "search" | "orders" | "account";

export function inferCustomerNavTab(pathname: string): CustomerNavTab {
  if (pathname === "/account" || pathname.startsWith("/account/")) return "account";
  if (
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname === "/catalog" ||
    pathname.startsWith("/catalog/") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/")
  ) {
    return "stores";
  }
  return "home";
}

export function inferCustomerBottomTab(
  pathname: string,
  search?: Record<string, unknown>,
): CustomerBottomTab {
  if (pathname.startsWith("/account/orders")) return "orders";
  if (pathname === "/account" || pathname.startsWith("/account/")) return "account";
  if (
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname === "/catalog" ||
    pathname.startsWith("/catalog/") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/")
  ) {
    if (search?.view === "search") return "search";
    return "stores";
  }
  return "home";
}
