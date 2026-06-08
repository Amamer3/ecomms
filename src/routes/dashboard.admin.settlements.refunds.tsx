import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAdminRefunds, processRefunds } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { AsyncState } from "@/components/AsyncState";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/settlements/refunds")({
  component: AdminRefundsPage,
  head: () => ({ meta: [{ title: "Refunds — GoMarket Admin" }] }),
});

function AdminRefundsPage() {
  const qc = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const { data: refunds = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: () => listAdminRefunds({ limit: 50 }),
  });

  const onProcess = async () => {
    setProcessing(true);
    try {
      const res = await processRefunds();
      toast.success(`Processed ${res.processed} refund(s)`);
      void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Refund processing failed"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Refunds"
        description="List refund records and scan rejected or cancelled paid orders to create refunds."
      />

      <div className="mb-6">
        <button
          type="button"
          disabled={processing}
          onClick={() => void onProcess()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {processing ? "Scanning…" : "Process refunds"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Scans rejected or cancelled paid orders and creates refund records.
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading refunds…"
        errorTitle="Couldn't load refunds"
      >
        <AdminDataTable
          title={`${refunds.length} refund${refunds.length === 1 ? "" : "s"}`}
          headers={["Payment ID", "Status", "Amount", "Order"]}
          rows={refunds.map((r) => [
            r.id.slice(0, 8) + "…",
            r.status,
            formatGhs(parseMoney(r.amount)),
            r.orderId.slice(0, 8) + "…",
          ])}
        />
      </AsyncState>
    </div>
  );
}
