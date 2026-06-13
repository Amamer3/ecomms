import { useState } from "react";
import { updateAdminDispute } from "@/lib/api";
import type { Dispute } from "@/lib/api/types";
import {
  adminInputCls,
  adminLabelCls,
  AdminDetailGrid,
  AdminFormCard,
  AdminPrimaryButton,
  AdminStatusBadge,
  useAdminAction,
} from "@/components/admin/admin-ui";

const STATUSES: Dispute["status"][] = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export function AdminDisputeDetailContent({
  dispute,
  onUpdated,
}: {
  dispute: Dispute;
  onUpdated?: () => void;
}) {
  const { runAction } = useAdminAction();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Dispute["status"]>(dispute.status);
  const [resolution, setResolution] = useState(dispute.resolution ?? "");

  const hasChanges =
    status !== dispute.status || resolution.trim() !== (dispute.resolution ?? "").trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await runAction("Dispute updated", () =>
        updateAdminDispute(dispute.id, {
          status,
          resolution: resolution.trim() || undefined,
        }),
      );
      onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminDetailGrid
        rows={[
          { label: "Order", value: dispute.orderNumber ?? dispute.orderId },
          { label: "Customer", value: dispute.customerPhone ?? dispute.customerId },
          { label: "Store", value: dispute.storeName ?? "—" },
          { label: "Reason", value: dispute.reason },
          ...(dispute.description ? [{ label: "Description", value: dispute.description }] : []),
          {
            label: "Status",
            value: <AdminStatusBadge status={dispute.status} />,
          },
          { label: "Opened", value: new Date(dispute.createdAt).toLocaleString() },
          ...(dispute.resolvedAt
            ? [{ label: "Resolved", value: new Date(dispute.resolvedAt).toLocaleString() }]
            : []),
          ...(dispute.resolution ? [{ label: "Current resolution", value: dispute.resolution }] : []),
        ]}
      />

      <form onSubmit={(e) => void onSubmit(e)}>
        <AdminFormCard title="Update dispute" description="Change status and record resolution notes.">
          <label className="block">
            <span className={adminLabelCls}>Status</span>
            <select
              className={adminInputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as Dispute["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={adminLabelCls}>Resolution notes</span>
            <textarea
              className={`${adminInputCls} min-h-[6rem] resize-y`}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Outcome, refund details, or rejection reason…"
            />
          </label>
          <AdminPrimaryButton type="submit" disabled={submitting || !hasChanges} className="w-full">
            {submitting ? "Saving…" : hasChanges ? "Save resolution" : "No changes"}
          </AdminPrimaryButton>
        </AdminFormCard>
      </form>
    </div>
  );
}
