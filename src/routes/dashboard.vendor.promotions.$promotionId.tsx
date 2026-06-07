import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { listPromotions, pausePromotion, updatePromotion } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { VendorPageHeader } from "@/components/vendor/vendor-ui";
import {
  PromotionDetailGrid,
  PromotionStatusBadge,
  promotionInputCls,
  usePromotionAction,
} from "@/components/promotions/promotion-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/vendor/promotions/$promotionId")({
  component: VendorPromotionDetailPage,
});

function VendorPromotionDetailPage() {
  const { promotionId } = Route.useParams();
  const { runAction } = usePromotionAction();
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");

  const { data: promotions = [], isLoading, refetch } = useQuery({
    queryKey: ["promotions", "vendor"],
    queryFn: () => listPromotions(),
  });

  const promotion = promotions.find((p) => p.id === promotionId);

  useEffect(() => {
    if (!promotion) return;
    setValue(promotion.value);
    setMinSubtotal(promotion.minSubtotal ?? "");
  }, [promotion]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading promotion…</p>;
  }

  if (!promotion) {
    return <p className="text-sm text-destructive">Promotion not found.</p>;
  }

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await runAction("Promotion updated", () =>
      updatePromotion(promotionId, {
        value,
        minSubtotal: minSubtotal.trim() || undefined,
      }),
    );
    setSubmitting(false);
    void refetch();
  };

  const onPause = () => {
    void runAction("Promotion paused", () => pausePromotion(promotionId)).then(() => refetch());
  };

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/vendor/promotions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All promotions
      </Link>

      <VendorPageHeader
        title={promotion.code}
        description={`${promotion.type} promotion`}
      />

      <div className="mb-6">
        <PromotionStatusBadge status={promotion.status} />
      </div>

      <PromotionDetailGrid
        rows={[
          { label: "Type", value: promotion.type },
          {
            label: "Value",
            value: promotion.type === "PERCENT" ? `${promotion.value}%` : formatGhs(parseMoney(promotion.value)),
          },
          {
            label: "Min subtotal",
            value: promotion.minSubtotal ? formatGhs(parseMoney(promotion.minSubtotal)) : "—",
          },
          { label: "Redeemed", value: String(promotion.redeemedCount) },
          { label: "Store", value: promotion.storeId ?? "—" },
          { label: "Starts", value: new Date(promotion.startsAt).toLocaleString() },
          { label: "Ends", value: new Date(promotion.endsAt).toLocaleString() },
        ]}
      />

      <form onSubmit={(e) => void onUpdate(e)} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <h3 className="font-semibold">Update promotion</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Value</span>
          <input className={promotionInputCls} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Min subtotal</span>
          <input
            className={promotionInputCls}
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
        {promotion.status === "ACTIVE" && (
          <button
            type="button"
            onClick={onPause}
            className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5"
          >
            Pause promotion
          </button>
        )}
      </form>
    </div>
  );
}
