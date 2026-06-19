import type { ReactNode } from "react";

export const customerInputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function CustomerPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-6 sm:mb-8">
      <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground break-words">{description}</p>
    </header>
  );
}

export function CustomerDetailGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border rounded-xl border border-border/70 bg-muted/20">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-1 px-3 py-3 sm:px-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="min-w-0 text-sm font-medium text-foreground break-words sm:text-right">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function formatTier(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}
