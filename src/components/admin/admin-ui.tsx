import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { runAction as executeAction } from "@/lib/run-action";

export const adminInputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function AdminDataTable({
  title,
  headers,
  rows,
  actions,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  actions?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        {actions}
      </div>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No records</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border/60">
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function useAdminAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    void qc.invalidateQueries({ queryKey: ["admin-orders"] });
    void qc.invalidateQueries({ queryKey: ["admin-payments"] });
    void qc.invalidateQueries({ queryKey: ["admin-disputes"] });
    void qc.invalidateQueries({ queryKey: ["admin-refunds"] });
    void qc.invalidateQueries({ queryKey: ["admin-ledger"] });
    void qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const runAction = (label: string, fn: () => Promise<unknown>) =>
    executeAction(label, fn, invalidate);

  return { runAction, invalidate };
}

export const VENDOR_TIERS = ["STANDARD", "PREMIUM", "ELITE"] as const;
