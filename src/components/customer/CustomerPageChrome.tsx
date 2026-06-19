import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { to: string; label: string };
}) {
  return (
    <header className="mb-5 sm:mb-8">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground break-words">{description}</p>
          )}
        </div>
        {action && (
          <Link
            to={action.to}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}

export function CustomerPillNav({
  items,
}: {
  items: readonly {
    to: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
  }[];
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Section">
      {items.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={exact ? { exact: true } : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-4",
          )}
          activeProps={{
            className: "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
          }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

const sideNavLinkClass =
  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground snap-start";

export function CustomerSideNav({
  items,
  footer,
  label = "Account",
}: {
  items: readonly { to: string; label: string; icon: LucideIcon }[];
  footer?: ReactNode;
  label?: string;
}) {
  return (
    <aside className="w-full shrink-0 lg:w-52 xl:w-56">
      <nav
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        aria-label={label}
      >
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={sideNavLinkClass}
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {itemLabel}
          </Link>
        ))}
      </nav>

      <nav className="hidden flex-col gap-1 lg:flex" aria-label={label}>
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(sideNavLinkClass, "w-full shrink snap-none")}
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {itemLabel}
          </Link>
        ))}
      </nav>

      {footer && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground lg:mt-6">{footer}</p>
      )}
    </aside>
  );
}
