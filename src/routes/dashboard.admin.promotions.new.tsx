import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createPromotion } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { PromoFields, usePromotionAction } from "@/components/promotions/promotion-ui";

export const Route = createFileRoute("/dashboard/admin/promotions/new")({
  component: AdminNewPromotionPage,
  head: () => ({ meta: [{ title: "New promotion — GoMarket" }] }),
});

function AdminNewPromotionPage() {
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
    setSubmitting(true);
    const ok = await runAction("Promotion created", () =>
      createPromotion({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.value,
        minSubtotal: form.minSubtotal.trim() || undefined,
        storeId: form.storeId.trim() || undefined,
        maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
        perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      }),
    );
    setSubmitting(false);
    if (ok) navigate({ to: "/dashboard/admin/promotions" });
  };

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/admin/promotions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All promotions
      </Link>

      <AdminPageHeader
        title="Create promotion"
        description="Create a platform or store-scoped promotion code."
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <PromoFields form={form} setForm={setForm} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create promotion"}
        </button>
      </form>
    </div>
  );
}
