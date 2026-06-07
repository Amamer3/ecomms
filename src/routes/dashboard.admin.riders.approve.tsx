import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { approveRider } from "@/lib/api";
import { adminInputCls, AdminPageHeader, useAdminAction } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/riders/approve")({
  component: AdminApproveRiderPage,
  head: () => ({ meta: [{ title: "Approve courier — GoMarket" }] }),
});

function AdminApproveRiderPage() {
  const { runAction } = useAdminAction();
  const [riderId, setRiderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderId.trim()) return;
    setSubmitting(true);
    try {
      await runAction("Courier approved", () => approveRider(riderId.trim()));
      setRiderId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <AdminPageHeader
        title="Approve courier"
        description="Activate a pending rider profile so they can accept deliveries."
      />

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Rider profile ID</span>
          <input
            value={riderId}
            onChange={(e) => setRiderId(e.target.value)}
            placeholder="e.g. clx…"
            className={adminInputCls}
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !riderId.trim()}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Approving…" : "Approve courier"}
        </button>
      </form>
    </div>
  );
}
