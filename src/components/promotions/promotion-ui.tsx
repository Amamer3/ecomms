import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export const promotionInputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function PromotionPageHeader({
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

export function PromotionStatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{status}</span>
  );
}

export function usePromotionAction() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["promotions"] });
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

  return { runAction };
}

export type PromotionFormState = {
  code: string;
  type: "PERCENT" | "FIXED" | "FREE_DELIVERY";
  value: string;
  minSubtotal: string;
  storeId: string;
  maxRedemptions: string;
  perUserLimit: string;
  startsAt: string;
  endsAt: string;
};

export function PromoFields({
  form,
  setForm,
  storeIdRequired,
}: {
  form: PromotionFormState;
  setForm: React.Dispatch<React.SetStateAction<PromotionFormState>>;
  storeIdRequired?: boolean;
}) {
  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Code</span>
        <input
          className={promotionInputCls}
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Type</span>
        <select
          className={promotionInputCls}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PromotionFormState["type"] }))}
        >
          <option value="PERCENT">Percent</option>
          <option value="FIXED">Fixed amount</option>
          <option value="FREE_DELIVERY">Free delivery</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Value</span>
        <input
          className={promotionInputCls}
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Min subtotal (optional)</span>
        <input
          className={promotionInputCls}
          value={form.minSubtotal}
          onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          Store ID{storeIdRequired ? "" : " (blank = platform)"}
        </span>
        <input
          className={promotionInputCls}
          value={form.storeId}
          onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
          required={storeIdRequired}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Max redemptions</span>
          <input
            className={promotionInputCls}
            type="number"
            value={form.maxRedemptions}
            onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Per-user limit</span>
          <input
            className={promotionInputCls}
            type="number"
            value={form.perUserLimit}
            onChange={(e) => setForm((f) => ({ ...f, perUserLimit: e.target.value }))}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Starts at</span>
        <input
          type="datetime-local"
          className={promotionInputCls}
          value={form.startsAt}
          onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Ends at</span>
        <input
          type="datetime-local"
          className={promotionInputCls}
          value={form.endsAt}
          onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
          required
        />
      </label>
    </>
  );
}

export function PromotionDetailGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
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
