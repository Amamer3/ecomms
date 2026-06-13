import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { selectPathname } from "@/lib/router-pathname";
import { LogOut, Menu, ShoppingBag, User } from "lucide-react";
import { dashboardProfilePathForWorkspace } from "@/lib/auth-storage";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type DashboardWorkspacePath = "/dashboard/admin" | "/dashboard/vendor" | "/dashboard/delivery";

export type DashboardNavItem = {
  sectionId: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export type DashboardRouteNavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  section?: string;
};

function groupNavItems(items: DashboardRouteNavItem[]): { section?: string; items: DashboardRouteNavItem[] }[] {
  const groups: { section?: string; items: DashboardRouteNavItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) {
      last.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
  }
  return groups;
}

function isRouteNavActive(pathname: string, to: string, exact?: boolean): boolean {
  if (exact) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function useHashSection(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(window.location.hash.replace(/^#/, ""));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

export function DashboardRoleShell({
  workspacePath,
  workspaceTitle,
  navItems,
  routeNavItems,
  children,
}: {
  workspacePath: DashboardWorkspacePath;
  workspaceTitle: string;
  navItems?: DashboardNavItem[];
  routeNavItems?: DashboardRouteNavItem[];
  children: ReactNode;
}) {
  const { session, logout } = useAuth();
  const pathname = useRouterState({ select: selectPathname });
  const hash = useHashSection();
  const defaultSection = navItems?.[0]?.sectionId ?? "";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profilePath = dashboardProfilePathForWorkspace(workspacePath);

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );

  const hashNavLinkClass = (sectionId: string) => {
    const active = hash === sectionId || (hash === "" && sectionId === defaultSection);
    return itemClass(active);
  };

  const routeNavLinkClass = (to: string, exact?: boolean) =>
    itemClass(isRouteNavActive(pathname, to, exact));

  const desktopNav = routeNavItems ? (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {groupNavItems(routeNavItems).map((group, gi) => (
        <div key={group.section ?? `group-${gi}`} className={gi > 0 ? "mt-3" : undefined}>
          {group.section ? (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              {group.section}
            </p>
          ) : null}
          {group.items.map(({ to, label, icon: Icon, exact }) => (
            <Link key={to} to={to} className={routeNavLinkClass(to, exact)}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  ) : (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {navItems?.map(({ sectionId, label, icon: Icon }) => (
        <a key={sectionId} href={`#${sectionId}`} className={hashNavLinkClass(sectionId)}>
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </a>
      ))}
    </nav>
  );

  const mobileNav = routeNavItems ? (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {groupNavItems(routeNavItems).map((group, gi) => (
        <div key={group.section ?? `group-${gi}`} className={gi > 0 ? "mt-3" : undefined}>
          {group.section ? (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              {group.section}
            </p>
          ) : null}
          {group.items.map(({ to, label, icon: Icon, exact }) => (
            <SheetClose asChild key={to}>
              <Link
                to={to}
                onClick={() => setMobileNavOpen(false)}
                className={routeNavLinkClass(to, exact)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </SheetClose>
          ))}
        </div>
      ))}
    </nav>
  ) : (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {navItems?.map(({ sectionId, label, icon: Icon }) => (
        <SheetClose asChild key={sectionId}>
          <a
            href={`#${sectionId}`}
            onClick={() => setMobileNavOpen(false)}
            className={hashNavLinkClass(sectionId)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </a>
        </SheetClose>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className="relative hidden h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/30 md:flex"
        aria-label="Workspace navigation"
      >
        <div className="flex h-16 shrink-0 items-center border-b border-border/60 px-4">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <BrandLogo size="md" className="h-8" />
          </Link>
        </div>
        <div className="shrink-0 border-b border-border/60 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace</p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">{workspaceTitle}</p>
          <Link to={workspacePath} className="mt-2 inline-flex text-xs font-medium text-primary hover:underline">
            Dashboard home
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{desktopNav}</div>
        <div className="shrink-0 space-y-1 border-t border-border/60 p-3">
          <Link
            to={profilePath}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/shop"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse shop
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-3 sm:h-16 sm:gap-3 sm:px-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-[var(--shadow-soft)] transition-colors hover:bg-muted/50 md:hidden"
                aria-label="Open workspace menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border/60 p-5 pb-4 text-left">
                <SheetTitle className="font-display text-lg">{workspaceTitle}</SheetTitle>
                <p className="text-left text-xs text-muted-foreground">Jump to a section</p>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-2">{mobileNav}</div>
              <div className="space-y-1 border-t border-border/60 p-4">
                <SheetClose asChild>
                  <Link
                    to={profilePath}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/shop"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Browse shop
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{workspaceTitle}</h1>
            {session ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {session.name}
                <span className="hidden sm:inline"> · {session.email}</span>
              </p>
            ) : null}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:border-destructive/40 hover:text-destructive sm:px-4 sm:text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out of your {workspaceTitle.toLowerCase()} workspace on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void logout()}
                >
                  Log out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
