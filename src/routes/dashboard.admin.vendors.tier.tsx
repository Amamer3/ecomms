import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { setVendorTier } from "@/lib/api";
import {
  adminInputCls,
  AdminPageHeader,
  useAdminAction,
  VENDOR_TIERS,
} from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/vendors/tier")({
  component: AdminVendorTierPage,
  head: () => ({ meta: [{ title: "Vendor tier — GoMarket" }] }),
});

function AdminVendorTierPage() {
  const { runAction } = useAdminAction();
  const [vendorId, setVendorId] = useState("");
  const [tier, setTier] = useState<(typeof VENDOR_TIERS)[number]>("STANDARD");
  const [commissionRate, setCommissionRate] = useState("0.12");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim()) return;
    const rate = parseFloat(commissionRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      toast.error("Commission rate must be between 0 and 1");
      return;
    }
    setSubmitting(true);
    try {
      await runAction("Vendor tier updated", () =>
        setVendorTier(vendorId.trim(), { tier, commissionRate: rate }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <AdminPageHeader
        title="Set vendor tier"
        description="Adjust a vendor's partnership tier and commission rate."
      />

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Vendor profile ID</span>
          <input
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="e.g. clx…"
            className={adminInputCls}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as (typeof VENDOR_TIERS)[number])}
            className={adminInputCls}
          >
            {VENDOR_TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Commission rate (0–1)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className={adminInputCls}
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !vendorId.trim()}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update tier"}
        </button>
      </form>
    </div>
  );
}
