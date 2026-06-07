import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRiderEarningsSummary, listRiderEarnings } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { CatalogDataTable } from "@/components/catalog/catalog-ui";
import { RiderDetailGrid, RiderPageHeader } from "@/components/rider/rider-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/delivery/earnings")({
  component: RiderEarningsPage,
  head: () => ({ meta: [{ title: "Courier earnings — GoMarket" }] }),
});

function RiderEarningsPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["rider-earnings"],
    queryFn: getRiderEarningsSummary,
  });

  const { data: ledger = [], isLoading: ledgerLoading } = useQuery({
    queryKey: ["rider-earnings-ledger"],
    queryFn: () => listRiderEarnings({ limit: 50 }),
  });

  return (
    <div>
      <RiderPageHeader
        title="Earnings"
        description="Balance summary and ledger entries for your courier account."
      />

      {summaryLoading ? (
        <p className="text-sm text-muted-foreground">Loading summary…</p>
      ) : summary ? (
        <RiderDetailGrid
          rows={[
            { label: "Available", value: formatGhs(parseMoney(summary.availableBalance)) },
            { label: "Pending", value: formatGhs(parseMoney(summary.pendingBalance)) },
            { label: "Lifetime", value: formatGhs(parseMoney(summary.lifetimeEarnings)) },
          ]}
        />
      ) : null}

      <div className="mt-8">
        {ledgerLoading ? (
          <p className="text-sm text-muted-foreground">Loading ledger…</p>
        ) : (
          <CatalogDataTable
            title={`${ledger.length} ledger entr${ledger.length === 1 ? "y" : "ies"}`}
            headers={["Type", "Amount", "Description", "Date"]}
            rows={ledger.map((e) => [
              e.type,
              formatGhs(parseMoney(e.amount)),
              e.description ?? "—",
              new Date(e.createdAt).toLocaleDateString(),
            ])}
          />
        )}
      </div>
    </div>
  );
}
