import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { appHomePathForRole } from "@/lib/auth-storage";
import { selectPathname } from "@/lib/router-pathname";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Storefront nav only — business dashboards are not linked publicly. */
const NAV_ITEMS_PUBLIC = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/catalog", label: "Catalog" },
  { to: "/vendors", label: "Sell with us" },
  { to: "/delivery", label: "Deliver" },
] as const;

const NAV_ITEMS_CUSTOMER = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/catalog", label: "Catalog" },
  { to: "/account", label: "My delivery" },
  { to: "/vendors", label: "Sell with us" },
  { to: "/delivery", label: "Deliver" },
] as const;

function navLinkActive(path: string, to: string) {
  if (to === "/account") return path === "/account" || path.startsWith("/account/");
  if (to === "/catalog") return path === "/catalog" || path.startsWith("/catalog/");
  return path === to;
}

function loginSearch(path: string): { redirect: string | undefined } {
  return { redirect: path === "/login" ? undefined : path };
}

const navbarShellClass =
  "px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))] lg:px-6";

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { count } = useCart();
  const { session, ready, logout } = useAuth();
  const path = useRouterState({ select: selectPathname });
  const navItems = session?.role === "customer" ? NAV_ITEMS_CUSTOMER : NAV_ITEMS_PUBLIC;

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        navbarShellClass,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-12 max-w-7xl items-center gap-1.5 rounded-2xl border px-2.5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:h-[4.25rem] sm:gap-3 sm:px-5 lg:px-6",
          overlay
            ? "border-white/60 bg-card/90 supports-[backdrop-filter]:bg-card/80"
            : "border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/75",
        )}
      >
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
          <BrandLogo size="lg" className="h-7 sm:h-9" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:gap-2 xl:gap-6 md:flex" aria-label="Main">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary",
                navLinkActive(path, to)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {!ready ? (
            <span
              className="hidden h-9 w-20 animate-pulse rounded-full bg-muted/60 md:inline-block"
              aria-hidden
            />
          ) : session ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to={session.role === "customer" ? "/account" : appHomePathForRole(session.role)}
                className="max-w-[160px] truncate rounded-lg border border-border/70 bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/30"
                title={session.name}
              >
                {session.name}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" /> Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              search={loginSearch(path)}
              className="hidden items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40 md:inline-flex"
            >
              <LogIn className="h-4 w-4" /> Log in
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-[var(--shadow-soft)] transition-colors hover:bg-secondary md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border/60 p-6 pb-4 text-left">
                <SheetTitle className="font-display text-xl">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main">
                {navItems.map(({ to, label }) => (
                  <SheetClose key={to} asChild>
                    <Link
                      to={to}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-secondary/80",
                        navLinkActive(path, to)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80",
                      )}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-auto border-t border-border/60 pt-4">
                  {!ready ? null : session ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          to={
                            session.role === "customer"
                              ? "/account"
                              : appHomePathForRole(session.role)
                          }
                          className="mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/80"
                        >
                          {session.role === "customer"
                            ? `${session.name} — deliveries`
                            : `${session.name} — dashboard`}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          Log out
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        to="/login"
                        search={loginSearch(path)}
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10"
                      >
                        Log in
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground sm:static sm:ml-1 sm:min-h-0 sm:min-w-0 sm:px-2 sm:py-0.5 sm:text-xs">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
    {!overlay && (
      <div aria-hidden className="pointer-events-none h-[var(--navbar-offset)] shrink-0" />
    )}
    </>
  );
}
