import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { LogOut, Menu, ShoppingBag, Sprout } from "lucide-react";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
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
  children,
}: {
  workspacePath: DashboardWorkspacePath;
  workspaceTitle: string;
  navItems: DashboardNavItem[];
  children: ReactNode;
}) {
  const { session, logout } = useAuth();
  const hash = useHashSection();
  const defaultSection = navItems[0]?.sectionId ?? "";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinkClass = (sectionId: string) => {
    const active = hash === sectionId || (hash === "" && sectionId === defaultSection);
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );
  };

  const desktopNav = (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {navItems.map(({ sectionId, label, icon: Icon }) => (
        <a key={sectionId} href={`#${sectionId}`} className={navLinkClass(sectionId)}>
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </a>
      ))}
    </nav>
  );

  const mobileNav = (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Workspace">
      {navItems.map(({ sectionId, label, icon: Icon }) => (
        <SheetClose asChild key={sectionId}>
          <a
            href={`#${sectionId}`}
            onClick={() => setMobileNavOpen(false)}
            className={navLinkClass(sectionId)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </a>
        </SheetClose>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="relative hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex"
        aria-label="Workspace navigation"
      >
        <div className="flex h-16 items-center border-b border-border/60 px-4">
          <Link to="/" className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Randy&apos;s<span className="text-primary">.</span>
            </span>
          </Link>
        </div>
        <div className="border-b border-border/60 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace</p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">{workspaceTitle}</p>
          <Link to={workspacePath} className="mt-2 inline-flex text-xs font-medium text-primary hover:underline">
            Dashboard home
          </Link>
        </div>
        {desktopNav}
        <div className="mt-auto border-t border-border/60 p-3">
          <Link
            to="/shop"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse shop
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
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
              <div className="border-t border-border/60 p-4">
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

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-destructive/40 hover:text-destructive sm:px-4 sm:text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
