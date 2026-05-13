/**
 * Four user personas (stored `role` on {@link AuthSession}):
 * - `customer` — storefront (Customer)
 * - `vendor` — merchant tools (Vendor)
 * - `delivery` — courier tools at `/dashboard/delivery` (Courier); kept as `delivery` for URLs & persisted sessions
 * - `admin` — platform tools (Admin)
 */
export type DashboardRole = "admin" | "vendor" | "delivery";

/** Customer role plus staff dashboard roles. */
export type UserRole = DashboardRole | "customer";

export type AuthSession = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export const AUTH_STORAGE_KEY = "randys_auth_session";

export function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<AuthSession>;
    if (!p || typeof p.id !== "string" || typeof p.role !== "string") return null;
    if (p.role !== "admin" && p.role !== "vendor" && p.role !== "delivery" && p.role !== "customer")
      return null;
    return {
      id: p.id,
      email: typeof p.email === "string" ? p.email : "",
      name: typeof p.name === "string" ? p.name : "",
      role: p.role as UserRole,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function loadSessionFromStorage(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(localStorage.getItem(AUTH_STORAGE_KEY));
}

export function saveSessionToStorage(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearSessionFromStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/** Product-facing name for each stored role (Customer, Courier, Vendor, Admin). */
export function roleLabel(role: UserRole): string {
  switch (role) {
    case "customer":
      return "Customer";
    case "vendor":
      return "Vendor";
    case "delivery":
      return "Courier";
    case "admin":
      return "Admin";
  }
}

export function dashboardPathForRole(
  role: DashboardRole,
): "/dashboard/admin" | "/dashboard/vendor" | "/dashboard/delivery" {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "vendor":
      return "/dashboard/vendor";
    case "delivery":
      return "/dashboard/delivery";
  }
}

/** Navbar / “home” after sign-in: shop for customers, dashboard for staff. */
export function appHomePathForRole(role: UserRole): string {
  if (role === "customer") return "/shop";
  return dashboardPathForRole(role);
}

function pathRole(path: string): DashboardRole | null {
  if (path === "/dashboard/admin") return "admin";
  if (path === "/dashboard/vendor") return "vendor";
  if (path === "/dashboard/delivery") return "delivery";
  return null;
}

/** Avoid open redirects; only allow same-origin dashboard paths the signed-in role may open. */
export function safePostLoginRedirect(
  role: DashboardRole,
  redirect: string | undefined,
): "/dashboard" | "/dashboard/admin" | "/dashboard/vendor" | "/dashboard/delivery" {
  const home = dashboardPathForRole(role);
  if (!redirect || !redirect.startsWith("/dashboard")) return home;
  if (redirect === "/dashboard/login") return home;
  if (redirect === "/dashboard") return "/dashboard";
  const needed = pathRole(redirect);
  if (!needed) return home;
  if (needed !== role) return home;
  return redirect as "/dashboard/admin" | "/dashboard/vendor" | "/dashboard/delivery";
}

/** After customer login: stay on storefront paths only. */
export function safeShopperPostLoginRedirect(
  redirect: string | undefined,
): "/shop" | "/cart" | "/checkout" | "/account" {
  if (!redirect || !redirect.startsWith("/")) return "/shop";
  if (redirect.startsWith("//")) return "/shop";
  if (redirect.startsWith("/dashboard") || redirect.startsWith("/login")) return "/shop";
  if (redirect === "/cart" || redirect.startsWith("/cart/")) return "/cart";
  if (redirect === "/checkout" || redirect.startsWith("/checkout/")) return "/checkout";
  if (redirect === "/account" || redirect.startsWith("/account/")) return "/account";
  if (redirect === "/shop" || redirect.startsWith("/shop/")) return "/shop";
  return "/shop";
}
