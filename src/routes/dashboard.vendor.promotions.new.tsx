import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createPromotion } from "@/lib/api";
import { VendorPageHeader } from "@/components/vendor/vendor-ui";
import { PromoFields, usePromotionAction } from "@/components/promotions/promotion-ui";

export const Route = createFileRoute("/dashboard/vendor/promotions/new")({
  component: VendorNewPromotionPage,
  head: () => ({ meta: [{ title: "New promotion — GoMarket" }] }),
});

function VendorNewPromotionPage() {
  const navigate = useNavigate();
  const { runAction } = usePromotionAction();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED" | "FREE_DELIVERY",
    value: "10",
    minSubtotal: "",
    storeId: "",
    maxRedemptions: "",
    perUserLimit: "1",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeId.trim()) {
      return;
    }
    setSubmitting(true);
    const ok = await runAction("Promotion created", () =>
      createPromotion({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.value,
        minSubtotal: form.minSubtotal.trim() || undefined,
        storeId: form.storeId.trim(),
        maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
        perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      }),
    );
    setSubmitting(false);
    if (ok) navigate({ to: "/dashboard/vendor/promotions" });
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
        title="Create store promotion"
        description="Create a coupon scoped to one of your stores."
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <PromoFields form={form} setForm={setForm} storeIdRequired />
        <button
          type="submit"
          disabled={submitting || !form.storeId.trim()}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create promotion"}
        </button>
      </form>
    </div>
  );
}
