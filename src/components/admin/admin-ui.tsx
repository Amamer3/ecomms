import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { runAction as executeAction } from "@/lib/run-action";
import type { AdminUser } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const adminInputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export const adminLabelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const STATUS_TONES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

export function statusTone(status: string): StatusTone {
  const s = status.toUpperCase();
  if (
    ["ACTIVE", "PAID", "SUCCESS", "COMPLETED", "DELIVERED", "RESOLVED", "APPROVED", "ONLINE"].includes(s)
  ) {
    return "success";
  }
  if (
    [
      "PENDING",
      "PENDING_APPROVAL",
      "PLACED",
      "OPEN",
      "UNDER_REVIEW",
      "PROCESSING",
      "PREPARING",
      "ACCEPTED",
    ].includes(s)
  ) {
    return "warning";
  }
  if (["SUSPENDED", "REJECTED", "FAILED", "CANCELLED", "DELETED", "EXPIRED"].includes(s)) {
    return "danger";
  }
  if (["READY", "IN_PROGRESS", "ON_DELIVERY", "PAUSED"].includes(s)) {
    return "info";
  }
  return "neutral";
}

export function AdminStatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        STATUS_TONES[tone],
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function AdminRoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {role}
    </span>
  );
}

export function AdminMono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-foreground/90">{children}</span>;
}

export function AdminBackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminPrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminFilterBar({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-[var(--shadow-soft)] sm:p-5"
    >
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </form>
  );
}

export function AdminFilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-[10rem]", className)}>
      <span className={adminLabelCls}>{label}</span>
      {children}
    </label>
  );
}

export function AdminActionBar({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AdminFormCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {title ? (
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function AdminDetailGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function adminUserDisplayName(user: AdminUser | null | undefined): string {
  if (!user) return "User";
  if (user.role === "CUSTOMER" && user.customerProfile) {
    const name = [user.customerProfile.firstName, user.customerProfile.lastName].filter(Boolean).join(" ");
    if (name) return name;
  }
  if (user.role === "VENDOR" && user.vendorProfile?.businessName) {
    return user.vendorProfile.businessName;
  }
  if (user.role === "RIDER" && user.riderProfile?.fullName) {
    return user.riderProfile.fullName;
  }
  return user.email ?? user.phone;
}

export function AdminListItem({
  title,
  badges,
  meta,
  footer,
  onClick,
  action,
}: {
  title: ReactNode;
  badges?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  action?: ReactNode;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] transition-colors",
        onClick ? "cursor-pointer hover:border-primary/30 hover:bg-muted/20" : "hover:border-border",
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{title}</div>
        <div className="flex flex-wrap items-center gap-2">
          {badges}
          {action ? <div onClick={(e) => e.stopPropagation()}>{action}</div> : null}
        </div>
      </div>
      {meta ? <p className="mt-2 text-sm text-muted-foreground">{meta}</p> : null}
      {footer ? <p className="mt-1.5 text-xs text-muted-foreground">{footer}</p> : null}
    </li>
  );
}

export function AdminList({ children, emptyMessage }: { children: ReactNode; emptyMessage?: string }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const isEmpty = Array.isArray(items) && items.length === 0;

  if (isEmpty && emptyMessage) {
    return <AdminEmptyState message={emptyMessage} />;
  }

  return <ul className="space-y-3">{children}</ul>;
}

export function AdminDataTable({
  title,
  headers,
  rows,
  actions,
  emptyMessage = "No records",
  footer,
}: {
  title: string;
  headers: string[];
  rows: ReactNode[][];
  actions?: ReactNode;
  emptyMessage?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {actions}
      </div>
      {rows.length === 0 ? (
        <AdminEmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border/40 transition-colors hover:bg-muted/20"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-3.5 align-middle">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer}
    </div>
  );
}

export const ADMIN_PAGE_SIZES = [10, 20, 50] as const;

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function adminTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function AdminPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizes = ADMIN_PAGE_SIZES,
  className,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizes?: readonly number[];
  className?: string;
}) {
  const totalPages = adminTotalPages(totalItems, pageSize);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? "No results"
          : `Showing ${start}–${end} of ${totalItems}`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">Rows per page</span>
            <select
              className={cn(adminInputCls, "h-9 w-auto min-w-[4.5rem] py-1.5")}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="min-w-[7rem] px-2 text-center text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}

const STAT_ACCENTS = {
  default: "border-border/60",
  primary: "border-primary/20 bg-primary/[0.03]",
  warning: "border-amber-500/20 bg-amber-500/[0.04]",
  danger: "border-red-500/20 bg-red-500/[0.04]",
} as const;

export function AdminStat({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  sub: string;
  icon?: LucideIcon;
  accent?: keyof typeof STAT_ACCENTS;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]",
        STAT_ACCENTS[accent],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function AdminQuickLink({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

export function AdminTabNav({
  items,
}: {
  items: readonly { to: string; label: string; icon: LucideIcon; exact?: boolean }[];
}) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label="Sub-sections">
      {items.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: exact ?? false }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
          )}
          activeProps={{
            className: "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
          }}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function useAdminAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    void qc.invalidateQueries({ queryKey: ["admin-orders"] });
    void qc.invalidateQueries({ queryKey: ["admin-order"] });
    void qc.invalidateQueries({ queryKey: ["admin-payments"] });
    void qc.invalidateQueries({ queryKey: ["admin-disputes"] });
    void qc.invalidateQueries({ queryKey: ["admin-refunds"] });
    void qc.invalidateQueries({ queryKey: ["admin-ledger"] });
    void qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
    void qc.invalidateQueries({ queryKey: ["admin-pending-vendors"] });
    void qc.invalidateQueries({ queryKey: ["admin-pending-riders"] });
    void qc.invalidateQueries({ queryKey: ["admin-vendors-tier"] });
    void qc.invalidateQueries({ queryKey: ["admin-user"] });
  };
 
  const runAction = (label: string, fn: () => Promise<unknown>) =>
    executeAction(label, fn, invalidate);

  return { runAction, invalidate };
}

export const VENDOR_TIERS = ["STANDARD", "PREMIUM", "ELITE"] as const;
