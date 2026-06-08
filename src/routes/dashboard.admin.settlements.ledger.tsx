import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { generateLedger, listAdminLedger } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { AsyncState } from "@/components/AsyncState";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/settlements/ledger")({
  component: AdminLedgerPage,
  head: () => ({ meta: [{ title: "Ledger — GoMarket Admin" }] }),
});

function AdminLedgerPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: entries = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-ledger"],
    queryFn: () => listAdminLedger({ limit: 50 }),
  });

  const onGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateLedger();
      toast.success(`Created ${res.created} ledger entr${res.created === 1 ? "y" : "ies"}`);
      void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Ledger generation failed"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Settlement ledger"
        description="Ledger entries for vendor and courier settlements on completed paid orders."
      />

      <div className="mb-6">
        <button
          type="button"
          disabled={generating}
          onClick={() => void onGenerate()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {generating ? "Generating…" : "Generate ledger entries"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Creates settlement ledger entries for completed paid orders.
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading ledger…"
        errorTitle="Couldn't load ledger"
      >
        <AdminDataTable
          title={`${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}
          headers={["Type", "Status", "Amount", "Description", "Created"]}
          rows={entries.map((e) => [
            e.type,
            e.status,
            formatGhs(parseMoney(e.amount)),
            e.description ?? "—",
            new Date(e.createdAt).toLocaleDateString(),
          ])}
        />
      </AsyncState>
    </div>
  );
}
