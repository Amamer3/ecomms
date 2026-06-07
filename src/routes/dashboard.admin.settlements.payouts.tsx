import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAdminPayouts, runAdminPayouts } from "@/lib/api";
import { ApiError, parseMoney } from "@/lib/api/client";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/settlements/payouts")({
  component: AdminPayoutsPage,
  head: () => ({ meta: [{ title: "Payouts — GoMarket Admin" }] }),
});

function AdminPayoutsPage() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);

  const { data: payouts = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: () => listAdminPayouts({ limit: 50 }),
  });

  const onRun = async () => {
    setRunning(true);
    try {
      const res = await runAdminPayouts();
      toast.success(`Created ${res.runs} payout run${res.runs === 1 ? "" : "s"}`);
      void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      void refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Payout run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Payout runs"
        description="Vendor and courier payout runs created from pending ledger entries."
      />

      <div className="mb-6">
        <button
          type="button"
          disabled={running}
          onClick={() => void onRun()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {running ? "Running…" : "Run payouts"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Creates vendor and rider payouts from pending settlement ledger entries.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading payouts…</p>
      ) : (
        <AdminDataTable
          title={`${payouts.length} payout run${payouts.length === 1 ? "" : "s"}`}
          headers={["Run ID", "Status", "Amount", "Created", "Completed"]}
          rows={payouts.map((p) => [
            p.id.slice(0, 8) + "…",
            p.status,
            formatGhs(parseMoney(p.totalAmount)),
            new Date(p.createdAt).toLocaleDateString(),
            p.completedAt ? new Date(p.completedAt).toLocaleDateString() : "—",
          ])}
        />
      )}
    </div>
  );
}
