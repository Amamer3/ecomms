import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export const vendorInputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function VendorPageHeader({
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

export function VendorDetailGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border rounded-xl border border-border/70 bg-muted/20">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function useVendorAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["vendor-profile"] });
    void qc.invalidateQueries({ queryKey: ["vendor-orders"] });
    void qc.invalidateQueries({ queryKey: ["vendor-order"] });
    void qc.invalidateQueries({ queryKey: ["vendor-earnings"] });
    void qc.invalidateQueries({ queryKey: ["vendor-earnings-ledger"] });
    void qc.invalidateQueries({ queryKey: ["vendor-payouts"] });
  };

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
      invalidate();
      return true;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action failed");
      return false;
    }
  };

  return { runAction, invalidate };
}
