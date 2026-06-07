import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { approveVendor } from "@/lib/api";
import { adminInputCls, AdminPageHeader, useAdminAction } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/vendors/approve")({
  component: AdminApproveVendorPage,
  head: () => ({ meta: [{ title: "Approve vendor — GoMarket" }] }),
});

function AdminApproveVendorPage() {
  const { runAction } = useAdminAction();
  const [vendorId, setVendorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim()) return;
    setSubmitting(true);
    try {
      await runAction("Vendor approved", () => approveVendor(vendorId.trim()));
      setVendorId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <AdminPageHeader
        title="Approve vendor"
        description="Activate a pending vendor profile so they can fulfil orders on the platform."
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
        <button
          type="submit"
          disabled={submitting || !vendorId.trim()}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Approving…" : "Approve vendor"}
        </button>
      </form>
    </div>
  );
}
