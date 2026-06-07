import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { listAdminDisputes, updateAdminDispute } from "@/lib/api";
import { adminInputCls, AdminPageHeader, useAdminAction } from "@/components/admin/admin-ui";
import type { Dispute } from "@/lib/api/types";

export const Route = createFileRoute("/dashboard/admin/disputes/$disputeId")({
  component: AdminDisputeDetailPage,
});

const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const;

function AdminDisputeDetailPage() {
  const { disputeId } = Route.useParams();
  const { runAction } = useAdminAction();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Dispute["status"]>("OPEN");
  const [resolution, setResolution] = useState("");

  const { data: disputes = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => listAdminDisputes({ limit: 100 }),
  });

  const dispute = disputes.find((d) => d.id === disputeId);

  useEffect(() => {
    if (!dispute) return;
    setStatus(dispute.status);
    setResolution(dispute.resolution ?? "");
  }, [dispute]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading dispute…</p>;
  }

  if (!dispute) {
    return <p className="text-sm text-destructive">Dispute not found.</p>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await runAction("Dispute updated", () =>
      updateAdminDispute(disputeId, {
        status,
        resolution: resolution.trim() || undefined,
      }),
    );
    setSubmitting(false);
    if (ok) void refetch();
  };

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/admin/disputes"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All disputes
      </Link>

      <AdminPageHeader
        title={dispute.orderNumber ?? dispute.orderId}
        description={`${dispute.reason} — ${dispute.customerPhone ?? dispute.customerId}`}
      />

      <dl className="mb-8 divide-y divide-border rounded-xl border border-border/70 bg-muted/20 text-sm">
        {[
          { label: "Status", value: dispute.status },
          { label: "Store", value: dispute.storeName ?? "—" },
          { label: "Reason", value: dispute.reason },
          ...(dispute.description ? [{ label: "Description", value: dispute.description }] : []),
          { label: "Opened", value: new Date(dispute.createdAt).toLocaleString() },
          ...(dispute.resolution ? [{ label: "Resolution", value: dispute.resolution }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
            <dd className="font-medium sm:text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <h3 className="font-semibold">Update dispute</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Status</span>
          <select
            className={adminInputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as Dispute["status"])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Resolution notes</span>
          <textarea
            className={`${adminInputCls} min-h-[6rem] resize-y`}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Outcome, refund details, or rejection reason…"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save resolution"}
        </button>
      </form>
    </div>
  );
}
