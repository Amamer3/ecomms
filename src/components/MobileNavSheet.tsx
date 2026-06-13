import { ArrowRight, LogIn, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AuthSession } from "@/lib/auth-storage";
import { appHomePathForRole } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";

type NavItem = { readonly to: string; readonly label: string };

const PARTNER_ROUTES = new Set(["/vendors", "/delivery"]);

type MobileNavSheetProps = {
  navItems: readonly NavItem[];
  path: string;
  ready: boolean;
  session: AuthSession | null;
  cartCount: number;
  loginRedirect: { redirect: string | undefined };
  onLogout: () => void;
};

export function MobileNavSheet({
  navItems,
  path,
  ready,
  session,
  cartCount,
  loginRedirect,
  onLogout,
}: MobileNavSheetProps) {
  const browseItems = navItems.filter((item) => !PARTNER_ROUTES.has(item.to));
  const partnerItems = navItems.filter((item) => PARTNER_ROUTES.has(item.to));

  return (
    <SheetContent
      side="left"
      className="flex w-[min(100vw-1.25rem,19.5rem)] flex-col gap-0 border-r border-border bg-background p-0 sm:max-w-[19.5rem]"
    >
      <SheetHeader className="space-y-0 border-b border-border/70 px-5 pb-4 pr-12 pt-5 text-left">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetClose asChild>
          <Link to="/" className="inline-block transition-opacity hover:opacity-85">
            <BrandLogo size="lg" className="h-8" />
          </Link>
        </SheetClose>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <SheetClose asChild>
          <Link
            to="/cart"
            className="group flex items-baseline justify-between gap-3 border-b border-border/70 pb-4"
          >
            <span className="font-display text-xl font-semibold text-foreground">Basket</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              {cartCount > 0 ? (
                <>
                  {cartCount} item{cartCount === 1 ? "" : "s"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Empty
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </span>
          </Link>
        </SheetClose>

        <nav className="pt-4" aria-label="Main">
          <ul>
            {browseItems.map(({ to, label }) => (
              <li key={to} className="border-b border-border/50 last:border-b-0">
                <MobileNavLink to={to} label={label} active={navLinkActive(path, to)} />
              </li>
            ))}
          </ul>

          {partnerItems.length > 0 && (
            <ul className="mt-6 border-t border-dashed border-border/80 pt-4">
              {partnerItems.map(({ to, label }) => (
                <li key={to}>
                  <MobileNavLink
                    to={to}
                    label={label}
                    active={navLinkActive(path, to)}
                    variant="partner"
                  />
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>

      <div className="border-t border-border/70 px-5 py-4">
        {!ready ? (
          <div className="h-10 animate-pulse bg-muted/40" aria-hidden />
        ) : session ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{session.name}</span>
            </p>
            <SheetClose asChild>
              <Link
                to={session.role === "customer" ? "/account" : appHomePathForRole(session.role)}
                className="flex items-center justify-between text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {session.role === "customer" ? "My deliveries" : "Open dashboard"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => onLogout()}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </SheetClose>
          </div>
        ) : (
          <div className="space-y-3">
            <SheetClose asChild>
              <Link
                to="/login"
                search={loginRedirect}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                to="/shop"
                className="block text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Browse without signing in
              </Link>
            </SheetClose>
          </div>
        )}
      </div>
    </SheetContent>
  );
}

function MobileNavLink({
  to,
  label,
  active,
  variant = "main",
}: {
  to: string;
  label: string;
  active: boolean;
  variant?: "main" | "partner";
}) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        className={cn(
          "block py-3 transition-colors",
          variant === "main"
            ? cn(
                "font-display text-[1.35rem] leading-none tracking-tight",
                active ? "font-semibold text-primary" : "text-foreground/80 hover:text-foreground",
              )
            : cn(
                "text-sm",
                active ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground",
              ),
        )}
      >
        {variant === "partner" && <span className="mr-1.5 text-border">—</span>}
        {label}
      </Link>
    </SheetClose>
  );
}

function navLinkActive(path: string, to: string) {
  if (to === "/account") return path === "/account" || path.startsWith("/account/");
  if (to === "/catalog") return path === "/catalog" || path.startsWith("/catalog/");
  return path === to;
}
