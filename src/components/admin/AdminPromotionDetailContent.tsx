import { useState } from "react";
import { pausePromotion, updatePromotion } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { Promotion } from "@/lib/api/types";
import {
  adminLabelCls,
  AdminPrimaryButton,
  AdminStatusBadge,
  useAdminAction,
} from "@/components/admin/admin-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PromotionDetailGrid,
  promotionInputCls,
  usePromotionAction,
} from "@/components/promotions/promotion-ui";
import { formatGhs } from "@/lib/format-money";

function formatPromotionValue(promotion: Promotion): string {
  if (promotion.type === "PERCENT") return `${promotion.value}%`;
  if (promotion.type === "FREE_DELIVERY") return "Free delivery";
  return formatGhs(parseMoney(promotion.value));
}

export function AdminPromotionDetailContent({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated?: () => void;
}) {
  const { runAction: runPromotionAction } = usePromotionAction();
  const { invalidate } = useAdminAction();
  const [submitting, setSubmitting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [confirmPause, setConfirmPause] = useState(false);
  const [value, setValue] = useState(promotion.value);
  const [minSubtotal, setMinSubtotal] = useState(promotion.minSubtotal ?? "");

  const hasChanges =
    value !== promotion.value || minSubtotal.trim() !== (promotion.minSubtotal ?? "").trim();

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await runPromotionAction("Promotion updated", () =>
        updatePromotion(promotion.id, {
          value,
          minSubtotal: minSubtotal.trim() || undefined,
        }),
      );
      invalidate();
      onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  };

  const onPause = async () => {
    setPausing(true);
    try {
      await runPromotionAction("Promotion paused", () => pausePromotion(promotion.id));
      setConfirmPause(false);
      invalidate();
      onUpdated?.();
    } finally {
      setPausing(false);
    }
  };

  const isExpired = promotion.status === "EXPIRED";
  const endsSoon =
    promotion.status === "ACTIVE" &&
    new Date(promotion.endsAt).getTime() - Date.now() < 7 * 86400000;

  return (
    <div className="space-y-6">
      {endsSoon ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-foreground">
          This promotion ends {new Date(promotion.endsAt).toLocaleString()}.
        </p>
      ) : null}

      <PromotionDetailGrid
        rows={[
          { label: "Code", value: <span className="font-mono">{promotion.code}</span> },
          { label: "Type", value: promotion.type.replace(/_/g, " ") },
          { label: "Value", value: formatPromotionValue(promotion) },
          {
            label: "Status",
            value: <AdminStatusBadge status={promotion.status} />,
          },
          {
            label: "Min subtotal",
            value: promotion.minSubtotal ? formatGhs(parseMoney(promotion.minSubtotal)) : "—",
          },
          { label: "Redeemed", value: String(promotion.redeemedCount) },
          {
            label: "Limits",
            value: [
              promotion.maxRedemptions != null ? `Max ${promotion.maxRedemptions}` : null,
              promotion.perUserLimit != null ? `${promotion.perUserLimit} per user` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—",
          },
          { label: "Scope", value: promotion.storeId ?? "Platform-wide" },
          { label: "Starts", value: new Date(promotion.startsAt).toLocaleString() },
          { label: "Ends", value: new Date(promotion.endsAt).toLocaleString() },
        ]}
      />

      {!isExpired ? (
        <form onSubmit={(e) => void onUpdate(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-[var(--shadow-soft)]">
          <h4 className="text-sm font-semibold text-foreground">Update promotion</h4>
          <label className="block">
            <span className={adminLabelCls}>Value</span>
            <input className={promotionInputCls} value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
          <label className="block">
            <span className={adminLabelCls}>Min subtotal</span>
            <input
              className={promotionInputCls}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
              placeholder="Optional minimum order"
            />
          </label>
          <AdminPrimaryButton type="submit" disabled={submitting || !hasChanges} className="w-full">
            {submitting ? "Saving…" : hasChanges ? "Save changes" : "No changes"}
          </AdminPrimaryButton>
          {promotion.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => setConfirmPause(true)}
              className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
            >
              Pause promotion
            </button>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Expired promotions cannot be edited.</p>
      )}

      <AlertDialog open={confirmPause} onOpenChange={setConfirmPause}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause this promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              Code <span className="font-semibold text-foreground">{promotion.code}</span> will stop
              accepting new redemptions. Existing checkout sessions may still apply until they complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pausing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pausing}
              onClick={(e) => {
                e.preventDefault();
                void onPause();
              }}
            >
              {pausing ? "Pausing…" : "Pause promotion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
