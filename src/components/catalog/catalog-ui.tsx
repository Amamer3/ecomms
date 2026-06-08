import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { runAction as executeAction } from "@/lib/run-action";

export const catalogInputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function CatalogPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function CatalogDataTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      <div className="border-b border-border/60 p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
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

export function useVendorCatalogAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["vendor-stores"] });
    void qc.invalidateQueries({ queryKey: ["vendor-products"] });
    void qc.invalidateQueries({ queryKey: ["stores"] });
    void qc.invalidateQueries({ queryKey: ["products"] });
  };

  const runAction = (label: string, fn: () => Promise<unknown>) =>
    executeAction(label, fn, invalidate);

  return { runAction, invalidate };
}
