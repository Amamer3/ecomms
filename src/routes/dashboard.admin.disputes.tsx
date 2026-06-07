import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminDisputes } from "@/lib/api";
import { adminInputCls, AdminPageHeader } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/disputes")({
  component: AdminDisputesPage,
  head: () => ({ meta: [{ title: "Disputes — GoMarket Admin" }] }),
});

const STATUSES = ["", "OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const;

function AdminDisputesPage() {
  const [status, setStatus] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string | undefined>();

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-disputes", appliedStatus],
    queryFn: () => listAdminDisputes({ status: appliedStatus, limit: 50 }),
  });

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedStatus(status || undefined);
  };

  return (
    <div>
      <AdminPageHeader
        title="Customer disputes"
        description="Review and resolve disputes opened by customers."
      />

      <form onSubmit={onFilter} className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block min-w-[12rem]">
          <span className="mb-1.5 block text-xs font-medium">Status filter</span>
          <select
            className={adminInputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Apply
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading disputes…</p>
      ) : (
        <ul className="space-y-3">
          {disputes.map((d) => (
            <li key={d.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to="/dashboard/admin/disputes/$disputeId"
                  params={{ disputeId: d.id }}
                  className="font-semibold text-primary hover:underline"
                >
                  {d.orderNumber ?? d.orderId}
                </Link>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{d.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {d.customerPhone ?? d.customerId} · {d.storeName ?? "—"} · {d.reason}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Opened {new Date(d.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {disputes.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No disputes match this filter
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
