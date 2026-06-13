import type { ApiRole, PublicUser } from "@/lib/api/types";

/**
 * Four user personas (stored `role` on {@link AuthSession}):
 * - `customer` — storefront (Customer)
 * - `vendor` — merchant tools (Vendor)
 * - `delivery` — courier tools at `/dashboard/delivery` (Courier)
 * - `admin` — platform tools (Admin)
 */
export type DashboardRole = "admin" | "vendor" | "delivery";

/** Customer role plus staff dashboard roles. */
export type UserRole = DashboardRole | "customer";

export type AuthSession = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  apiRole: ApiRole;
  createdAt: string;
};

export const AUTH_STORAGE_KEY = "randys_auth_session";

export function apiRoleToUserRole(role: ApiRole): UserRole {
  switch (role) {
    case "CUSTOMER":
      return "customer";
    case "VENDOR":
      return "vendor";
    case "RIDER":
      return "delivery";
    case "ADMIN":
      return "admin";
  }
}

export function displayNameFromUser(user: PublicUser, profile?: { firstName?: string | null; lastName?: string | null; businessName?: string }): string {
  if (profile && "businessName" in profile && profile.businessName) return profile.businessName;
  const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (user.email) return user.email.split("@")[0] ?? user.phone;
  return user.phone;
}

/** Prefer first + last name from customer profile; fall back to phone. */
export function customerProfileDisplayName(profile: {
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
}): string {
  const parts = [profile.firstName, profile.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return profile.phone;
}

export function sessionFromUser(user: PublicUser, name?: string): AuthSession {
  return {
    id: user.id,
    email: user.email ?? "",
    phone: user.phone,
    name: name ?? user.email?.split("@")[0] ?? user.phone,
    role: apiRoleToUserRole(user.role),
    apiRole: user.role,
    createdAt: new Date().toISOString(),
  };
}

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
      phone: typeof p.phone === "string" ? p.phone : "",
      name: typeof p.name === "string" ? p.name : "",
      role: p.role as UserRole,
      apiRole: (p.apiRole as ApiRole) ?? mapLegacyApiRole(p.role as UserRole),
      createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function mapLegacyApiRole(role: UserRole): ApiRole {
  switch (role) {
    case "customer":
      return "CUSTOMER";
    case "vendor":
      return "VENDOR";
    case "delivery":
      return "RIDER";
    case "admin":
      return "ADMIN";
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

export function dashboardProfilePathForRole(
  role: DashboardRole,
): "/dashboard/admin/profile" | "/dashboard/vendor/profile" | "/dashboard/delivery/profile" {
  switch (role) {
    case "admin":
      return "/dashboard/admin/profile";
    case "vendor":
      return "/dashboard/vendor/profile";
    case "delivery":
      return "/dashboard/delivery/profile";
  }
}

export function dashboardProfilePathForWorkspace(
  workspacePath: "/dashboard/admin" | "/dashboard/vendor" | "/dashboard/delivery",
): ReturnType<typeof dashboardProfilePathForRole> {
  switch (workspacePath) {
    case "/dashboard/admin":
      return "/dashboard/admin/profile";
    case "/dashboard/vendor":
      return "/dashboard/vendor/profile";
    case "/dashboard/delivery":
      return "/dashboard/delivery/profile";
  }
}

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

/** Route after password/MFA login from the API user record (not a UI-selected role). */
export function postAuthRedirectPath(
  user: Pick<PublicUser, "role">,
  redirect: string | undefined,
): ReturnType<typeof safePostLoginRedirect> | ReturnType<typeof safeShopperPostLoginRedirect> {
  const role = apiRoleToUserRole(user.role);
  if (role === "customer") return safeShopperPostLoginRedirect(redirect);
  return safePostLoginRedirect(role, redirect);
}

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
